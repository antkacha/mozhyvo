/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lqtikyzevpjbtueajpsh.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // WebP only — AVIF was measured at ~700ms server-side cold-encode time
    // (vs ~111ms for WebP on the same image) on the first request for any
    // given url+width+quality combination, which showed up as the
    // detail-page hero (a priority image with no placeholder, by design)
    // popping in visibly after a real delay. quality={85} on the Image
    // components is unaffected — that's a separate setting and stays.
    formats: ["image/webp"],
    // Vercel bills a transformation on every cache MISS *and* STALE. Supabase
    // serves covers/avatars with max-age=3600, so with the 60s default every
    // variant expired and re-transformed hourly. Safe to cache long: covers
    // and avatars get a new ?v=<timestamp> URL whenever they're replaced.
    minimumCacheTTL: 2678400, // 31 days (Vercel max)
    // Sized to real containers × DPR: covers are ≤1920 source, cards ≤~480
    // CSS px, detail hero ≤~710 CSS px, avatars ≤64px. The default 2048/3840
    // widths only produced extra billed copies of the same 1920 pixels.
    deviceSizes: [640, 828, 1080, 1440, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: "/organizations/:slug*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        ],
      },
      {
        source: "/api/me/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
      {
        source: "/api/public/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
