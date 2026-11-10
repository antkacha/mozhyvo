import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidateOrg } from "@/lib/revalidate-org";

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
