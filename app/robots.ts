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
    sitemap: "https://www.mozhyvo.com.ua/sitemap.xml",
    host: "https://www.mozhyvo.com.ua",
  };
}
