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
};

export type Article = ArticleSummary & { body: string; updated_at: string };

const SUMMARY = "id, slug, title, teaser, topic, author, paid, published_at";

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

export type Block = { type: "heading"; text: string } | { type: "list"; items: string[] } | { type: "paragraph"; text: string };

/**
 * Text aus dem Backend in Blöcke zerlegen:
 * Leerzeile trennt Absätze, "## " am Anfang ergibt eine Zwischenüberschrift,
 * Zeilen mit "- " ergeben eine Liste.
 */
export function parseBody(body: string): Block[] {
  return body
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk): Block => {
      if (chunk.startsWith("## ")) return { type: "heading", text: chunk.slice(3).trim() };
      const lines = chunk.split("\n");
      if (lines.every((line) => line.trim().startsWith("- "))) {
        return { type: "list", items: lines.map((line) => line.trim().slice(2).trim()) };
      }
      return { type: "paragraph", text: chunk };
    });
}
