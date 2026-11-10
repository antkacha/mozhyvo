import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgForRequest, requireActiveOrg } from "@/lib/active-org";
import { ORG_PROFILE_SELECT } from "@/lib/org-profile";
import { isOwnOrgMediaUrl, deleteOwnOrgMediaFile } from "@/lib/org-media";
import { revalidateOrg } from "@/lib/revalidate-org";

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
    // Only the columns the dashboard reads (lib/org-profile), not select("*").
    const { data: rows, error } = await admin.from("orgs").select(ORG_PROFILE_SELECT).eq("id", active.id).limit(1);
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

// Profile columns an org owner may edit — exactly what the edit form sends
// (useOrgSession's toRow). Same pattern as ALLOWED_PROJECT_FIELDS in
// app/api/org/projects/[id]. Anything else in the body — status, user_id,
// id, slug, verified_at, rejection_reason, created_at, registration data —
// is dropped: moderation and ownership are never writable from here.
const ALLOWED_ORG_FIELDS = new Set([
  "name", "type", "country", "city", "website", "phone", "contact_email",
  "description", "mission", "founded",
  "logo_url", "cover_image_url", "cover_video_url", "brand_color",
  "focus_areas", "socials",
]);

export async function PATCH(req: Request) {
  // Editing the org profile is owner-only; admin members manage opportunities.
  const ctx = await requireActiveOrg({ ownerOnly: true, ownerOnlyMessage: "Лише власник може редагувати профіль організації" });
  if (ctx.response) return ctx.response;
  const orgId = ctx.org.id;

  const admin = createAdminClient();

  const body = await req.json().catch(() => null) as unknown;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const safeBody = Object.fromEntries(
    Object.entries(body).filter(([k]) => ALLOWED_ORG_FIELDS.has(k))
  );
  if (Object.keys(safeBody).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  // Logo / cover images are uploaded through POST /api/org/media, which writes
  // the file to Storage and the URL to the row. Here they may only be cleared
  // (null) or set to one of THIS org's own org-media files — never a base64
  // data: URL or an external link.
  const mediaCols = (["logo_url", "cover_image_url"] as const).filter((c) => c in safeBody);
  for (const col of mediaCols) {
    const v = safeBody[col];
    if (v !== null && !isOwnOrgMediaUrl(v, orgId)) {
      return NextResponse.json(
        { error: "Логотип і обкладинку можна змінити лише завантаженням файлу" },
        { status: 400 },
      );
    }
  }
  let previousMedia: Record<string, unknown> = {};
  if (mediaCols.length) {
    const { data } = await admin.from("orgs").select(mediaCols.join(", ")).eq("id", orgId).maybeSingle();
    previousMedia = (data ?? {}) as Record<string, unknown>;
  }

  // .select("id").single() still proves exactly one row was written (0 rows →
  // error), without echoing the row — that sent base64 images back on every
  // save. The client merges what it sent into its cache.
  const { error } = await admin
    .from("orgs")
    .update(safeBody)
    .eq("id", orgId)
    .select("id")
    .single();

  if (error) {
    console.error("[PATCH /api/me/org] update error:", error.message, "orgId:", orgId);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  // Files of ours that the row no longer points to (e.g. cover removed or
  // replaced by a video). Legacy data:/external values are simply dropped.
  for (const col of mediaCols) {
    if (previousMedia[col] !== safeBody[col]) await deleteOwnOrgMediaFile(previousMedia[col], orgId);
  }
  await revalidateOrg({ id: orgId });
  console.log("[PATCH /api/me/org] saved:", { id: orgId, fields: Object.keys(safeBody) });
  return NextResponse.json({ ok: true });
}
