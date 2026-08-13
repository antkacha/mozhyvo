import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ org: null, role: null });

  const admin = createAdminClient();

  // Try to find org owned by this user (bypasses RLS)
  const { data: org } = await admin
    .from("orgs")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (org) return NextResponse.json({ org, role: "owner" });

  // Check team membership
  const { data: membership } = await admin
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membership) {
    const { data: memberOrg } = await admin
      .from("orgs")
      .select("*")
      .eq("id", membership.org_id)
      .single();
    if (memberOrg) return NextResponse.json({ org: memberOrg, role: membership.role });
  }

  // Deliberately no bootstrap fallback here. bootstrapOrgFromMetadata only
  // ever runs once, from /auth/confirm right after email verification — a
  // fallback here used to re-run it on every dashboard load, which meant it
  // silently recreated an org an admin had just deleted: user_metadata.role
  // stays "org" forever (nothing clears it on delete on its own), so this
  // "self-heal" was actually a resurrection hole. If /auth/confirm's
  // bootstrap ever fails, that's a real dead end now — the fix is fixing
  // that path, not papering over it here.
  return NextResponse.json({ org: null, role: null });
}

export async function PATCH(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  // Resolve the org ID for this user (owner or member)
  let orgId: string | null = null;
  const { data: ownedOrg } = await admin
    .from("orgs")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (ownedOrg) {
    orgId = ownedOrg.id;
  } else {
    const { data: membership } = await admin
      .from("org_members")
      .select("org_id")
      .eq("user_id", user.id)
      .maybeSingle();
    orgId = membership?.org_id ?? null;
  }

  if (!orgId) return NextResponse.json({ error: "No org found" }, { status: 404 });

  const body = await req.json() as Record<string, unknown>;

  // Update and return the saved row so the client can verify what was actually written
  const { data: savedOrg, error } = await admin
    .from("orgs")
    .update(body)
    .eq("id", orgId)
    .select()
    .single();

  if (error) {
    console.error("[PATCH /api/me/org] update error:", error.message, "orgId:", orgId);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  console.log("[PATCH /api/me/org] saved:", {
    id: savedOrg?.id, slug: savedOrg?.slug,
    website: savedOrg?.website, socials: savedOrg?.socials,
  });
  return NextResponse.json({ ok: true, org: savedOrg });
}
