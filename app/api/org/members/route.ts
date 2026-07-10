import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get caller's org (owner or member)
  const { data: ownOrg } = await supabase.from("orgs").select("id, name, user_id").eq("user_id", user.id).maybeSingle();
  const { data: membership } = !ownOrg
    ? await supabase.from("org_members").select("org_id").eq("user_id", user.id).maybeSingle()
    : { data: null };

  const orgId = ownOrg?.id ?? membership?.org_id;
  if (!orgId) return NextResponse.json({ members: [] });

  const admin = createAdminClient();

  // Get invited members from org_members
  const { data: rows } = await admin
    .from("org_members")
    .select("id, user_id, role, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: true });

  const members: {
    id: string;
    userId: string;
    email: string;
    name: string;
    role: string;
    status: string;
    joinedAt: string;
  }[] = [];

  // Add org owner
  if (ownOrg) {
    const { data: ownerProfile } = await admin
      .from("profiles")
      .select("first_name, last_name, email")
      .eq("id", ownOrg.user_id)
      .maybeSingle();
    const ownerAuth = await admin.auth.admin.getUserById(ownOrg.user_id);
    const ownerEmail = ownerProfile?.email ?? ownerAuth.data.user?.email ?? "";
    const ownerFirst = ownerProfile?.first_name ?? "";
    const ownerLast  = ownerProfile?.last_name  ?? "";
    members.push({
      id:       `owner-${ownOrg.user_id}`,
      userId:   ownOrg.user_id,
      email:    ownerEmail,
      name:     ownerFirst ? `${ownerFirst} ${ownerLast}`.trim() : ownerEmail.split("@")[0],
      role:     "owner",
      status:   "active",
      joinedAt: "",
    });
  }

  // Add invited members
  for (const row of rows ?? []) {
    const { data: profile } = await admin
      .from("profiles")
      .select("first_name, last_name, email")
      .eq("id", row.user_id)
      .maybeSingle();
    const authUser = await admin.auth.admin.getUserById(row.user_id);
    const email = profile?.email ?? authUser.data.user?.email ?? "";
    const first = profile?.first_name ?? "";
    const last  = profile?.last_name  ?? "";
    members.push({
      id:       row.id as string,
      userId:   row.user_id as string,
      email,
      name:     first ? `${first} ${last}`.trim() : email.split("@")[0],
      role:     row.role as string,
      status:   "active",
      joinedAt: (row.created_at as string)?.split("T")[0] ?? "",
    });
  }

  return NextResponse.json({ members });
}
