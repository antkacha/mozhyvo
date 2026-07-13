import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const COFOUNDER_EMAIL = "liliianezhelska@gmail.com";
const ORG_SLUG = "mozhuvo";

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  const { data: callerProfile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (callerProfile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get the МОЖUВО org
  const { data: org } = await admin
    .from("orgs")
    .select("id")
    .eq("slug", ORG_SLUG)
    .maybeSingle();

  if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  // Find the co-founder by email (all pages of users)
  let cofounderUserId: string | null = null;
  let page = 1;
  while (!cofounderUserId) {
    const { data: { users } } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (!users.length) break;
    const found = users.find((u) => u.email === COFOUNDER_EMAIL);
    if (found) { cofounderUserId = found.id; break; }
    if (users.length < 1000) break;
    page++;
  }

  let inviteStatus = "existing_user_updated";

  if (!cofounderUserId) {
    // Not registered yet — send invite
    const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
      COFOUNDER_EMAIL,
      { redirectTo: "https://mozhyvo.com.ua/dashboard" }
    );
    if (inviteErr || !invited.user) {
      return NextResponse.json({ error: inviteErr?.message ?? "Invite failed" }, { status: 500 });
    }
    cofounderUserId = invited.user.id;
    inviteStatus = "invited";
  }

  // Set profile role to "admin"
  const { error: profileErr } = await admin.from("profiles").upsert(
    { id: cofounderUserId, role: "admin" },
    { onConflict: "id" }
  );

  // Delete any stale org_members rows for this org+user, then re-insert fresh
  await admin.from("org_members")
    .delete()
    .eq("org_id", org.id)
    .eq("user_id", cofounderUserId);

  const { error: memberErr } = await admin.from("org_members").insert({
    org_id: org.id,
    user_id: cofounderUserId,
    role: "owner",
  });

  return NextResponse.json({
    ok: !profileErr && !memberErr,
    status: inviteStatus,
    email: COFOUNDER_EMAIL,
    userId: cofounderUserId,
    orgId: org.id,
    role: "admin + org owner",
    errors: {
      profile: profileErr?.message ?? null,
      member: memberErr?.message ?? null,
    },
  });
}
