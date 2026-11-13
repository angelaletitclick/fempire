/**
 * Seite /mitgliedsbeitrag. Die einzige öffentliche Stelle der Website mit Beträgen.
 * Verlinkt nur im Footer. Die Mitgliedschaften stehen untereinander, nie als Vergleichstabelle.
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
  intro:
    "Hier steht, was die Mitgliedschaften kosten und was enthalten ist. Aufgenommen wird nur nach Bewerbung und Kennenlerngespräch. Welche Mitgliedschaft zu dir passt, ordnen wir nach deiner Bewerbung zu.",

  circles: [
    {
      id: "community",
      tier: "community",
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
      note: "",
    },
    {
      id: "founder-circle",
      tier: "founder",
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
      note: "Der Founder Circle startet in Kürze.",
    },
    {
      id: "leader-circle",
      tier: "leader",
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
      note: "",
    },
    {
      id: "masterminds",
      tier: "mastermind",
      name: "Masterminds",
      for: "Für Unternehmerinnen, die in einer festen Kleingruppe am nächsten Sprung arbeiten.",
      price: price(24900, true),
      period: "pro Monat",
      included: ["Alles aus dem Leader Circle", "Feste Mastermind-Kleingruppe", "Hot Seats"],
      note: "Masterminds sind in Vorbereitung und starten schrittweise.",
    },
  ],

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

  // ANNAHME: Gilt für den Start in Osnabrück. Stichtag 1. April 2027.
  foundingPhase: {
    title: "Gründungsphase",
    body: "Bis zum 1. April 2027 erheben wir keinen Mitgliedsbeitrag. Pro Treffen fällt lediglich eine Aufwandsentschädigung an.",
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
