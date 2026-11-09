import { createClient } from "@/lib/supabase/client";
import { COVER_FILE, COVER_THUMB_FILE } from "@/lib/cover-url";

export const COVER_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const COVER_MAX_BYTES = 4 * 1024 * 1024;
export const COVER_WIDTH = 1280;
export const COVER_HEIGHT = 720; // 16:9 — cards show ≤~600 CSS px, detail hero ≤~720
export const COVER_BUCKET = "opportunities";
// Card thumbnail (lib/cover-url.ts), written next to every cover.
export const COVER_THUMB_WIDTH = 640;
export const COVER_THUMB_HEIGHT = 360;
export const COVER_THUMB_QUALITY = 75; // 0–100

/**
 * Resizes + center-crops an image file to exactly COVER_WIDTH x COVER_HEIGHT
 * (object-fit: cover behavior, no manual crop UI) and re-encodes as JPEG.
 */
export function resizeToCover(file: File | Blob): Promise<Blob> {
  return cropToJpeg(file, COVER_WIDTH, COVER_HEIGHT, 0.78);
}

function cropToJpeg(file: File | Blob, width: number, height: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objUrl);
      const scale = Math.max(width / img.width, height / img.height);
      const sw = width / scale;
      const sh = height / scale;
      const sx = (img.width - sw) / 2;
      const sy = (img.height - sh) / 2;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Не вдалося обробити зображення"))),
        "image/jpeg",
        quality,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objUrl); reject(new Error("Не вдалося завантажити файл як зображення")); };
    img.src = objUrl;
  });
}

export function validateCoverFile(file: File): string | null {
  if (!COVER_ALLOWED_TYPES.includes(file.type)) return "Тільки JPG, PNG або WebP";
  if (file.size > COVER_MAX_BYTES) return "Файл більший за 4 МБ";
  return null;
}

/** Direct client → Storage upload, protected by the opportunities_org_* RLS policies. */
export async function uploadCoverPhoto(projectId: string, blob: Blob): Promise<string> {
  const supabase = createClient();
  const path = `${projectId}/${COVER_FILE}`;
  const { error } = await supabase.storage
    .from(COVER_BUCKET)
    .upload(path, blob, { contentType: "image/jpeg", upsert: true, cacheControl: "31536000" });
  if (error) throw error;

  // Card thumbnail next to the cover. Never fails the cover upload: cards fall
  // back to the full cover when the thumb is missing. Blob is the 1280x720
  // cover, so 640x360 is always a downscale.
  const thumbPath = `${projectId}/${COVER_THUMB_FILE}`;
  try {
    const thumb = await cropToJpeg(blob, COVER_THUMB_WIDTH, COVER_THUMB_HEIGHT, COVER_THUMB_QUALITY / 100);
    const { error: thumbError } = await supabase.storage
      .from(COVER_BUCKET)
      .upload(thumbPath, thumb, { contentType: "image/jpeg", upsert: true, cacheControl: "31536000" });
    if (thumbError) throw thumbError;
  } catch (e) {
    console.warn("[cover] thumbnail upload failed, cards will use the full cover:", e);
    // A thumb left over from a previous cover would otherwise be shown under
    // the new ?v= — remove it so cards fall back to the full cover.
    await supabase.storage.from(COVER_BUCKET).remove([thumbPath]).catch(() => {});
  }

  const { data: { publicUrl } } = supabase.storage.from(COVER_BUCKET).getPublicUrl(path);
  // Cache-bust so the browser fetches the new file even though the path is identical
  return `${publicUrl}?v=${Date.now()}`;
}

export async function deleteCoverPhoto(projectId: string): Promise<void> {
  const supabase = createClient();
  await supabase.storage.from(COVER_BUCKET).remove([`${projectId}/${COVER_FILE}`, `${projectId}/${COVER_THUMB_FILE}`]);
}
