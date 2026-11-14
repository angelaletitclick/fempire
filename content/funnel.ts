/**
 * Texte und Auswahloptionen der Bewerbung (/bewerbung, „Mitglied werden“) und der Danke-Seite.
 *
 * Die Bewerberin wählt im ersten Schritt ihren Kreis. Jeder Kreis hat eigene Fragen und eine eigene
 * Verbindlichkeitserklärung. Mit einem Einladungscode, der die Bewerbung überspringt, entfallen die
 * Fragen: Kreis, Angaben zur Person, Verbindlichkeit.
 *
 * Optionen: `value` wird in der Datenbank gespeichert und vom Scoring gelesen,
 * deshalb nur `label` ändern. Neue Optionen bekommen einen neuen, eindeutigen `value`.
 */

import type { Tier } from "./club";

export const funnel = {
  meta: {
    title: "Mitglied werden",
    description: "Werde Mitglied im FEMPIRE CLUB. Wähle deinen Kreis und bewirb dich in rund acht Minuten.",
  },
  intro: {
    label: "Mitglied werden",
    headline: "Mitglied ==werden.==",
    body: "Wähle den Kreis, der zu deiner Phase passt. Jeder Kreis hat eigene Fragen. Wir lesen jede Bewerbung selbst. Deine Eingaben werden auf diesem Gerät zwischengespeichert, du kannst also jederzeit pausieren.",
  },
  exit: { label: "Zurück zur Startseite", href: "/" },
  nav: {
    back: "Zurück",
    next: "Weiter",
    submit: "Verbindlich bewerben",
    submitDirect: "Mitglied werden",
    submitting: "Wird gesendet",
    stepOf: (current: number, total: number) => `Schritt ${current} von ${total}`,
  },
  optional: "optional",
  restored: "Dein letzter Zwischenstand wurde wiederhergestellt.",

  /** Schritt-Titel. Wo sie sich je Kreis unterscheiden, stehen sie pro Kreis. */
  steps: {
    kreis: "Dein Kreis",
    person: "Zu dir",
    situation: {
      community: "Was du machst",
      founder: "Dein Vorhaben",
      leader: "Dein Unternehmen",
      mastermind: "Dein Unternehmen",
    } satisfies Record<Tier, string>,
    fragen: {
      community: "Was du suchst",
      founder: "Deine Ziele",
      leader: "Deine Zahlen",
      mastermind: "Zahlen und Fokus",
    } satisfies Record<Tier, string>,
    bestaetigung: "Verbindlich absenden",
    bestaetigungDirect: "Mitglied werden",
  },

  /** Auswahl im ersten Schritt. Reihenfolge = Reihenfolge der Karten. */
  circles: [
    {
      tier: "community" as Tier,
      name: "Community",
      for: "Für dich, wenn du Teil der Gemeinschaft sein willst, ohne festen Kreis.",
      commitment: "Monatlicher Beitrag. Digitaler Austausch, Forum, Magazin, alle Termine im Blick.",
      pledge:
        "Ich werde verbindlich Mitglied der Community. Wenn ich aufgenommen werde, zahle ich den monatlichen Beitrag und gehe vertraulich mit allem um, was im Club geteilt wird.",
    },
    {
      tier: "founder" as Tier,
      name: "Founder Circle",
      for: "Für Frauen, die gründen werden. Zwölf Monate mit klarem Ziel: dein Unternehmen steht.",
      commitment: "Zwölf Monate Programm, eigene monatliche Treffen, monatlicher Beitrag.",
      pledge:
        "Ich bewerbe mich verbindlich für den Founder Circle. Wenn ich aufgenommen werde, nehme ich an den monatlichen Treffen teil, arbeite zwölf Monate an meiner Gründung und zahle den monatlichen Beitrag.",
    },
    {
      tier: "leader" as Tier,
      name: "Leader Circle",
      for: "Für Unternehmerinnen mit eigener GmbH oder Holding und Frauen mit hoher Führungsverantwortung.",
      commitment: "Zwölf Treffen im Jahr am ersten Dienstag, Hot Seats, monatlicher Beitrag.",
      pledge:
        "Ich bewerbe mich verbindlich für den Leader Circle. Wenn ich aufgenommen werde, plane ich die Treffen am ersten Dienstag im Monat fest ein, lege im Kreis meine Zahlen offen und zahle den monatlichen Beitrag.",
    },
    {
      tier: "mastermind" as Tier,
      name: "Masterminds",
      for: "Für Unternehmerinnen, die in einer festen Kleingruppe am nächsten Sprung arbeiten.",
      commitment: "Feste Kleingruppe, jede Sitzung, offene Kennzahlen, monatlicher Beitrag.",
      pledge:
        "Ich bewerbe mich verbindlich für eine Mastermind-Gruppe. Wenn ich aufgenommen werde, bin ich bei jeder Sitzung meiner Kleingruppe dabei, komme vorbereitet, lege meine Kennzahlen offen und zahle den monatlichen Beitrag.",
    },
  ],
  circleLegend: "Für welchen Kreis bewirbst du dich?",
  circleCommitmentLabel: "Das heißt verbindlich",
  circleError: "Bitte wähle einen Kreis.",
  circleHint: "Du bist unsicher? Lern uns vorher bei einem Schnuppertermin kennen.",
  trialLink: { label: "Schnuppertermin anfragen", href: "/schnuppern" },
  circlesLink: { label: "Alle Mitgliedschaften im Detail", href: "/mitgliedschaften" },

  code: {
    label: "Einladungscode",
    hint: "Du hast eine Einladung bekommen? Gib den Code hier ein.",
    apply: "Einlösen",
    checking: "Wird geprüft",
    remove: "Code entfernen",
    valid: "Dein Code:",
    invalid: "Dieser Code ist ungültig, abgelaufen oder schon aufgebraucht.",
    wrongCircle: "Dieser Code gilt nur für: {tiers}.",
    skipNote: "Mit diesem Code wirst du ohne Bewerbung Mitglied. Es fehlen nur noch deine Angaben.",
    rateLimit: "Zu viele Versuche. Bitte versuch es später noch einmal.",
  },

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
    industry: {
      label: "Branche",
      labelFoundations: "Branche oder Bereich deines Vorhabens",
      labelCommunity: "Branche oder Bereich",
    },
    currentActivity: {
      label: "Was machst du beruflich gerade?",
      hint: "Zum Beispiel angestellt, in Elternzeit, nebenberuflich selbstständig.",
      labelCommunity: "Was machst du beruflich?",
      hintCommunity: "Selbstständig, angestellt, in Gründung, in Elternzeit. Ein, zwei Sätze reichen.",
    },
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
    expectation: {
      label: "Was suchst du in der Community?",
      hint: "Austausch zu welchen Themen, Kontakte, Inspiration, Rückhalt. Je konkreter, desto besser.",
    },
    mastermindFocus: {
      label: "Woran willst du in der Kleingruppe arbeiten?",
      hint: "Das eine Thema, das dich im nächsten Jahr am weitesten bringt. Zum Beispiel zweiter Standort, Holding, Führungsebene, Exit.",
    },
    hasChildren: {
      label: "Hast du Kinder?",
      hint: "Freiwillig. Hilft uns, Termine und Formate so zu planen, dass sie für Mütter funktionieren.",
    },
    timeCommitment: { label: "Wie viel Zeit kannst du investieren?" },
    commitment: { error: "Bitte bestätige die Verbindlichkeit." },
    privacy: {
      label: "Ich habe die Datenschutzerklärung gelesen und bin einverstanden, dass meine Angaben zur Prüfung meiner Bewerbung verarbeitet werden.",
      labelDirect:
        "Ich habe die Datenschutzerklärung gelesen und bin einverstanden, dass meine Angaben für meine Mitgliedschaft verarbeitet werden.",
      linkLabel: "Datenschutzerklärung",
    },
  },
  options: {
    /** Leader Circle und Masterminds: eigenes Unternehmen oder Führungsverantwortung */
    stage: [
      { value: "unternehmen", label: "Ich führe ein eigenes Unternehmen" },
      { value: "fuehrung", label: "Ich trage Führungsverantwortung in einem Unternehmen" },
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
    body: "So kommt deine Bewerbung bei uns an. Über „Ändern“ kannst du alles anpassen.",
    bodyDirect: "So legen wir deine Mitgliedschaft an. Über „Ändern“ kannst du alles anpassen.",
    edit: "Ändern",
  },
  errors: {
    generic: "Das hat nicht geklappt. Bitte versuch es in ein paar Minuten noch einmal.",
    rateLimit: "Zu viele Versuche von diesem Anschluss. Bitte versuch es in einer Stunde noch einmal.",
    validation: "Bitte prüfe die markierten Felder.",
    codeInvalid: "Der Einladungscode gilt nicht mehr. Bitte entferne ihn oder prüfe ihn erneut.",
    exists: "Für diese E-Mail-Adresse gibt es schon ein Konto. Melde dich im Mitgliederbereich an oder schreib uns.",
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
  /** Nach Aufnahme über einen Einladungscode ohne Bewerbung (/danke?direkt=1) */
  direct: {
    label: "Willkommen",
    headline: "Willkommen ==im Club.==",
    body: "Deine Mitgliedschaft ist angelegt. Alles Weitere steht in der E-Mail, die gerade zu dir unterwegs ist.",
    next: [
      { title: "Postfach", body: "In wenigen Minuten bekommst du eine E-Mail mit allen Details zu deiner Mitgliedschaft." },
      { title: "Anmelden", body: "Im Mitgliederbereich meldest du dich mit deiner E-Mail-Adresse an, ohne Passwort." },
      { title: "Profil", body: "Leg als Erstes dein Profil an, damit die anderen wissen, mit wem sie es zu tun haben." },
    ],
  },
};
