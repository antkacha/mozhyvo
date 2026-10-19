import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { getPublicOpportunity } from "@/lib/opportunity-detail";

export const alt = "МОЖUВО — можливість";
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

// Supabase Storage's cold first byte alone was measured at ~2.6s.
const COVER_FETCH_TIMEOUT_MS = 5000;

// JPEG, not ImageResponse's PNG: a photo as PNG is 1–2 MB, and WhatsApp/Viber
// drop preview images over ~300 KB.
function jpegResponse(body: Buffer, maxAge = 3600) {
  return new Response(new Uint8Array(body), {
    headers: { "Content-Type": contentType, "Cache-Control": `public, max-age=${maxAge}` },
  });
}

// The site-wide brand image (app/opengraph-image.png), re-encoded so every
// response from this route matches `contentType`.
// Traced into the bundle via outputFileTracingIncludes in next.config.js.
async function brandPlaceholder(maxAge?: number) {
  const png = await readFile(join(process.cwd(), "app/opengraph-image.png"));
  return jpegResponse(await sharp(png).jpeg({ quality: 85 }).toBuffer(), maxAge);
}

export default async function Image({ params }: { params: { slug: string } }) {
  // Not found, not published, or org not verified → brand image, so a
  // non-public opportunity never leaks a preview.
  const opp = await getPublicOpportunity(params.slug);
  if (!opp?.photo) return brandPlaceholder();

  // A missing, slow or non-image cover must never break the preview.
  try {
    const res = await fetch(opp.photo, {
      signal: AbortSignal.timeout(COVER_FETCH_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`cover fetch ${res.status}`);
    const jpeg = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize(size.width, size.height, { fit: "cover", position: "centre" })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();
    return jpegResponse(jpeg);
  } catch {
    // Short cache: a transient failure shouldn't pin the placeholder for an hour.
    return brandPlaceholder(60);
  }
}
