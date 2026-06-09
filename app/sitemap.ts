import type { MetadataRoute } from "next";
import { opportunities } from "@/lib/data";

const BASE = "https://mozhyvo.ua";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                    lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/opportunities`, lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/organizations`, lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/about`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contacts`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/login`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/register`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  const opportunityPages: MetadataRoute.Sitemap = opportunities.map((o) => ({
    url:             `${BASE}/opportunities/${o.slug}`,
    lastModified:    new Date(),
    changeFrequency: "weekly" as const,
    priority:        0.8,
  }));

  return [...staticPages, ...opportunityPages];
}
