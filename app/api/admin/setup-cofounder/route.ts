import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const COFOUNDER_EMAIL = "liliianezhelska@gmail.com";
const ORG_SLUG = "mozhuvo";

export async function POST() {
  // Only admins can call this
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

  // Find or invite the co-founder
  const { data: { users: existing } } = await admin.auth.admin.listUsers();
  const existingUser = existing.find((u) => u.email === COFOUNDER_EMAIL);

  let cofounderUserId: string;

  if (existingUser) {
    cofounderUserId = existingUser.id;
  } else {
    // Invite by email — sends a magic link to register
    const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
      COFOUNDER_EMAIL,
      { redirectTo: "https://mozhyvo.com.ua/dashboard" }
    );
    if (inviteErr || !invited.user) {
      return NextResponse.json({ error: inviteErr?.message ?? "Invite failed" }, { status: 500 });
    }
    cofounderUserId = invited.user.id;
  }

  // Set profile role to "admin" (gives admin panel access)
  await admin.from("profiles").upsert(
    { id: cofounderUserId, role: "admin" },
    { onConflict: "id" }
  );

  // Add to org_members as owner (gives full dashboard access)
  const { data: existing_member } = await admin
    .from("org_members")
    .select("id")
    .eq("org_id", org.id)
    .eq("user_id", cofounderUserId)
    .maybeSingle();

  if (!existing_member) {
    await admin.from("org_members").insert({
      org_id: org.id,
      user_id: cofounderUserId,
      role: "owner",
    });
  } else {
    await admin.from("org_members")
      .update({ role: "owner" })
      .eq("org_id", org.id)
      .eq("user_id", cofounderUserId);
  }

  return NextResponse.json({
    ok: true,
    status: existingUser ? "existing_user_updated" : "invited",
    email: COFOUNDER_EMAIL,
    userId: cofounderUserId,
    orgId: org.id,
    role: "admin + org owner",
  });
}
