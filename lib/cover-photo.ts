import { createClient } from "@/lib/supabase/client";

export const COVER_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const COVER_MAX_BYTES = 4 * 1024 * 1024;
export const COVER_WIDTH = 1920;
export const COVER_HEIGHT = 1080; // 16:9
export const COVER_BUCKET = "opportunities";

/**
 * Resizes + center-crops an image file to exactly COVER_WIDTH x COVER_HEIGHT
 * (object-fit: cover behavior, no manual crop UI) and re-encodes as JPEG.
 */
export function resizeToCover(file: File | Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objUrl);
      const scale = Math.max(COVER_WIDTH / img.width, COVER_HEIGHT / img.height);
      const sw = COVER_WIDTH / scale;
      const sh = COVER_HEIGHT / scale;
      const sx = (img.width - sw) / 2;
      const sy = (img.height - sh) / 2;

      const canvas = document.createElement("canvas");
      canvas.width = COVER_WIDTH;
      canvas.height = COVER_HEIGHT;
      canvas.getContext("2d")!.drawImage(img, sx, sy, sw, sh, 0, 0, COVER_WIDTH, COVER_HEIGHT);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Не вдалося обробити зображення"))),
        "image/jpeg",
        0.85,
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
  const path = `${projectId}/cover.jpg`;
  const { error } = await supabase.storage
    .from(COVER_BUCKET)
    .upload(path, blob, { contentType: "image/jpeg", upsert: true });
  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage.from(COVER_BUCKET).getPublicUrl(path);
  // Cache-bust so the browser fetches the new file even though the path is identical
  return `${publicUrl}?v=${Date.now()}`;
}

export async function deleteCoverPhoto(projectId: string): Promise<void> {
  const supabase = createClient();
  await supabase.storage.from(COVER_BUCKET).remove([`${projectId}/cover.jpg`]);
}
