import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/cabinet/", "/admin/", "/dashboard/", "/api/", "/auth/"],
      },
    ],
    sitemap: "https://mozhyvo.ua/sitemap.xml",
    host: "https://mozhyvo.ua",
  };
}
