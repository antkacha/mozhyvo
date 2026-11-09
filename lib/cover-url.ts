// Single source of truth for the small card thumbnail that sits next to every
// opportunity cover in Storage: opportunities/<projectId>/cover.jpg ↔
// opportunities/<projectId>/cover-thumb.jpg. Both are written at the same
// moment by the upload code (lib/cover-photo.ts, the cover URL-import route),
// so the cover's ?v= cache-buster is valid for the thumb too.

export const COVER_FILE = "cover.jpg";
export const COVER_THUMB_FILE = "cover-thumb.jpg";

// https://<ref>.supabase.co/storage/v1/object/public/opportunities/<id>/cover.jpg[?query]
const STORAGE_COVER_RE =
  /^(https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/opportunities\/[^/?#]+\/)cover\.jpg(\?[^#]*)?$/;

/**
 * Thumbnail URL for a Storage cover URL, keeping the exact query string.
 * Anything else (external URL, data:/blob: URL, legacy path, empty) is
 * returned unchanged — callers can always use the result as an image src.
 */
export function getCoverThumbUrl<T extends string | null | undefined>(coverUrl: T): T {
  if (!coverUrl) return coverUrl;
  const m = coverUrl.match(STORAGE_COVER_RE);
  return (m ? `${m[1]}${COVER_THUMB_FILE}${m[2] ?? ""}` : coverUrl) as T;
}
