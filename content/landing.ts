/**
 * Alle Texte der Startseite, in der Reihenfolge der Sektionen.
 *
 * Regeln für neue Texte: Du-Anrede, weibliche Formen, kurze Sätze,
 * keine Ausrufezeichen, keine Emojis, keine Superlative, keine Preise.
 */

export const hero = {
  eyebrow: "Osnabrück // Application Only",
  headline: ["Kein Netzwerk.", "Ein Kreis."],
  subline:
    "Für Unternehmerinnen, die über Zahlen sprechen statt über Sichtbarkeit. Osnabrück. Application Only.",
  scarcity: "Start 2027. Begrenzte Plätze im Osnabrücker Kern-Kreis.",
  secondaryCta: { label: "Was hier anders läuft", href: "#manifest" },
};

export const manifest = {
  id: "manifest",
  label: "Manifest",
  headline: "Was hier anders läuft.",
  statements: [
    {
      title: "Wir reden über Umsatz, nicht über Reichweite.",
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
      body: "Der Kreis wächst nur so schnell, wie Vertrauen wachsen kann. Jede Aufnahme ist eine bewusste Entscheidung, auf beiden Seiten.",
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
  headline: "Für wen. Und für wen nicht.",
  yes: {
    title: "Für dich, wenn",
    items: [
      "Du führst eine GmbH oder Holding.",
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
      "Du bist noch in der Ideenphase.",
      "Du suchst vor allem eine Bühne für dich selbst.",
    ],
  },
};

export type FormatStatus = "start" | "vorbereitung";

export const formate = {
  id: "formate",
  label: "Formate",
  headline: "Formate.",
  intro:
    "Ein fester Rhythmus vor Ort, dazu Formate für die Zeit dazwischen. Wir starten mit dem Kern und bauen erst aus, wenn er trägt.",
  statusLabels: {
    start: "Start 2027",
    vorbereitung: "In Vorbereitung",
  } satisfies Record<FormatStatus, string>,
  items: [
    {
      title: "Treffen alle zwei Monate",
      status: "start" as FormatStatus,
      body: "In Osnabrück, persönlich. Ein Thema, echte Zahlen, konkrete Entscheidungen. Kein Vortragsabend.",
    },
    {
      title: "Masterminds",
      status: "vorbereitung" as FormatStatus,
      body: "Kleine Gruppen, fester Rhythmus. Jede legt ihre Kennzahlen offen, die anderen stellen die unbequemen Fragen.",
    },
    {
      title: "Community-Hub",
      status: "vorbereitung" as FormatStatus,
      body: "Digitaler, geschlossener Raum für den laufenden KPI-Austausch zwischen den Treffen. Ohne Algorithmus, ohne Öffentlichkeit.",
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
};

export const termine = {
  id: "termine",
  label: "Termine",
  headline: "Termine.",
  intro: "Der Osnabrücker Kern-Kreis trifft sich ab 2027 alle zwei Monate. Konkrete Daten und Ort erhalten aufgenommene Mitglieder rechtzeitig vorab.",
  /**
   * Einträge oben neu hinzufügen. `date` ist freier Text, z. B. "14. Januar 2027" oder "Frühjahr 2027".
   */
  items: [
    // ANNAHME: Auftakt Anfang 2027, genaues Datum steht noch nicht fest.
    { date: "Anfang 2027", title: "Auftakt Kern-Kreis", place: "Osnabrück", note: "Datum folgt" },
    { date: "Danach", title: "Treffen alle zwei Monate", place: "Osnabrück", note: "Feste Termine für das ganze Jahr" },
  ],
  /** Hinweis zur Gründungsphase */
  // ANNAHME: Stichtag ist der 1. April 2027. Höhe der Aufwandsentschädigung wird bewusst nicht genannt.
  foundingNote: {
    title: "Gründungsphase",
    body: "Bis zum 1. April 2027 erheben wir keinen Mitgliedsbeitrag. Pro Treffen fällt lediglich eine Aufwandsentschädigung an.",
  },
};

export const gruenderinnen = {
  id: "gruenderinnen",
  label: "Gründerinnen",
  headline: "Markenwelt trifft auf skalierbare Struktur.",
  intro:
    "Zwei Unternehmerinnen aus Osnabrück, die selbst liefern, was sie im Kreis einfordern. Beide führen eigene GmbHs, beide sind Mütter. Beide sind neurodivergent, deshalb läuft der Club direkt, schnell und ohne Umwege.",
  people: [
    {
      name: "Angela Pister",
      role: "Co-Geschäftsführerin, LET IT CLICK GmbH",
      bio: "Marketing- und Medienagentur in der Region Osnabrück. Social-Media-Strategie, High-End-Content, Short-Form-Video, Branding, Webentwicklung und visuelle B2B-Positionierung. Mutter einer Tochter.",
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
};

export const ablauf = {
  id: "ablauf",
  label: "Ablauf",
  headline: "Vier Schritte.",
  steps: [
    {
      title: "Bewerbung",
      // ANNAHME: Dauer der Bewerbung ca. 10 Minuten
      body: "Fünf kurze Schritte, rund zehn Minuten. Du beschreibst dein Unternehmen, deine Zahlen und warum du in diesen Kreis willst.",
    },
    {
      title: "Prüfung",
      body: "Wir lesen jede Bewerbung selbst. Innerhalb von 10 Werktagen hörst du von uns.",
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
  headline: "Dein Platz am Tisch.",
  body: "Wenn du bis hierhin gelesen hast, weißt du, ob du hierher gehörst. Die Bewerbung dauert rund zehn Minuten.",
  waitlist: {
    title: "Nicht aus Osnabrück?",
    body: "Münster, Hamburg und Frankfurt sind als nächste Städte geplant. Trag dich ein, wir melden uns, sobald dort ein Kreis startet.",
    cities: ["Münster", "Hamburg", "Frankfurt", "Andere Stadt"],
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
