import { NextRequest, NextResponse } from "next/server";
import { requireActiveOrg } from "@/lib/active-org";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertAffected, ApiError } from "@/lib/supabase/assert-rows";

// DELETE — remove member from org
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const ctx = await requireActiveOrg({ ownerOnly: true, ownerOnlyMessage: "Only org owner can remove members" });
  if (ctx.response) return ctx.response;
  const { org } = ctx;

  const { userId } = params;

  const admin = createAdminClient();

  try {
    assertAffected(
      await admin
        .from("org_members")
        .delete()
        .eq("org_id", org.id)
        .eq("user_id", userId)
        .select("id"),
      "Member"
    );
  } catch (e) {
    if (e instanceof ApiError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  // Remove has_org_access flag if user has no remaining memberships
  // (limit(1), not maybeSingle — that errored to null for 2+ memberships and
  // stripped the flag from someone who still belonged to other orgs).
  const { data: otherMemberships, error: otherError } = await admin
    .from("org_members")
    .select("id")
    .eq("user_id", userId)
    .limit(1);

  if (!otherError && !otherMemberships?.length) {
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
  const ctx = await requireActiveOrg({ ownerOnly: true, ownerOnlyMessage: "Only org owner can change roles" });
  if (ctx.response) return ctx.response;
  const { org } = ctx;

  const { role } = await req.json() as { role: string };
  if (!role) return NextResponse.json({ error: "Missing role" }, { status: 400 });

  const { userId } = params;

  const admin = createAdminClient();

  try {
    assertAffected(
      await admin
        .from("org_members")
        .update({ role })
        .eq("org_id", org.id)
        .eq("user_id", userId)
        .select("id"),
      "Member"
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof ApiError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
