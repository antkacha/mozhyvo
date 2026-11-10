import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import sharp from "sharp";
import { requireActiveOrg } from "@/lib/active-org";
import { createAdminClient } from "@/lib/supabase/admin";
import { COVER_WIDTH, COVER_HEIGHT, COVER_BUCKET, COVER_THUMB_WIDTH, COVER_THUMB_HEIGHT, COVER_THUMB_QUALITY } from "@/lib/cover-photo";
import { COVER_FILE, COVER_THUMB_FILE } from "@/lib/cover-url";
import { fetchRemoteImage } from "@/lib/remote-image";

export const runtime = "nodejs";
// Vercel Hobby's hard function limit is 10s — this route must always
// finish (success or a clean caught error) inside that ceiling, so a
// killed function never reaches the client instead of our own JSON error.
// TOTAL_FETCH_BUDGET_MS below bounds the external-fetch phase to leave
// the remaining ~2s for sharp + Storage upload + the DB write.
export const maxDuration = 9;

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await requireActiveOrg();
  if (ctx.response) return ctx.response;
  const orgId = ctx.org.id;

  const admin = createAdminClient();
  const { data: project } = await admin
    .from("org_projects")
    .select("id")
    .eq("id", params.id)
    .eq("org_id", orgId)
    .maybeSingle();
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const body = await req.json().catch(() => null) as { url?: string } | null;
  const url = body?.url?.trim();
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  try {
    const raw = await fetchRemoteImage(url);
    const jpeg = await sharp(raw)
      .resize(COVER_WIDTH, COVER_HEIGHT, { fit: "cover", position: "centre" })
      .jpeg({ quality: 78 })
      .toBuffer();

    const path = `${params.id}/${COVER_FILE}`;
    const { error: uploadError } = await admin.storage
      .from(COVER_BUCKET)
      .upload(path, jpeg, { contentType: "image/jpeg", upsert: true, cacheControl: "31536000" });
    if (uploadError) throw new Error(uploadError.message);

    // Card thumbnail next to the cover (from the 1280x720 result, so always a
    // downscale). Never fails the cover import: cards fall back to the full
    // cover when the thumb is missing.
    const thumbPath = `${params.id}/${COVER_THUMB_FILE}`;
    try {
      const thumb = await sharp(jpeg)
        .resize(COVER_THUMB_WIDTH, COVER_THUMB_HEIGHT, { fit: "cover", position: "centre", withoutEnlargement: true })
        .jpeg({ quality: COVER_THUMB_QUALITY })
        .toBuffer();
      const { error: thumbError } = await admin.storage
        .from(COVER_BUCKET)
        .upload(thumbPath, thumb, { contentType: "image/jpeg", upsert: true, cacheControl: "31536000" });
      if (thumbError) throw new Error(thumbError.message);
    } catch (e) {
      console.error("[cover] thumbnail upload failed, cards will use the full cover:", e);
      // Don't leave a previous cover's thumb behind under the new ?v=.
      await admin.storage.from(COVER_BUCKET).remove([thumbPath]).catch(() => {});
    }

    const { data: { publicUrl } } = admin.storage.from(COVER_BUCKET).getPublicUrl(path);
    const photoUrl = `${publicUrl}?v=${Date.now()}`;

    const { error: updateError } = await admin
      .from("org_projects")
      .update({ photo_url: photoUrl })
      .eq("id", params.id)
      .eq("org_id", orgId);
    if (updateError) throw new Error(updateError.message);

    revalidateTag("projects");
    return NextResponse.json({ photoUrl });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 400 });
  }
}
