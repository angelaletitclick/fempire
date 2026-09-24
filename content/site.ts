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

  /** Maximal vier Punkte. `href` zeigt auf die id einer Sektion der Startseite. */
  nav: [
    { label: "Manifest", href: "/#manifest" },
    { label: "Formate", href: "/#formate" },
    { label: "Termine", href: "/#termine" },
    { label: "Gründerinnen", href: "/#gruenderinnen" },
  ],

  cta: {
    label: "Bewerbung starten",
    shortLabel: "Bewerben",
    href: "/bewerbung",
  },

  footer: {
    note: "Ein Kreis aus Osnabrück. Münster, Hamburg und Frankfurt folgen.",
    legal: [
      { label: "Impressum", href: "/impressum" },
      { label: "Datenschutz", href: "/datenschutz" },
    ],
    members: { label: "Mitgliederbereich", href: "/club" },
  },
} as const;
