import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { getPublicOpportunity } from "@/lib/opportunity-detail";

export const alt = "МОЖUВО — можливість";
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

// Supabase Storage's cold first byte alone was measured at ~2.6s.
const COVER_FETCH_TIMEOUT_MS = 5000;

// s-maxage lets Vercel's edge cache the result — max-age alone is browser-only,
// so without it every crawler/messenger fetch re-ran sharp and re-downloaded
// the cover from Supabase.
const OG_CACHE_OK = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";
// Error path: short, browser-only — a transient failure must not be pinned at the edge.
const OG_CACHE_ERROR = "public, max-age=60";

// JPEG, not ImageResponse's PNG: a photo as PNG is 1–2 MB, and WhatsApp/Viber
// drop preview images over ~300 KB.
function jpegResponse(body: Buffer, cacheControl: string) {
  return new Response(new Uint8Array(body), {
    headers: { "Content-Type": contentType, "Cache-Control": cacheControl },
  });
}

// The site-wide brand image (app/opengraph-image.png), re-encoded so every
// response from this route matches `contentType`. Encoded once per instance,
// not on every call. Traced into the bundle via outputFileTracingIncludes in
// next.config.js.
let brandJpeg: Promise<Buffer> | null = null;
function getBrandJpeg(): Promise<Buffer> {
  if (!brandJpeg) {
    brandJpeg = readFile(join(process.cwd(), "app/opengraph-image.png"))
      .then((png) => sharp(png).jpeg({ quality: 85 }).toBuffer())
      .catch((e) => { brandJpeg = null; throw e; });
  }
  return brandJpeg;
}

async function brandPlaceholder(cacheControl: string) {
  return jpegResponse(await getBrandJpeg(), cacheControl);
}

export default async function Image({ params }: { params: { slug: string } }) {
  // Not found, not published, or org not verified → brand image, so a
  // non-public opportunity never leaks a preview.
  let opp: Awaited<ReturnType<typeof getPublicOpportunity>>;
  try {
    opp = await getPublicOpportunity(params.slug);
  } catch {
    // DB unreachable: brand image, but short-cached like any other failure.
    return brandPlaceholder(OG_CACHE_ERROR);
  }
  if (!opp?.photo) return brandPlaceholder(OG_CACHE_OK);

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
    return jpegResponse(jpeg, OG_CACHE_OK);
  } catch {
    // Short cache: a transient failure shouldn't pin the placeholder.
    return brandPlaceholder(OG_CACHE_ERROR);
  }
}
