import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// DELETE — remove member from org
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = params;

  // Caller must be the org owner
  const admin = createAdminClient();
  const { data: org } = await admin.from("orgs").select("id").eq("user_id", user.id).maybeSingle();
  if (!org) return NextResponse.json({ error: "Only org owner can remove members" }, { status: 403 });

  // Remove from org_members
  await admin.from("org_members").delete().eq("org_id", org.id).eq("user_id", userId);

  // Check if user is a member of any other org
  const { data: otherMembership } = await admin
    .from("org_members")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  // If not member of any org, remove has_org_access flag
  if (!otherMembership) {
    const { data: targetUser } = await admin.auth.admin.getUserById(userId);
    if (targetUser.user) {
      const meta = { ...targetUser.user.user_metadata };
      delete meta.has_org_access;
      await admin.auth.admin.updateUserById(userId, { user_metadata: meta });
    }
  }

  return NextResponse.json({ ok: true });
}

// PATCH — update member role
export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role } = await req.json() as { role: string };
  if (!role) return NextResponse.json({ error: "Missing role" }, { status: 400 });

  const { userId } = params;

  // Caller must be the org owner
  const admin = createAdminClient();
  const { data: org } = await admin.from("orgs").select("id").eq("user_id", user.id).maybeSingle();
  if (!org) return NextResponse.json({ error: "Only org owner can change roles" }, { status: 403 });

  const { error } = await admin
    .from("org_members")
    .update({ role })
    .eq("org_id", org.id)
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
