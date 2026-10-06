import { NextResponse } from "next/server";
import { requireActiveOrg } from "@/lib/active-org";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const ctx = await requireActiveOrg();
  if (ctx.response) {
    // No org at all is an empty team, as before; auth/DB errors pass through.
    return ctx.response.status === 403 ? NextResponse.json({ members: [] }) : ctx.response;
  }
  const orgId = ctx.org.id;

  const admin = createAdminClient();

  // The active org's owner (orgs.user_id). Owners have no org_members row, so
  // they're added as a synthetic entry — for every viewer, not just the owner.
  const { data: orgRows } = await admin.from("orgs").select("user_id").eq("id", orgId).limit(1);
  const ownerUserId = (orgRows?.[0]?.user_id as string | undefined) ?? null;

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
  if (ownerUserId) {
    const { data: ownerProfile } = await admin
      .from("profiles")
      .select("first_name, last_name, email")
      .eq("id", ownerUserId)
      .maybeSingle();
    const ownerAuth = await admin.auth.admin.getUserById(ownerUserId);
    const ownerEmail = ownerProfile?.email ?? ownerAuth.data.user?.email ?? "";
    const ownerFirst = ownerProfile?.first_name ?? "";
    const ownerLast  = ownerProfile?.last_name  ?? "";
    members.push({
      id:       `owner-${ownerUserId}`,
      userId:   ownerUserId,
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
