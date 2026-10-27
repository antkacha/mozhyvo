import { NextResponse } from "next/server";
import sharp from "sharp";
import { createAdminClient } from "@/lib/supabase/admin";
import { COVER_ALLOWED_TYPES, COVER_MAX_BYTES } from "@/lib/cover-photo";
import { revalidatePartners } from "@/lib/partners";

// The wide "showcase" logo an org shows in the homepage partner strip.
// Separate from orgs.logo_url (the small square avatar). Server-side only.

export const SHOWCASE_BUCKET = "partners";
export const SHOWCASE_MAX_WIDTH = 600;
export const SHOWCASE_MAX_HEIGHT = 240;

export class ShowcaseInputError extends Error {
  constructor(message: string, readonly status: 400 | 404 = 400) {
    super(message);
  }
}

/**
 * Same checks as cover uploads (JPG/PNG/WebP, at most 4 MB) plus a real
 * decode, then fits inside 600×240 without enlarging and re-encodes as
 * WebP, keeping transparency.
 */
export async function processShowcaseLogo(file: File): Promise<Buffer> {
  if (!COVER_ALLOWED_TYPES.includes(file.type)) throw new ShowcaseInputError("Логотип: тільки JPG, PNG або WebP");
  if (file.size > COVER_MAX_BYTES) throw new ShowcaseInputError("Логотип більший за 4 МБ");
  if (file.size === 0) throw new ShowcaseInputError("Порожній файл");
  const input = Buffer.from(await file.arrayBuffer());
  let format: string | undefined;
  try {
    ({ format } = await sharp(input).metadata());
  } catch {
    throw new ShowcaseInputError("Файл не є зображенням");
  }
  // The declared MIME type comes from the client; check what actually decoded.
  if (!format || !["jpeg", "png", "webp"].includes(format)) {
    throw new ShowcaseInputError("Логотип: тільки JPG, PNG або WebP");
  }
  try {
    return await sharp(input)
      .rotate()
      .resize(SHOWCASE_MAX_WIDTH, SHOWCASE_MAX_HEIGHT, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 90, alphaQuality: 100 })
      .toBuffer();
  } catch {
    throw new ShowcaseInputError("Не вдалося обробити зображення");
  }
}

/** Uploads a processed logo; returns its public URL. A new path per upload, so no cache-busting needed. */
export async function uploadShowcaseLogo(orgId: string, webp: Buffer): Promise<string> {
  const admin = createAdminClient();
  const path = `orgs/${orgId}-${Date.now()}.webp`;
  const { error } = await admin.storage
    .from(SHOWCASE_BUCKET)
    .upload(path, webp, { contentType: "image/webp", upsert: false, cacheControl: "31536000" });
  if (error) throw new Error(`Не вдалося завантажити логотип: ${error.message}`);
  return admin.storage.from(SHOWCASE_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Deletes a showcase file we stored. Ignores URLs outside orgs/ in our bucket. Best-effort. */
export async function deleteShowcaseFile(url: string | null | undefined): Promise<void> {
  if (!url) return;
  const marker = `/storage/v1/object/public/${SHOWCASE_BUCKET}/`;
  const at = url.indexOf(marker);
  if (at === -1) return;
  const path = decodeURIComponent(url.slice(at + marker.length).split("?")[0]);
  if (!path.startsWith("orgs/") || path.includes("..")) return;
  const { error } = await createAdminClient().storage.from(SHOWCASE_BUCKET).remove([path]);
  if (error) console.error("[showcase-logo] file delete failed:", error.message, path);
}

/**
 * Full replace flow for one org, used by both the owner route and the admin
 * route: process → upload → point the row at the new file → delete the old
 * file. The new file is removed again if anything after the upload fails.
 */
export async function setOrgShowcaseLogo(orgId: string, file: File): Promise<string> {
  const admin = createAdminClient();
  const { data: org, error: readError } = await admin
    .from("orgs").select("id, showcase_logo_url").eq("id", orgId).maybeSingle();
  if (readError) throw new Error(readError.message);
  if (!org) throw new ShowcaseInputError("Організацію не знайдено", 404);

  const webp = await processShowcaseLogo(file);
  const url = await uploadShowcaseLogo(orgId, webp);
  const { error } = await admin.from("orgs").update({ showcase_logo_url: url }).eq("id", orgId);
  if (error) {
    await deleteShowcaseFile(url);
    throw new Error(error.message);
  }
  await deleteShowcaseFile(org.showcase_logo_url as string | null);
  revalidatePartners();
  return url;
}

/** Clears an org's showcase logo: nulls the column, then deletes the file. */
export async function clearOrgShowcaseLogo(orgId: string): Promise<void> {
  const admin = createAdminClient();
  const { data: org, error: readError } = await admin
    .from("orgs").select("id, showcase_logo_url").eq("id", orgId).maybeSingle();
  if (readError) throw new Error(readError.message);
  if (!org) throw new ShowcaseInputError("Організацію не знайдено", 404);

  const { error } = await admin.from("orgs").update({ showcase_logo_url: null }).eq("id", orgId);
  if (error) throw new Error(error.message);
  await deleteShowcaseFile(org.showcase_logo_url as string | null);
  revalidatePartners();
}

/** Reads the "logo" file from a multipart body, or throws a 400. */
export async function readLogoFile(req: Request): Promise<File> {
  const form = await req.formData().catch(() => {
    throw new ShowcaseInputError("Очікується multipart/form-data");
  });
  const file = form.get("logo");
  if (!(file instanceof File) || file.size === 0) throw new ShowcaseInputError("Оберіть файл логотипу");
  return file;
}

export function showcaseErrorResponse(e: unknown): NextResponse {
  if (e instanceof ShowcaseInputError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  console.error("[showcase-logo]", e);
  return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
}
