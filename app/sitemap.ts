import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/bewerbung`, changeFrequency: "yearly", priority: 0.8 },
    { url: `${siteUrl}/impressum`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${siteUrl}/datenschutz`, changeFrequency: "yearly", priority: 0.1 },
  ];
}
