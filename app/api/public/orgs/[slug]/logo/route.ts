import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLATFORM_ORG_SLUG } from "@/lib/partners";

export const dynamic = "force-dynamic";

// Browser keeps a logo for a day; the CDN serves it for a day and then
// refreshes in the background, so a re-uploaded logo shows within ~a day.
// next.config.js excludes this path from the /api/public no-store rule.
const CACHE = "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800";

const STORAGE_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`;

const notFound = () =>
  new NextResponse("Not found", {
    status: 404,
    headers: { "Cache-Control": "public, max-age=300, s-maxage=300" },
  });

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const admin = createAdminClient();
  const { data: org } = await admin
    .from("orgs")
    .select("logo_url")
    .eq("slug", params.slug)
    .eq("status", "verified")
    .eq("show_as_partner", true)
    .neq("slug", PLATFORM_ORG_SLUG)
    .maybeSingle();

  const logo = (org?.logo_url as string | null | undefined)?.trim();
  if (!logo) return notFound();

  // Storage URL → redirect. Only our own bucket: logo_url is org-editable,
  // so anything else would make this an open redirect.
  if (logo.startsWith("https://")) {
    if (!logo.startsWith(STORAGE_PREFIX)) return notFound();
    return NextResponse.redirect(logo, { status: 302, headers: { "Cache-Control": CACHE } });
  }

  const m = /^data:(image\/[a-z0-9.+-]+)(;base64)?,([\s\S]*)$/i.exec(logo);
  if (!m) return notFound();
  const [, mime, isBase64, payload] = m;
  const bytes = isBase64
    ? Buffer.from(payload, "base64")
    : Buffer.from(decodeURIComponent(payload), "utf8");
  if (bytes.length === 0) return notFound();

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": mime.toLowerCase(),
      "Content-Length": String(bytes.length),
      "Cache-Control": CACHE,
      "X-Content-Type-Options": "nosniff",
      // An uploaded SVG opened directly must not run scripts on our origin.
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
