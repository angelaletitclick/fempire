/**
 * Texte rund um das FEMPIRE Magazin.
 *
 * Die Artikel selbst schreibt ihr im Backend unter /club/admin/magazin. Dort legt ihr fest,
 * ob ein Artikel frei lesbar ist oder nur für Mitglieder (Paywall). Gleiche Textregeln wie
 * überall: Du-Anrede, weibliche Formen, kurze Sätze, keine Ausrufezeichen, keine Emojis, keine Beträge.
 */
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
  paidLabel: "Für Mitglieder",
  /** So viele Absätze eines Mitglieder-Artikels sind für alle sichtbar */
  previewBlocks: 2,
  paywall: {
    title: "Weiterlesen als Mitglied.",
    body: "Dieser Artikel ist Teil der Mitgliedschaft. Mitglieder lesen ihn vollständig im eingeloggten Zustand.",
    login: "Anmelden",
    apply: "Mitglied werden",
    inactive: "Deine Mitgliedschaft ist gerade nicht aktiv. Sobald sie wieder läuft, liest du hier weiter.",
  },
  meta: {
    title: "Magazin",
    description:
      "Artikel der Gründerinnen des FEMPIRE CLUB über Führung, Wachstum, Selbstbestimmung, Mental Health und den Alltag als Unternehmerin.",
  },
};

/** Autorinnen zur Auswahl im Backend */
export const authors = ["Angela Pister", "Maria Elisabeth Doerk", "Angela Pister und Maria Elisabeth Doerk"];
