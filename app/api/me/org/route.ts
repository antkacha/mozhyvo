import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgForRequest, requireActiveOrg } from "@/lib/active-org";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ org: null, role: null });

  // The org the user is acting as right now (mzv_active_org cookie, validated
  // against their real ownership/memberships — see lib/active-org).
  let active;
  try {
    active = await getActiveOrgForRequest(user.id);
  } catch (e) {
    console.error("[GET /api/me/org] org lookup failed:", e);
    return NextResponse.json({ error: "Не вдалося завантажити організацію" }, { status: 500 });
  }

  if (active) {
    const admin = createAdminClient();
    const { data: rows, error } = await admin.from("orgs").select("*").eq("id", active.id).limit(1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (rows?.[0]) return NextResponse.json({ org: rows[0], role: active.role });
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
  // Editing the org profile is owner-only; admin members manage opportunities.
  const ctx = await requireActiveOrg({ ownerOnly: true, ownerOnlyMessage: "Лише власник може редагувати профіль організації" });
  if (ctx.response) return ctx.response;
  const orgId = ctx.org.id;

  const admin = createAdminClient();

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
