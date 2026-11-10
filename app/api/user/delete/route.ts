import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidateOrg } from "@/lib/revalidate-org";
import { isSameOrigin, foreignOriginResponse } from "@/lib/same-origin";

// Account deletion. Requires:
//  - same-origin request (CSRF),
//  - body { confirmEmail } equal to the account's email (case-insensitive),
//  - a sign-in within the last 15 minutes (last_sign_in_at from the auth
//    server, so it works the same for password and Google users). A stolen
//    or long-lived session alone can't delete the account.
const REAUTH_WINDOW_MS = 15 * 60_000;

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return foreignOriginResponse();

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null) as { confirmEmail?: unknown } | null;
  const confirmEmail = typeof body?.confirmEmail === "string" ? body.confirmEmail.trim().toLowerCase() : "";
  if (!user.email || !confirmEmail || confirmEmail !== user.email.toLowerCase()) {
    return NextResponse.json(
      { error: "Email не збігається з email акаунта", code: "email_mismatch" },
      { status: 400 },
    );
  }

  const lastSignIn = user.last_sign_in_at ? Date.parse(user.last_sign_in_at) : NaN;
  if (!(Date.now() - lastSignIn <= REAUTH_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Для видалення акаунта увійдіть ще раз", code: "reauth_required" },
      { status: 403 },
    );
  }

  const admin = createAdminClient();
  // If the account owns orgs and the delete cascades to them, their public
  // pages must stop being served from the ISR cache.
  const { data: ownedOrgs } = await admin.from("orgs").select("id, slug").eq("user_id", user.id);

  // Delete user data from all tables
  await Promise.allSettled([
    admin.from("applications").delete().eq("user_id", user.id),
    admin.from("profiles").delete().eq("id", user.id),
  ]);

  // Delete the auth user — this frees the email for re-registration
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  for (const o of ownedOrgs ?? []) await revalidateOrg({ id: o.id as string, slug: o.slug as string | null });
  return NextResponse.json({ ok: true });
}
