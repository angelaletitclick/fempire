/**
 * Globale Angaben: Name, Navigation, Footer, SEO.
 * Texte hier ändern, der Rest der Seite übernimmt sie automatisch.
 */
export const site = {
  name: "FEMPIRE CLUB",
  claim: "Exklusiver Kreis für Unternehmerinnen & Leaderinnen",
  claimSuffix: "Application Only",
  city: "Osnabrück",

  seo: {
    title: "FEMPIRE CLUB — Kreis für Unternehmerinnen in Osnabrück",
    description:
      "Geschlossener Kreis für Unternehmerinnen, Holding-Inhaberinnen und Leaderinnen. Echte Zahlen statt Smalltalk. Osnabrück. Aufnahme nur über Bewerbung.",
  },

  /** Punkte der Hauptnavigation. `href` zeigt auf eine Sektion der Startseite oder eine eigene Seite. */
  /** Symbol oben rechts im Header, führt in den Mitgliederbereich (ohne Anmeldung zum Login) */
  login: { label: "Mitglieder-Login", href: "/club" },
  nav: [
    { label: "Leader Circle", href: "/#leader-circle" },
    { label: "Founder Circle", href: "/#founder-circle" },
    { label: "Termine", href: "/#termine" },
    { label: "Magazin", href: "/magazin" },
  ],

  cta: {
    label: "Bewerbung starten",
    shortLabel: "Bewerben",
    href: "/bewerbung",
  },

  footer: {
    note: "Unternehmerinnentreff aus Osnabrück (weitere Städte folgen). Gemeinsam zu Millionen-Umsätzen.",
    /** Nur im Footer verlinkt */
    links: [{ label: "Mitgliedsbeitrag", href: "/mitgliedsbeitrag" }],
    legal: [
      { label: "Impressum", href: "/impressum" },
      { label: "Datenschutz", href: "/datenschutz" },
    ],
    members: { label: "Mitgliederbereich", href: "/club" },
  },
} as const;
