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

  /**
   * Aufbauphase (ab November 2026, rund sechs Monate): keine Mitgliedschaften, keine Beiträge.
   * Pro Treffen gibt es nur eine Aufwandsentschädigung, Interessierte tragen sich in die Warteliste ein.
   * Solange true, sind /mitgliedschaften und /mitgliedsbeitrag ausgeblendet (404) und /bewerbung
   * leitet auf /warteliste um (Einladungscode-Links aus dem Backend funktionieren weiter).
   * Zum Start der Mitgliedschaften auf false setzen und die Texte in content/ zurückdrehen.
   */
  aufbauphase: true,

  /**
   * false: keine Termine aus dem Backend auf der öffentlichen Seite (Hero, Aktionsleiste, Termine,
   * Schnuppern). Daten in den Texten stehen als XX. Start voraussichtlich ab Februar 2027.
   * Der Mitgliederbereich zeigt die Termine weiter.
   */
  termineAnzeigen: false,

  /** Punkte der Hauptnavigation. `href` zeigt auf eine Sektion der Startseite oder eine eigene Seite. */
  /** Symbol oben rechts im Header, führt in den Mitgliederbereich (ohne Anmeldung zum Login) */
  login: { label: "Mitglieder-Login", href: "/club" },
  nav: [
    { label: "Schnuppern", href: "/schnuppern" },
    { label: "Termine", href: "/#termine" },
    { label: "Magazin", href: "/magazin" },
  ],

  cta: {
    label: "Auf die Warteliste",
    shortLabel: "Warteliste",
    href: "/warteliste",
  },

  /** Schnuppertermin als zweiter Weg in den Club, auf Startseite und Mitgliedschaften hervorgehoben */
  trialCta: {
    label: "Schnuppertermin anfragen",
    href: "/schnuppern",
  },

  footer: {
    note: "Unternehmerinnentreff aus Osnabrück (weitere Städte folgen). Gemeinsam zu Millionen-Umsätzen.",
    /** Nur im Footer verlinkt */
    /** In der Aufbauphase leer. Danach wieder: { label: "Mitgliedsbeitrag", href: "/mitgliedsbeitrag" } */
    links: [] as { label: string; href: string }[],
    legal: [
      { label: "Impressum", href: "/impressum" },
      { label: "Datenschutz", href: "/datenschutz" },
    ],
    members: { label: "Mitgliederbereich", href: "/club" },
  },
} as const;
