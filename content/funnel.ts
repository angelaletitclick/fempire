/**
 * Texte und Auswahloptionen des Bewerbungsfunnels (/bewerbung) und der Danke-Seite.
 *
 * Optionen: `value` wird in der Datenbank gespeichert und vom Scoring gelesen,
 * deshalb nur `label` ändern. Neue Optionen bekommen einen neuen, eindeutigen `value`.
 */

export const funnel = {
  meta: {
    title: "Bewerbung",
    description: "Bewirb dich für den FEMPIRE CLUB. Fünf Schritte, rund zehn Minuten.",
  },
  intro: {
    label: "Bewerbung",
    headline: "Fünf Schritte. ==Rund zehn Minuten.==",
    body: "Wir lesen jede Bewerbung selbst und ordnen dich dem passenden Kreis zu. Je konkreter du antwortest, desto besser gelingt das. Deine Eingaben werden auf diesem Gerät zwischengespeichert, du kannst also jederzeit pausieren.",
  },
  exit: { label: "Zurück zur Startseite", href: "/" },
  nav: {
    back: "Zurück",
    next: "Weiter",
    submit: "Bewerbung absenden",
    submitting: "Wird gesendet",
    stepOf: (current: number, total: number) => `Schritt ${current} von ${total}`,
  },
  optional: "optional",
  restored: "Dein letzter Zwischenstand wurde wiederhergestellt.",
  /**
   * Fünf Schritte. Schritt 2 („situation“) entscheidet über den weiteren Pfad:
   * Wer noch nicht gegründet hat, bekommt in Schritt 3 die Fragen zum Vorhaben
   * (FOUNDATIONS), alle anderen die Fragen zu den Zahlen (Leader Circle).
   * Die Bewerberin wählt dabei nie einen Kreis, sie beschreibt nur ihre Situation.
   */
  steps: [
    { id: "person", title: "Zu dir" },
    { id: "situation", title: "Deine Situation" },
    { id: "plan", title: "Deine Zahlen", titleFoundations: "Dein Vorhaben" },
    { id: "passung", title: "Passung" },
    { id: "bestaetigung", title: "Absenden" },
  ],
  fields: {
    name: { label: "Vor- und Nachname" },
    email: { label: "E-Mail" },
    phone: { label: "Telefon", hint: "Für eine schnelle Terminabstimmung zum Kennenlerngespräch." },
    city: { label: "Stadt", hint: "Wo würdest du an den Treffen teilnehmen?" },
    cityOther: { label: "Welche Stadt?" },
    profileUrl: { label: "Website, LinkedIn oder Instagram", hint: "Ein Link, über den wir dich besser kennenlernen." },
    stage: { label: "Wo stehst du gerade?" },
    company: { label: "Firmenname" },
    legalForm: { label: "Rechtsform" },
    role: { label: "Deine Rolle" },
    foundedYear: { label: "Gründungsjahr" },
    employees: { label: "Mitarbeiterinnen und Mitarbeiter" },
    industry: { label: "Branche", labelFoundations: "Branche oder Bereich deines Vorhabens" },
    currentActivity: { label: "Was machst du beruflich gerade?", hint: "Zum Beispiel angestellt, in Elternzeit, nebenberuflich selbstständig." },
    foundingTimeline: { label: "Wann willst du gründen?" },
    revenueRange: {
      label: "Jahresumsatz im letzten Geschäftsjahr",
      hint: "Nur als Spanne. Die genauen Zahlen besprechen wir, wenn überhaupt, im Kreis.",
    },
    idea: { label: "Was willst du gründen?", hint: "Dein Vorhaben in ein paar Sätzen: Angebot, Zielgruppe, Geschäftsmodell." },
    goal12m: {
      label: "Dein Ziel für die nächsten 12 Monate",
      hint: "Gern mit Zahl: Umsatz, Marge, Team, Standorte.",
      labelFoundations: "Wo willst du in 12 Monaten stehen?",
      hintFoundations: "Möglichst konkret: gegründet, erste Kundinnen, erster Umsatz, Team.",
    },
    bottleneck: {
      label: "Dein größter Engpass gerade",
      hint: "Was hält dich konkret auf?",
      labelFoundations: "Was hat dich bisher vom Start abgehalten?",
    },
    motivation: { label: "Warum dieser Kreis?" },
    contribution: { label: "Was bringst du ein?", hint: "Erfahrung, Netzwerk, Know-how, das anderen weiterhilft." },
    hasChildren: {
      label: "Hast du Kinder?",
      hint: "Freiwillig. Hilft uns, Termine und Formate so zu planen, dass sie für Mütter funktionieren.",
    },
    timeCommitment: { label: "Wie viel Zeit kannst du investieren?" },
    privacy: {
      label: "Ich habe die Datenschutzerklärung gelesen und bin einverstanden, dass meine Angaben zur Prüfung meiner Bewerbung verarbeitet werden.",
      linkLabel: "Datenschutzerklärung",
    },
  },
  options: {
    /** Beschreibt die Situation, nicht den Kreis. vor_gruendung führt in den FOUNDATIONS-Pfad. */
    stage: [
      { value: "unternehmen", label: "Ich führe ein eigenes Unternehmen" },
      { value: "fuehrung", label: "Ich trage Führungsverantwortung in einem Unternehmen" },
      { value: "vor_gruendung", label: "Ich habe noch nicht gegründet, werde es aber tun" },
    ],
    legalForm: [
      { value: "gmbh", label: "GmbH" },
      { value: "ug", label: "UG (haftungsbeschränkt)" },
      { value: "holding", label: "Holding-Struktur" },
      { value: "gmbh_co_kg", label: "GmbH & Co. KG" },
      { value: "ag", label: "AG" },
      { value: "einzel", label: "Einzelunternehmen" },
      { value: "freiberuflich", label: "Freiberuflich" },
      { value: "angestellt", label: "Angestellt (Management)" },
      { value: "andere", label: "Andere" },
    ],
    role: [
      { value: "gruenderin_gf", label: "Gründerin und Geschäftsführerin" },
      { value: "gf", label: "Geschäftsführerin" },
      { value: "gesellschafterin", label: "Gesellschafterin" },
      { value: "investorin", label: "Investorin" },
      { value: "c_level", label: "Vorständin / C-Level" },
      { value: "fuehrungskraft", label: "Führungskraft" },
      { value: "selbststaendig", label: "Selbstständig" },
      { value: "andere", label: "Andere" },
    ],
    employees: [
      { value: "0", label: "Nur ich" },
      { value: "1-5", label: "1 bis 5" },
      { value: "6-20", label: "6 bis 20" },
      { value: "21-50", label: "21 bis 50" },
      { value: "51-200", label: "51 bis 200" },
      { value: "200+", label: "Mehr als 200" },
    ],
    foundingTimeline: [
      { value: "3m", label: "In den nächsten 3 Monaten" },
      { value: "6m", label: "In den nächsten 6 Monaten" },
      { value: "12m", label: "In den nächsten 12 Monaten" },
      { value: "offen", label: "Noch offen" },
    ],
    revenueRange: [
      { value: "lt250k", label: "Unter 250.000 €" },
      { value: "250k-500k", label: "250.000 bis 500.000 €" },
      { value: "500k-1m", label: "500.000 € bis 1 Mio. €" },
      { value: "1m-3m", label: "1 bis 3 Mio. €" },
      { value: "gt3m", label: "Mehr als 3 Mio. €" },
      { value: "angestellt", label: "Nicht zutreffend, ich bin angestellt" },
    ],
    hasChildren: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" },
      { value: "", label: "Keine Angabe" },
    ],
    timeCommitment: [
      { value: "fest", label: "Jedes Treffen, fest eingeplant" },
      { value: "meiste", label: "Die meisten Treffen" },
      { value: "unregelmaessig", label: "Eher unregelmäßig" },
    ],
  },
  summary: {
    title: "Kurz prüfen",
    body: "So kommt deine Bewerbung bei uns an. Über „Zurück“ kannst du alles ändern.",
  },
  errors: {
    generic: "Das hat nicht geklappt. Bitte versuch es in ein paar Minuten noch einmal.",
    rateLimit: "Zu viele Versuche von diesem Anschluss. Bitte versuch es in einer Stunde noch einmal.",
    validation: "Bitte prüfe die markierten Felder.",
  },
};

export const danke = {
  meta: { title: "Bewerbung eingegangen" },
  label: "Bewerbung eingegangen",
  headline: "Danke. ==Wir lesen jetzt.==",
  body: "Deine Bewerbung ist bei uns angekommen. Du erhältst in wenigen Minuten eine Bestätigung per E-Mail.",
  nextTitle: "So geht es weiter",
  next: [
    { title: "Prüfung", body: "Wir lesen deine Bewerbung selbst, beide Gründerinnen." },
    { title: "Rückmeldung", body: "Innerhalb von 10 Werktagen hörst du von uns, per E-Mail." },
    { title: "Kennenlerngespräch", body: "Wenn es passt, vereinbaren wir rund 30 Minuten, persönlich oder per Video." },
  ],
  mailHint: "Keine Bestätigung bekommen? Schau im Spam-Ordner nach.",
  back: { label: "Zur Startseite", href: "/" },
};
