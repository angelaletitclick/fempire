import type { MetadataRoute } from "next";
import { articles } from "@/content/magazin";
import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/bewerbung`, changeFrequency: "yearly", priority: 0.8 },
    { url: `${siteUrl}/magazin`, changeFrequency: "weekly", priority: 0.6 },
    ...articles.map((article) => ({
      url: `${siteUrl}/magazin/${article.slug}`,
      lastModified: article.date,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    { url: `${siteUrl}/impressum`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${siteUrl}/datenschutz`, changeFrequency: "yearly", priority: 0.1 },
  ];
}
