import { NextResponse } from "next/server";
import sharp from "sharp";
import { createAdminClient } from "@/lib/supabase/admin";
import { COVER_MAX_BYTES } from "@/lib/cover-photo";
import { fetchRemoteImage } from "@/lib/remote-image";

// Org profile images (square logo, wide cover) as files in Storage instead of
// base64 data URLs in orgs.logo_url / orgs.cover_image_url. Server-side only;
// same pattern as lib/showcase-logo.ts. Bucket "org-media" is public with no
// storage policies: only the service role writes, files are read by URL.

export const ORG_MEDIA_BUCKET = "org-media";
export type OrgMediaKind = "logo" | "cover";

const SPEC = {
  logo:  { width: 256,  height: 256, quality: 85, column: "logo_url" },
  cover: { width: 1600, height: 229, quality: 80, column: "cover_image_url" }, // 7:1, as in the cover picker
} as const;

const DECODABLE = ["jpeg", "png", "webp", "gif", "avif", "tiff"];
const UNSUPPORTED_FORMAT = "Формат не підтримується — завантажте JPG, PNG або WebP";
const HEIC_FORMAT = "Формат HEIC (фото з iPhone) не підтримується — збережіть зображення як JPG або PNG";
const TOO_LARGE = "Файл більший за 4 МБ";

export class OrgMediaInputError extends Error {
  constructor(message: string, readonly status: 400 | 404 = 400) {
    super(message);
  }
}

export function parseOrgMediaKind(value: string | null): OrgMediaKind {
  if (value === "logo" || value === "cover") return value;
  throw new OrgMediaInputError("Невідомий тип зображення");
}

/** Prefix of public URLs of THIS org's files in our bucket. */
function ownPrefix(orgId: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${ORG_MEDIA_BUCKET}/${orgId}/`;
}

/**
 * True only for a URL of a file this code stored for this org:
 * <supabase>/storage/v1/object/public/org-media/<orgId>/(logo|cover)-<ts>.webp
 */
export function isOwnOrgMediaUrl(url: unknown, orgId: string): url is string {
  if (typeof url !== "string") return false;
  const prefix = ownPrefix(orgId);
  if (!url.startsWith(prefix)) return false;
  return /^(logo|cover)-\d+\.webp$/.test(url.slice(prefix.length));
}

/** Deletes a file we stored for this org. Anything else (data:, external, other org) is ignored. Best-effort. */
export async function deleteOwnOrgMediaFile(url: unknown, orgId: string): Promise<void> {
  if (!isOwnOrgMediaUrl(url, orgId)) return;
  const path = `${orgId}/${url.slice(ownPrefix(orgId).length)}`;
  const { error } = await createAdminClient().storage.from(ORG_MEDIA_BUCKET).remove([path]);
  if (error) console.error("[org-media] file delete failed:", error.message, path);
}

/** Decodes, crops to the kind's box (fit cover), re-encodes as WebP. Metadata is not kept. */
export async function processOrgMedia(kind: OrgMediaKind, input: Buffer): Promise<Buffer> {
  if (input.length === 0) throw new OrgMediaInputError("Порожній файл");
  if (input.length > COVER_MAX_BYTES) throw new OrgMediaInputError(TOO_LARGE);
  let format: string | undefined;
  let compression: string | undefined;
  try {
    ({ format, compression } = await sharp(input).metadata());
  } catch {
    throw new OrgMediaInputError(UNSUPPORTED_FORMAT);
  }
  // sharp reports AVIF as "heif" too; only non-AV1 HEIF (iPhone HEIC) can't be decoded.
  if (format === "heif") {
    if (compression !== "av1") throw new OrgMediaInputError(HEIC_FORMAT);
    format = "avif";
  }
  if (!format || !DECODABLE.includes(format)) throw new OrgMediaInputError(UNSUPPORTED_FORMAT);
  const { width, height, quality } = SPEC[kind];
  try {
    return await sharp(input, { animated: false })
      .rotate()
      .resize(width, height, { fit: "cover", position: "centre" })
      .webp({ quality })
      .toBuffer();
  } catch {
    throw new OrgMediaInputError("Не вдалося обробити зображення");
  }
}

/**
 * Reads the image from the request: multipart field "file", or JSON { url }
 * (cover only — the "link" tab), downloaded server-side with SSRF guards.
 */
export async function readOrgMediaInput(req: Request, kind: OrgMediaKind): Promise<Buffer> {
  const type = req.headers.get("content-type") ?? "";
  if (type.includes("multipart/form-data")) {
    const form = await req.formData().catch(() => { throw new OrgMediaInputError("Не вдалося прочитати файл"); });
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) throw new OrgMediaInputError("Оберіть файл зображення");
    if (/heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)) throw new OrgMediaInputError(HEIC_FORMAT);
    if (file.size > COVER_MAX_BYTES) throw new OrgMediaInputError(TOO_LARGE);
    return Buffer.from(await file.arrayBuffer());
  }
  if (kind !== "cover") throw new OrgMediaInputError("Оберіть файл зображення");
  const body = await req.json().catch(() => null) as { url?: unknown } | null;
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  if (!url) throw new OrgMediaInputError("Вкажіть посилання на зображення");
  try {
    return await fetchRemoteImage(url);
  } catch (e) {
    throw new OrgMediaInputError(e instanceof Error ? e.message : "Не вдалося завантажити зображення");
  }
}

/**
 * Full replace flow: process → upload new file → point the row at it →
 * delete the previous file (only if it was ours). The new file is removed
 * again if the row update fails. A new cover image also clears a video cover,
 * as the picker does.
 */
export async function setOrgMedia(orgId: string, kind: OrgMediaKind, input: Buffer): Promise<string> {
  const admin = createAdminClient();
  const column = SPEC[kind].column;
  const { data: org, error: readError } = await admin
    .from("orgs").select(`id, ${column}`).eq("id", orgId).maybeSingle();
  if (readError) throw new Error(readError.message);
  if (!org) throw new OrgMediaInputError("Організацію не знайдено", 404);
  const previous = (org as Record<string, unknown>)[column];

  const webp = await processOrgMedia(kind, input);
  const path = `${orgId}/${kind}-${Date.now()}.webp`;
  const { error: uploadError } = await admin.storage
    .from(ORG_MEDIA_BUCKET)
    .upload(path, webp, { contentType: "image/webp", upsert: false, cacheControl: "31536000" });
  if (uploadError) throw new Error(`Не вдалося завантажити зображення: ${uploadError.message}`);
  const url = admin.storage.from(ORG_MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;

  const patch: Record<string, string | null> = { [column]: url };
  if (kind === "cover") patch.cover_video_url = null;
  const { error } = await admin.from("orgs").update(patch).eq("id", orgId);
  if (error) {
    await deleteOwnOrgMediaFile(url, orgId);
    throw new Error(error.message);
  }
  await deleteOwnOrgMediaFile(previous, orgId);
  return url;
}

/** Clears the image: nulls the column, then deletes our file (data:/external values are just dropped). */
export async function clearOrgMedia(orgId: string, kind: OrgMediaKind): Promise<void> {
  const admin = createAdminClient();
  const column = SPEC[kind].column;
  const { data: org, error: readError } = await admin
    .from("orgs").select(`id, ${column}`).eq("id", orgId).maybeSingle();
  if (readError) throw new Error(readError.message);
  if (!org) throw new OrgMediaInputError("Організацію не знайдено", 404);
  const { error } = await admin.from("orgs").update({ [column]: null }).eq("id", orgId);
  if (error) throw new Error(error.message);
  await deleteOwnOrgMediaFile((org as Record<string, unknown>)[column], orgId);
}

export function orgMediaErrorResponse(e: unknown): NextResponse {
  if (e instanceof OrgMediaInputError) return NextResponse.json({ error: e.message }, { status: e.status });
  console.error("[org-media]", e);
  return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
}
