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
    // AVIF first — better quality per byte than WebP; browsers that don't
    // support it (checked via Accept header) fall back to WebP, which
    // stays as the second entry rather than being dropped.
    formats: ["image/avif", "image/webp"],
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
