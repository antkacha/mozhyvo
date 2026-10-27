import { NextResponse } from "next/server";
import sharp from "sharp";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { COVER_ALLOWED_TYPES, COVER_MAX_BYTES } from "@/lib/cover-photo";

export const PARTNERS_BUCKET = "partners";
export const LOGO_MAX_WIDTH = 600;
export const LOGO_MAX_HEIGHT = 240;
const NAME_MAX = 120;
const LINK_MAX = 500;

/** Same check as every other /api/admin route: 401 no login, 403 not admin. */
export async function requireAdmin(): Promise<NextResponse | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return null;
}

export class PartnerInputError extends Error {}

export function parseName(raw: FormDataEntryValue | null): string {
  const name = typeof raw === "string" ? raw.trim() : "";
  if (!name) throw new PartnerInputError("Вкажіть назву партнера");
  if (name.length > NAME_MAX) throw new PartnerInputError(`Назва — до ${NAME_MAX} символів`);
  return name;
}

/** Empty → null. Otherwise must be an absolute http(s) URL (the DB enforces this too). */
export function parseLink(raw: FormDataEntryValue | null): string | null {
  const link = typeof raw === "string" ? raw.trim() : "";
  if (!link) return null;
  if (link.length > LINK_MAX || !/^https?:\/\//i.test(link)) {
    throw new PartnerInputError("Посилання має починатися з http:// або https://");
  }
  try {
    new URL(link);
  } catch {
    throw new PartnerInputError("Некоректне посилання");
  }
  return link;
}

export function parseBool(raw: FormDataEntryValue | null): boolean | undefined {
  if (raw === "true") return true;
  if (raw === "false") return false;
  return undefined;
}

/**
 * Validates an uploaded logo the way covers are validated (JPG/PNG/WebP,
 * ≤ 4 MB) plus an actual decode, then fits it inside 600×240 without
 * enlarging and re-encodes as WebP, keeping transparency.
 */
export async function processLogo(file: File): Promise<Buffer> {
  if (!COVER_ALLOWED_TYPES.includes(file.type)) throw new PartnerInputError("Логотип: тільки JPG, PNG або WebP");
  if (file.size > COVER_MAX_BYTES) throw new PartnerInputError("Логотип більший за 4 МБ");
  if (file.size === 0) throw new PartnerInputError("Порожній файл");
  const input = Buffer.from(await file.arrayBuffer());
  let format: string | undefined;
  try {
    ({ format } = await sharp(input).metadata());
  } catch {
    throw new PartnerInputError("Файл не є зображенням");
  }
  // The declared MIME type is client-controlled; check what actually decoded.
  if (!format || !["jpeg", "png", "webp"].includes(format)) {
    throw new PartnerInputError("Логотип: тільки JPG, PNG або WebP");
  }
  try {
    return await sharp(input)
      .rotate()
      .resize(LOGO_MAX_WIDTH, LOGO_MAX_HEIGHT, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 90, alphaQuality: 100 })
      .toBuffer();
  } catch {
    throw new PartnerInputError("Не вдалося обробити зображення");
  }
}

/** Uploads a processed logo; returns its public URL. A fresh path per upload, so no cache-busting needed. */
export async function uploadLogo(partnerId: string, webp: Buffer): Promise<string> {
  const admin = createAdminClient();
  const path = `partners/${partnerId}-${Date.now()}.webp`;
  const { error } = await admin.storage
    .from(PARTNERS_BUCKET)
    .upload(path, webp, { contentType: "image/webp", upsert: false, cacheControl: "31536000" });
  if (error) throw new Error(`Не вдалося завантажити логотип: ${error.message}`);
  return admin.storage.from(PARTNERS_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Removes a logo file we stored. Ignores URLs outside our bucket. Best-effort. */
export async function deleteLogoByUrl(url: string | null | undefined): Promise<void> {
  if (!url) return;
  const marker = `/storage/v1/object/public/${PARTNERS_BUCKET}/`;
  const at = url.indexOf(marker);
  if (at === -1) return;
  const path = decodeURIComponent(url.slice(at + marker.length).split("?")[0]);
  const { error } = await createAdminClient().storage.from(PARTNERS_BUCKET).remove([path]);
  if (error) console.error("[partners] logo delete failed:", error.message, path);
}

export function inputErrorResponse(e: unknown): NextResponse {
  if (e instanceof PartnerInputError) return NextResponse.json({ error: e.message }, { status: 400 });
  console.error("[partners admin]", e);
  return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
}
