/**
 * Seite /mitgliedsbeitrag. Die einzige öffentliche Stelle der Website mit Beträgen.
 * Verlinkt nur im Footer. Die Mitgliedschaften bauen aufeinander auf: Community, Founder Circle,
 * Leader Circle, Masterminds. Masterminds enthalten alle Leistungen.
 *
 * Beträge in Cent. ANNAHME: Die genannten Beträge sind Endpreise inklusive 19 % USt.
 * Netto wird daraus berechnet und klein darunter angezeigt.
 */

const VAT = 0.19;

const euro = (cents: number) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);

function price(grossCents: number, from = false) {
  const net = Math.round(grossCents / (1 + VAT));
  return {
    gross: `${from ? "ab " : ""}${euro(grossCents)}`,
    net: `${from ? "ab " : ""}${euro(net)} netto`,
    vatNote: "inkl. 19 % USt.",
  };
}

export const membership = {
  meta: {
    title: "Mitgliedsbeitrag",
    description: "Was die Mitgliedschaften im FEMPIRE CLUB kosten und was enthalten ist.",
  },
  label: "Mitgliedsbeitrag",
  headline: "Wir reden über Zahlen. ++Auch über unsere.++",
  cardsLabel: "Mitgliedschaften",
  intro:
    "Hier steht, was die Mitgliedschaften kosten und was enthalten ist. Aufgenommen wird nur nach Bewerbung und Kennenlerngespräch. Welche Mitgliedschaft zu dir passt, ordnen wir nach deiner Bewerbung zu.",

  circles: [
    {
      id: "community",
      short: "Community",
      /** Für die Hochzähl-Animation */
      grossCents: 1990,
      from: false,
      tier: "community" as const,
      name: "Community-Mitgliedschaft",
      for: "Für dich, wenn du Teil der Gemeinschaft sein willst, ohne festen Kreis.",
      price: price(1990),
      period: "pro Monat",
      included: [
        "Alle Mitglieder sehen und direkt anschreiben",
        "Austausch in der geschlossenen Community",
        "Fragen im Community-Forum stellen",
        "Alle Termine im Blick",
        "Alle Artikel für Mitglieder im Magazin",
      ],
      /** Karte: Zeile über den Leistungen und nur das, was gegenüber der vorigen Mitgliedschaft dazukommt */
      builds: "",
      plus: ["Alle Mitglieder sehen und anschreiben", "Geschlossenes Community-Forum", "Alle Termine im Blick", "Alle Artikel für Mitglieder im Magazin"],
      note: "",
    },
    {
      id: "founder-circle",
      short: "Founder",
      /** Für die Hochzähl-Animation */
      grossCents: 4900,
      from: false,
      tier: "founder" as const,
      name: "Founder Circle",
      for: "Für Frauen, die gründen werden. Ein eigenes Programm mit klarem Ziel und Abschluss nach zwölf Monaten.",
      price: price(4900),
      period: "pro Monat",
      included: [
        "Eigene monatliche Treffen",
        "Austausch mit Gleichgesinnten",
        "Zugang zur Community",
        "Social Media Push",
        "Zugang zu den Workshops",
      ],
      builds: "Alles aus der Community, dazu:",
      plus: ["Eigene monatliche Treffen im Founder Circle", "Workshops", "Social Media Push", "Austausch mit Gleichgesinnten"],
      note: "Der Founder Circle startet in Kürze.",
    },
    {
      id: "leader-circle",
      short: "Leader",
      /** Für die Hochzähl-Animation */
      grossCents: 9900,
      from: false,
      tier: "leader" as const,
      name: "Leader Circle",
      for: "Für Unternehmerinnen mit eigener GmbH oder Holding und für Frauen mit hoher Führungsverantwortung.",
      price: price(9900),
      period: "pro Monat",
      included: [
        "Eigene monatliche Treffen, jeden ersten Dienstag im Monat",
        "Austausch mit Gleichgesinnten",
        "Zugang zur Community",
        "Social Media Push",
        "Zugang zu den Workshops",
        "Teilnahme an den Hot Seats, einmal im Quartal",
      ],
      builds: "Alle Leistungen wie im Founder Circle, dazu:",
      plus: ["Hot Seats, einmal im Quartal", "Treffen jeden ersten Dienstag, ohne Enddatum", "Eine Runde aus Unternehmerinnen mit laufendem Business"],
      note: "",
    },
    {
      id: "masterminds",
      short: "Mastermind",
      /** Für die Hochzähl-Animation */
      grossCents: 24900,
      from: true,
      tier: "mastermind" as const,
      name: "Masterminds",
      for: "Für Unternehmerinnen, die in einer festen Kleingruppe am nächsten Sprung arbeiten.",
      price: price(24900, true),
      period: "pro Monat",
      included: ["Alles aus dem Leader Circle", "Feste Mastermind-Kleingruppe", "Hot Seats inklusive"],
      builds: "Alles aus dem Leader Circle, dazu:",
      plus: ["Feste Mastermind-Kleingruppe", "Hot Seats inklusive", "Alle Leistungen des Clubs"],
      note: "Masterminds sind in Vorbereitung und starten schrittweise.",
    },
  ],

  /**
   * Vergleich auf /mitgliedsbeitrag. true = enthalten, Text = enthalten mit Hinweis, fehlt = nicht enthalten.
   * Schlüssel wie bei tier: community, founder, leader, mastermind.
   */
  comparison: {
    title: "Im ++Vergleich.++",
    intro: "Jede Mitgliedschaft baut auf der vorigen auf. Masterminds enthalten alle Leistungen des Clubs.",
    featureLabel: "Leistung",
    included: "enthalten",
    notIncluded: "nicht enthalten",
    countLabel: "{count} von {total} Leistungen",
    allLabel: "Alle {total} Leistungen",
    totalLabel: "Leistungen gesamt",
    features: [
      { label: "Alle Mitglieder sehen und direkt anschreiben", tiers: { community: true, founder: true, leader: true, mastermind: true } },
      { label: "Geschlossenes Community-Forum", tiers: { community: true, founder: true, leader: true, mastermind: true } },
      { label: "Alle Termine im Blick", tiers: { community: true, founder: true, leader: true, mastermind: true } },
      { label: "Alle Artikel für Mitglieder im Magazin", tiers: { community: true, founder: true, leader: true, mastermind: true } },
      { label: "Eigene monatliche Treffen im Kreis", tiers: { founder: true, leader: "erster Dienstag", mastermind: true } },
      { label: "Austausch mit Gleichgesinnten", tiers: { founder: true, leader: true, mastermind: true } },
      { label: "Workshops", tiers: { founder: true, leader: true, mastermind: true } },
      { label: "Social Media Push", tiers: { founder: true, leader: true, mastermind: true } },
      { label: "Hot Seats", tiers: { leader: "1× im Quartal", mastermind: "inklusive" } },
      { label: "Feste Mastermind-Kleingruppe", tiers: { mastermind: true } },
    ] as Array<{ label: string; tiers: Partial<Record<"community" | "founder" | "leader" | "mastermind", true | string>> }>,
  },

  cardCta: "Bewerben",

  /** Warum der Leader Circle über dem Founder Circle steht und mehr kostet */
  step: {
    label: "Founder und Leader",
    title: "Warum der Leader Circle ++mehr kostet.++",
    intro:
      "Founder Circle und Leader Circle richten sich an verschiedene Phasen. Der Leader Circle liegt eine Stufe darüber: Er enthält alle Leistungen des Founder Circle und geht weiter.",
    points: [
      {
        title: "Hot Seats",
        body: "Einmal im Quartal steht dein Unternehmen im Mittelpunkt. Du legst Zahlen und Engpässe offen, der Kreis arbeitet eine Sitzung lang an deinem Fall.",
      },
      {
        title: "Die Runde",
        body: "Am Tisch sitzen Unternehmerinnen mit eigener GmbH, Holding oder hoher Führungsverantwortung. Gesprochen wird über Umsatz, Margen, Personal und Strukturen, die schon laufen.",
      },
      {
        title: "Ohne Enddatum",
        body: "Der Founder Circle begleitet dich zwölf Monate bis zur Gründung. Der Leader Circle ist dein fester Kreis, jeden ersten Dienstag, so lange du Mitglied bist.",
      },
    ],
  },

  /** Einzelner Schnuppertermin für Nicht-Mitglieder. priceCents ist auch der Standard im Backend. */
  trial: {
    title: "Schnuppertermin",
    priceCents: 2900,
    price: price(2900),
    period: "einmalig, inklusive Heißgetränk",
    body: "Einzelne Treffen kannst du einmalig als Schnuppertermin besuchen, bevor du dich entscheidest. Welche Termine dafür offen sind, siehst du bei der Anfrage.",
    cta: { label: "Schnuppertermin anfragen", href: "/schnuppern" },
  },

  retreat: {
    title: "Retreat im Juni",
    body: "Im Juni 2027 gibt es ein Retreat-Wochenende. Die Konditionen geben wir den Mitgliedern rechtzeitig bekannt.",
  },

  labels: {
    price: "Beitrag",
    included: "Enthalten",
  },

  why: {
    title: "Warum ein Beitrag",
    body: [
      "Ein Beitrag schafft Verbindlichkeit. Wer investiert, kommt vorbereitet und bleibt dran.",
      "Er finanziert Räume, Formate und die Zeit, die wir in jeden Kreis stecken. Und er hält den Kreis frei von Sponsorinnen und Verkaufsinteressen.",
    ],
  },

  /** Zahlung: Rechnung per E-Mail, Überweisung. Auch im Mitgliederbereich angezeigt. */
  payment: "Die Rechnung kommt monatlich per E-Mail, gezahlt wird per Überweisung.",
  details: "Die Rechnung kommt monatlich per E-Mail, gezahlt wird per Überweisung. Alles Weitere besprechen wir im Kennenlerngespräch.",
  cta: { label: "Bewerbung starten", href: "/bewerbung" },
};
