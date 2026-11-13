import type { MetadataRoute } from "next";
import { publishedArticles } from "@/lib/articles";
import { siteUrl } from "@/lib/site-url";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await publishedArticles();
  return [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/bewerbung`, changeFrequency: "yearly", priority: 0.8 },
    { url: `${siteUrl}/schnuppern`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/termine`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/magazin`, changeFrequency: "weekly", priority: 0.6 },
    ...articles.map((article) => ({
      url: `${siteUrl}/magazin/${article.slug}`,
      lastModified: article.published_at,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    { url: `${siteUrl}/impressum`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${siteUrl}/datenschutz`, changeFrequency: "yearly", priority: 0.1 },
  ];
}
