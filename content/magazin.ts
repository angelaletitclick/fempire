/**
 * Das FEMPIRE Magazin: Artikel der Gründerinnen.
 *
 * Neuen Artikel veröffentlichen: einen Eintrag in `articles` ergänzen (am besten oben).
 * - slug:    Teil der Adresse, nur Kleinbuchstaben, Zahlen und Bindestriche,
 *            z. B. "holding-aufbau" ergibt /magazin/holding-aufbau
 * - date:    Veröffentlichungsdatum im Format JJJJ-MM-TT
 * - body:    Absätze in Reihenfolge. Ein Absatz, der mit "## " beginnt, wird zur Zwischenüberschrift.
 *
 * Die Startseite zeigt automatisch die neuesten Artikel. Gleiche Textregeln wie überall:
 * Du-Anrede, weibliche Formen, kurze Sätze, keine Ausrufezeichen, keine Emojis, keine Beträge.
 */

export type Article = {
  slug: string;
  title: string;
  /** Ein bis zwei Sätze für Übersicht, Startseite und Suchmaschinen */
  teaser: string;
  date: string;
  author: "Angela Pister" | "Maria Elisabeth Doerk" | "Angela Pister und Maria Elisabeth Doerk";
  /** Kurzes Thema, z. B. "Führung" oder "Struktur" */
  topic: string;
  body: string[];
};

export const articles: Article[] = [
  // Beispiel für einen Eintrag (zum Veröffentlichen die Kommentarzeichen entfernen und Text ersetzen):
  // {
  //   slug: "warum-wir-ueber-zahlen-reden",
  //   title: "Warum wir über Zahlen reden",
  //   teaser: "Ein Satz, worum es geht.",
  //   date: "2026-12-01",
  //   author: "Angela Pister",
  //   topic: "Wachstum",
  //   body: ["Erster Absatz.", "## Zwischenüberschrift", "Zweiter Absatz."],
  // },
];

export const magazin = {
  id: "magazin",
  label: "Magazin",
  headline: "Das ++Magazin.++",
  intro:
    "Gedanken, Strukturen und Erfahrungen aus unserem Alltag als Unternehmerinnen. Über Führung, Wachstum, Selbstbestimmung und Mental Health. Geschrieben von uns, nicht von einer Redaktion.",
  empty: "Die ersten Artikel erscheinen in Kürze.",
  /** So viele Artikel zeigt die Startseite */
  showOnHome: 3,
  allLink: "Alle Artikel",
  readMore: "Weiterlesen",
  backLink: "Zurück zum Magazin",
  byLabel: "Von",
  meta: {
    title: "Magazin",
    description:
      "Artikel der Gründerinnen des FEMPIRE CLUB über Führung, Wachstum, Selbstbestimmung, Mental Health und den Alltag als Unternehmerin.",
  },
};

/** Alle Artikel, neueste zuerst */
export function sortedArticles(): Article[] {
  return [...articles].sort((a, b) => b.date.localeCompare(a.date));
}

export function articleBySlug(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}

const dateFormat = new Intl.DateTimeFormat("de-DE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "1. Dezember 2026" */
export function formatArticleDate(iso: string): string {
  return dateFormat.format(new Date(`${iso}T00:00:00Z`));
}
