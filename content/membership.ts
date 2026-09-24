/**
 * Seite /mitgliedsbeitrag. Die einzige Stelle der Website mit Beträgen.
 * Verlinkt nur im Footer. Die Kreise stehen untereinander, nie als Vergleichstabelle.
 *
 * Founding-Konditionen (Sonderpreise der ersten Runde) werden hier bewusst NICHT genannt.
 * ANNAHME: Umsatzsteuer 19 %. Bruttobeträge sind für Verbraucherinnen Pflicht (PAngV),
 * das betrifft vor allem FOUNDATIONS.
 */

const VAT = 0.19;

const euro = (value: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);

function price(net: number) {
  return { net: euro(net), gross: euro(Math.round(net * (1 + VAT))), vatNote: "inkl. 19 % USt." };
}

export const membership = {
  meta: {
    title: "Mitgliedsbeitrag",
    description: "Was die Mitgliedschaft im FEMPIRE CLUB kostet und was enthalten ist.",
  },
  label: "Mitgliedsbeitrag",
  headline: "Wir reden über Zahlen. ++Auch über unsere.++",
  intro:
    "Hier steht, was die Mitgliedschaft kostet und was enthalten ist. Aufgenommen wird nur nach Bewerbung und Kennenlerngespräch. Welcher Kreis zu dir passt, ordnen wir nach deiner Bewerbung zu.",

  circles: [
    {
      id: "leader-circle",
      name: "Leader Circle",
      for: "Für Unternehmerinnen mit eigener GmbH oder Holding und für Frauen mit hoher Führungsverantwortung.",
      price: price(5000),
      period: "pro Jahr",
      term: "Jahresmitgliedschaft",
      included: [
        "12 Treffen im Jahr, jeden ersten Mittwoch im Monat",
        "Events über das Jahr",
        "Masterminds in festen Kleingruppen",
        "Community-Hub für den Austausch zwischen den Treffen",
        "Retreats",
        "FEMPIRE Academy",
      ],
      note: "Masterminds, Retreats und Academy sind in Vorbereitung und starten schrittweise.",
    },
    {
      id: "foundations",
      name: "FEMPIRE FOUNDATIONS",
      for: "Für Frauen, die gründen werden. Ein eigenes Programm mit klarem Ziel und Abschluss.",
      price: price(2500),
      period: "für das 12-monatige Programm",
      term: "12 Monate, endet automatisch. Kein Abo.",
      included: [
        "Eigene monatliche Treffen in einem eigenen Kreis",
        "Coaching und Begleitung durch die Gründerinnen",
        "Eigener geschlossener Kanal",
        "Nach Abschluss: Bewerbung für den Leader Circle möglich",
      ],
      note: "",
    },
  ],

  labels: {
    price: "Beitrag",
    net: "netto",
    term: "Laufzeit",
    included: "Enthalten",
  },

  // ANNAHME: Gilt für den Start des Leader Circle in Osnabrück. Stichtag 1. April 2027.
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

  details: "Zahlungsweise und Rechnungsstellung besprechen wir im Kennenlerngespräch.",
  cta: { label: "Bewerbung starten", href: "/bewerbung" },
};
