import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Magazin-Artikel aus Supabase. Gelesen wird nur serverseitig: Die Tabelle hat keine
 * öffentlichen Policies, damit der Text bezahlter Artikel nie ohne Prüfung herausgeht.
 */
export type ArticleSummary = {
  id: string;
  slug: string;
  title: string;
  teaser: string;
  topic: string;
  author: string;
  paid: boolean;
  published_at: string;
  cover_path: string | null;
  cover_alt: string;
  cover_caption: string;
};

export type Article = ArticleSummary & { body: string; updated_at: string };

const SUMMARY = "id, slug, title, teaser, topic, author, paid, published_at, cover_path, cover_alt, cover_caption";

/** Veröffentlichte Artikel, neueste zuerst. Bei technischem Fehler leer, damit die Seite trotzdem steht. */
export async function publishedArticles(limit?: number): Promise<ArticleSummary[]> {
  try {
    let query = supabaseAdmin()
      .from("articles")
      .select(SUMMARY)
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as ArticleSummary[];
  } catch (error) {
    console.error("Magazin:", (error as Error).message);
    return [];
  }
}

export async function publishedArticle(slug: string): Promise<Article | null> {
  try {
    const { data, error } = await supabaseAdmin()
      .from("articles")
      .select(`${SUMMARY}, body, updated_at`)
      .eq("status", "published")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return (data as Article | null) ?? null;
  } catch (error) {
    console.error("Magazin:", (error as Error).message);
    return null;
  }
}
