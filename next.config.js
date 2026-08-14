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
