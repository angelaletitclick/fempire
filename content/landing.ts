/**
 * Alle Texte der Startseite, in der Reihenfolge der Sektionen.
 *
 * Hervorheben: ==Text== ergibt eine pinke Fläche mit weißer Schrift, ++Text++ eine weiße
 * Fläche mit schwarzer Schrift. Pink nur in großen Headlines und höchstens einmal pro
 * Bildschirmhöhe.
 *
 * Regeln für neue Texte: Du-Anrede, weibliche Formen, kurze Sätze,
 * keine Ausrufezeichen, keine Emojis, keine Superlative.
 * Keine Beträge auf der Startseite (die stehen nur auf /mitgliedsbeitrag, content/membership.ts).
 * Zur Investition hier nur die Formulierung:
 * „Die Investition besprechen wir im persönlichen Gespräch.“
 * FOUNDATIONS nie als günstigere Variante darstellen, nie „Einsteigerinnen“ oder „Anfängerinnen“.
 */

import { plannedCities } from "./cities";

export const hero = {
  /**
   * Zeile 1 weiß, Zeile 2 mit pinker Fläche. Das ­ in „Unternehmerinnen“ ist eine
   * unsichtbare Trennstelle: Nur auf schmalen Screens wird dort umbrochen (UNTER-NEHMERINNEN).
   */
  headline: ["Der Club für Unter­nehmerinnen,", "==die ein Fempire bauen.=="],
  subline:
    "Der FEMPIRE CLUB ist kein Netzwerk und keine Weiterbildung, sondern ein geschlossener Kreis für Unternehmerinnen, die ein laufendes Business führen, Verantwortung für ein Team tragen und ihr Geschäft in die nächste Größenordnung bringen wollen. Bei regelmäßigen Treffen in fester Runde legen wir Umsätze und offene Painpoints auf den Tisch und arbeiten konkret daran weiter. Application only.",
  /** Datum wird automatisch aus der Terminregel in content/cities.ts berechnet */
  nextMeetingLabel: "Nächstes Treffen",
  secondaryCta: { label: "Was hier anders läuft", href: "#manifest" },
};

/** Laufband unter dem Hero. Begriffe, um die es im Kreis geht. */
export const ticker = [
  "Umsatz",
  "Marge",
  "Gewinn",
  "Liquidität",
  "Struktur",
  "Holding",
  "Skalierung",
  "Führung",
  "Autonomie",
  "Familie",
];

export const manifest = {
  id: "manifest",
  label: "Manifest",
  headline: "Was hier ++anders++ läuft.",
  statements: [
    {
      title: "Wir reden über ++Umsatz++, nicht über Reichweite.",
      body: "Umsatz, Marge, Gewinn, Liquidität. Wer echtes Feedback will, legt echte Zahlen auf den Tisch. Was im Raum gesagt wird, bleibt im Raum.",
    },
    {
      title: "Kein Smalltalk. Keine Visitenkarten.",
      body: "Jedes Treffen hat ein Thema und ein Ergebnis. Du gehst mit einer Entscheidung nach Hause, nicht mit einem Stapel Kontakte.",
    },
    {
      title: "Mutter sein ist hier kein Nachteil, sondern Kontext.",
      body: "Die meisten von uns führen ein Unternehmen und eine Familie. Wir reden offen darüber, wie beides funktioniert, und über die Strukturen, die es möglich machen.",
    },
    {
      title: "Plätze sind begrenzt, weil Qualität es ist.",
      body: "Jeder Kreis wächst nur so schnell, wie Vertrauen wachsen kann. Jede Aufnahme ist eine bewusste Entscheidung, auf beiden Seiten.",
    },
    {
      title: "Wir teilen Strukturen, nicht Motivationssprüche.",
      body: "Holding-Aufbau, Prozesse, Personal, Pricing. Was bei einer funktioniert, wird für alle nutzbar.",
    },
  ],
};

export const filter = {
  id: "fuer-wen",
  label: "Für wen",
  headline: "Für wen. Und für wen ==nicht.==",
  yes: {
    title: "Für dich, wenn",
    items: [
      "Du führst eine GmbH oder Holding oder trägst hohe Führungsverantwortung.",
      "Du denkst in Systemen, nicht in Aufgaben.",
      "Du legst deine Zahlen offen, wenn du echtes Feedback willst.",
      "Du willst in den nächsten Jahren deutlich wachsen und weißt, dass du das nicht allein löst.",
    ],
  },
  no: {
    title: "Nicht für dich, wenn",
    items: [
      "Du suchst neue Kundinnen für dein Coaching.",
      "Du willst Austausch ohne Verbindlichkeit.",
      "Du suchst Motivation statt Umsetzung.",
      "Du suchst vor allem eine Bühne für dich selbst.",
    ],
  },
  foundationsHint: {
    text: "Du hast noch nicht gegründet, wirst es aber tun?",
    link: "Dafür gibt es FEMPIRE FOUNDATIONS",
    href: "#foundations",
  },
};

export type FormatStatus = "aktiv" | "start" | "vorbereitung";

/** Der Hauptkreis */
export const leaderCircle = {
  id: "leader-circle",
  label: "Leader Circle",
  headline: "Der ++Leader Circle.++",
  intro:
    "Der Kreis für Unternehmerinnen mit eigener GmbH oder Holding und für Frauen mit hoher Führungsverantwortung. Bestehendes Business, echte Zahlen, ein fester Rhythmus.",
  statusLabels: {
    aktiv: "Läuft bereits",
    start: "Ab Januar 2027",
    vorbereitung: "In Vorbereitung",
  } satisfies Record<FormatStatus, string>,
  items: [
    {
      title: "12 Treffen im Jahr",
      status: "start" as FormatStatus,
      body: "Jeden ersten Mittwoch im Monat, persönlich. Ein Thema, echte Zahlen, konkrete Entscheidungen. Dazu Events über das Jahr.",
    },
    {
      title: "Community-Hub",
      status: "aktiv" as FormatStatus,
      body: "Der geschlossene digitale Raum der Mitglieder. Hier teilt ihr Wissen, Kennzahlen und Kontakte, auch zwischen den Treffen. Ohne Algorithmus, ohne Öffentlichkeit.",
    },
    {
      title: "Masterminds",
      status: "vorbereitung" as FormatStatus,
      body: "Feste Kleingruppen, fester Rhythmus. Jede legt ihre Kennzahlen offen, die anderen stellen die unbequemen Fragen.",
    },
    {
      title: "FEMPIRE Academy",
      status: "vorbereitung" as FormatStatus,
      body: "Strukturierte Formate zu Holding, Finanzen, Führung und Skalierung. Von Unternehmerinnen, die es selbst umgesetzt haben.",
    },
    {
      title: "Retreats",
      status: "vorbereitung" as FormatStatus,
      body: "Mehrere Tage raus aus dem Tagesgeschäft. Strategie für das nächste Jahr, mit Frauen, die vor denselben Entscheidungen stehen.",
    },
  ],
  cta: { label: "Für den Leader Circle bewerben", href: "/bewerbung" },
};

/** Eigenständiges 12-Monats-Programm. Kein Vergleich mit dem Leader Circle, keine Stufen-Optik. */
export const foundations = {
  id: "foundations",
  label: "Foundations",
  headline: "FEMPIRE ==FOUNDATIONS.==",
  intro:
    "Ein eigenes Programm für Frauen, die gründen werden. Zwölf Monate mit einem klaren Ziel: dein Unternehmen steht. Mit starken Partnerinnen an deiner Seite, die dich fordern.",
  duration: { value: "12", unit: "Monate", note: "Definiertes Programm mit Abschluss" },
  items: [
    {
      title: "Eigene Treffen",
      body: "Monatlich, in einem eigenen Kreis mit Frauen in derselben Phase. Eigene Termine, eigener Raum.",
    },
    {
      title: "Begleitung durch die Gründerinnen",
      body: "Coaching und Sparring mit Angela Pister und Maria Elisabeth Doerk. Direkt, konkret, an deinem Vorhaben.",
    },
    {
      title: "Eigener Kanal",
      body: "Ein geschlossener Kanal für Fragen, Entwürfe und Entscheidungen zwischen den Treffen.",
    },
    {
      title: "Klarer Abschluss",
      body: "Nach zwölf Monaten endet das Programm. Danach kannst du dich für den Leader Circle bewerben.",
    },
  ],
  forWhom:
    "Für dich, wenn du gründen wirst und dafür Verbindlichkeit, Struktur und ehrliches Feedback suchst.",
  cta: { label: "Für FOUNDATIONS bewerben", href: "/bewerbung" },
};

/** Hinweis zur Trennung beider Kreise, steht unter FOUNDATIONS */
export const circlesNote =
  "Leader Circle und FEMPIRE FOUNDATIONS teilen die Marke, aber nie den Raum, nie den Chat, nie die Treffen. In welchen Kreis du gehörst, ordnen wir nach deiner Bewerbung zu.";

export const termine = {
  id: "termine",
  label: "Termine",
  headline: "Termine.",
  intro:
    "Der Leader Circle trifft sich 12 Mal im Jahr, jeden ersten Mittwoch im Monat. Den genauen Ort erhalten aufgenommene Mitglieder vorab. FOUNDATIONS hat eigene Termine.",
  /** So viele kommende Termine werden angezeigt. Die Terminregel steht in content/cities.ts. */
  show: 4,
  firstTitle: "Auftakt Leader Circle",
  regularTitle: "Leader Circle",
  note: "Ort für Mitglieder",
  events: {
    title: "Plus Events",
    body: "Zu den 12 festen Treffen kommen Events über das Jahr. Die Termine gehen rechtzeitig an alle Mitglieder.",
  },
};

export const gruenderinnen = {
  id: "gruenderinnen",
  label: "Gründerinnen",
  headline: "Markenwelt trifft auf ++skalierbare Struktur.++",
  intro:
    "Zwei Unternehmerinnen aus Osnabrück, die selbst liefern, was sie im Kreis einfordern. Beide führen eigene GmbHs, beide sind Mütter. Beide sind neurodivergent, deshalb läuft der Club direkt, schnell und ohne Umwege.",
  people: [
    {
      name: "Angela Pister",
      role: "Geschäftsführerin, LET IT CLICK GmbH",
      bio: "M.Sc. Informatik. Gründerin und Geschäftsführerin von Deutschlands größter Plattform für Fotografen. Außerdem Inhaberin der Marketing- und Medienagentur LIC Media in der Region Osnabrück: Social-Media-Strategie, High-End-Content, Short-Form-Video, Branding, Webentwicklung und visuelle B2B-Positionierung. Mutter einer Tochter.",
      club: "Im Club verantwortlich für Marke, Content, Ästhetik und das Erlebnis rund um jedes Treffen.",
      imageAlt: "Porträt Angela Pister",
      imageCaption: "Porträt Angela Pister. Foto folgt.",
    },
    {
      name: "Maria Elisabeth Doerk",
      role: "Geschäftsführerin, Walk With Me GmbH und MejWay GmbH",
      bio: "M.A. Geschichte, serielle Gründerin. Walk With Me betreibt Erlebnis- und Stadtführungen in Osnabrück, Münster, Oldenburg, Bielefeld und Paderborn. Mit MejWay verantwortet sie das Medienprojekt The Entrepreness, außerdem ist sie Mitgründerin von Eskapadia. Mutter von drei Kindern.",
      club: "Im Club verantwortlich für Struktur, Prozesse, Skalierung und den Aufbau weiterer Städte.",
      imageAlt: "Porträt Maria Elisabeth Doerk",
      imageCaption: "Porträt Maria Elisabeth Doerk. Foto folgt.",
    },
  ],
  /** Presse. Titel und Teaser wörtlich aus dem Artikel übernehmen, nichts umformulieren. */
  press: {
    label: "In der Presse",
    outlet: "Neue Osnabrücker Zeitung",
    date: "10. Dezember 2022",
    author: "Sandra Dorn",
    /** Screenshot des Artikels, liegt in public/presse/ */
    image: {
      src: "/presse/noz-doerk.png",
      width: 866,
      height: 650,
      alt: "Screenshot des NOZ-Artikels „Firmengründung als Mutter“ mit einem Foto von Maria Elisabeth Doerk",
      credit: "Screenshot: noz.de",
    },
    title: "Firmengründung als Mutter: Osnabrückerin über Vereinbarkeit, Burnout und Konsequenzen",
    teaser:
      "In der Osnabrücker Start-up-Szene gibt es wenige Frauen und noch weniger Mütter. „Eskapadia“-Gründerin Elisabeth Doerk über die Schwierigkeiten.",
    about: "Maria Elisabeth Doerk",
    url: "https://www.noz.de/lokales/osnabrueck/artikel/gruenden-mit-kind-osnabrueckerin-ueber-die-huerden-und-ihr-burnout-43718809",
    linkLabel: "Artikel lesen",
    paywallNote: "NOZ+, für Abonnentinnen",
  },
};

export const ablauf = {
  id: "ablauf",
  label: "Ablauf",
  headline: "Vier Schritte.",
  steps: [
    {
      title: "Bewerbung",
      // ANNAHME: Dauer der Bewerbung ca. 10 Minuten
      body: "Fünf kurze Schritte, rund zehn Minuten. Du beschreibst deine Situation, deine Zahlen oder dein Vorhaben und warum du in diesen Kreis willst.",
    },
    {
      title: "Prüfung",
      body: "Wir lesen jede Bewerbung selbst und ordnen dich dem passenden Kreis zu. Innerhalb von 10 Werktagen hörst du von uns.",
    },
    {
      title: "Kennenlerngespräch",
      // ANNAHME: Gespräch ca. 30 Minuten, persönlich oder per Video
      body: "Rund 30 Minuten, persönlich oder per Video. Wir prüfen gegenseitig, ob es passt, und besprechen die Investition.",
    },
    {
      title: "Aufnahme",
      body: "Du bekommst deinen Platz im Kreis und die Termine der nächsten Treffen.",
    },
  ],
};

export const closing = {
  id: "bewerbung",
  label: "Bewerbung",
  headline: "Dein Platz ++am Tisch.++",
  body: "Wenn du bis hierhin gelesen hast, weißt du, ob du hierher gehörst. Die Bewerbung dauert rund zehn Minuten. Welcher Kreis passt, ordnen wir für dich zu.",
  waitlist: {
    title: "Nicht aus Osnabrück?",
    body: `${plannedCities.map((city) => city.name).join(", ").replace(/, ([^,]*)$/, " und $1")} sind als nächste Städte geplant. Trag dich ein, wir melden uns, sobald dort ein Kreis startet.`,
    emailLabel: "E-Mail",
    cityLabel: "Stadt",
    submit: "Eintragen",
    doiNote:
      "Du erhältst eine E-Mail mit einem Bestätigungslink. Erst nach der Bestätigung stehst du auf der Liste. Abmeldung jederzeit.",
    privacyNote: "Details zur Verarbeitung in der",
    privacyLinkLabel: "Datenschutzerklärung",
    success: "Fast geschafft. Bitte bestätige deine Adresse über den Link in der E-Mail.",
  },
};
