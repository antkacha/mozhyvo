import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { bootstrapOrgFromMetadata } from "@/lib/org-bootstrap";

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

  // Defensive fallback — the real bootstrap now runs in /auth/confirm right
  // after email verification, before the user ever reaches /dashboard (see
  // lib/org-bootstrap.ts for why). This stays as a self-heal path for any
  // account whose metadata says "org" but doesn't have a row yet.
  const bootstrapped = await bootstrapOrgFromMetadata(admin, user);
  if (bootstrapped) return NextResponse.json({ org: bootstrapped, role: "owner" });

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
