/**
 * Texte des Mitgliederbereichs (/club) und des Backends (/club/admin).
 * Gleiche Regeln wie überall: Du-Anrede, weibliche Formen, kurze Sätze,
 * keine Ausrufezeichen, keine Emojis.
 */

/** Mitgliedschaften. Reihenfolge = Reihenfolge in Auswahlfeldern. Beträge stehen in content/membership.ts. */
export const tiers = [
  { value: "community", label: "Community-Mitgliedschaft", short: "Community" },
  { value: "founder", label: "Founder Circle", short: "Founder Circle" },
  { value: "leader", label: "Leader Circle", short: "Leader Circle" },
  { value: "mastermind", label: "Mastermind", short: "Mastermind" },
] as const;

export type Tier = (typeof tiers)[number]["value"];
export const tierValues = tiers.map((tier) => tier.value) as [Tier, ...Tier[]];

export function tierLabel(value: string | null | undefined, short = false): string {
  const tier = tiers.find((entry) => entry.value === value);
  return tier ? (short ? tier.short : tier.label) : "";
}

export const memberStatuses = [
  { value: "active", label: "Aktiv (bezahlt)" },
  { value: "paused", label: "Pausiert" },
  { value: "ended", label: "Beendet" },
] as const;
export type MemberStatus = (typeof memberStatuses)[number]["value"];

export const roles = [
  { value: "member", label: "Mitglied" },
  { value: "admin", label: "Admin" },
] as const;
export type Role = (typeof roles)[number]["value"];

/** Treff-Formate für Termine */
export const eventFormats = [
  { value: "workshop", label: "Workshop" },
  { value: "founder", label: "Founder Circle Treffen" },
  { value: "talk_walk", label: "Business Talk & Walk" },
  { value: "hot_seat", label: "Hot Seat" },
  { value: "mastermind", label: "Mastermind" },
  { value: "retreat", label: "Retreat" },
  { value: "event", label: "Event" },
] as const;
export type EventFormat = (typeof eventFormats)[number]["value"];
export const eventFormatValues = eventFormats.map((format) => format.value) as [EventFormat, ...EventFormat[]];

export function formatLabel(value: string): string {
  return eventFormats.find((format) => format.value === value)?.label ?? value;
}

export const eventStatuses = [
  { value: "draft", label: "Entwurf" },
  { value: "published", label: "Veröffentlicht" },
  { value: "cancelled", label: "Abgesagt" },
] as const;

export const applicationStatuses = [
  { value: "neu", label: "Neu" },
  { value: "geprueft", label: "Geprüft" },
  { value: "gespraech", label: "Kennenlerngespräch" },
  { value: "aufgenommen", label: "Aufgenommen" },
  { value: "abgelehnt", label: "Abgelehnt" },
] as const;

export const trialStatuses = [
  { value: "neu", label: "Neu" },
  { value: "bestaetigt", label: "Bestätigt" },
  { value: "abgesagt", label: "Abgesagt" },
] as const;

export function optionLabel(list: ReadonlyArray<{ value: string; label: string }>, value: string | null | undefined) {
  return list.find((entry) => entry.value === value)?.label ?? value ?? "";
}

export const club = {
  nav: [
    { label: "Übersicht", href: "/club" },
    { label: "Termine", href: "/club/termine" },
    { label: "Forum", href: "/club/forum" },
    { label: "Mitglieder", href: "/club/mitglieder" },
    { label: "Nachrichten", href: "/club/nachrichten" },
    { label: "Profil", href: "/club/profil" },
  ],
  adminLink: { label: "Backend", href: "/club/admin" },
  signOut: "Abmelden",

  inactive: {
    label: "Mitgliederbereich",
    headline: "Deine Mitgliedschaft ist nicht aktiv.",
    body: "Forum, Termine und Mitgliederverzeichnis sind freigeschaltet, sobald deine Mitgliedschaft aktiv ist. Bei Fragen antworte auf deine Aufnahme-Mail.",
  },
  noAccess: {
    headline: "Kein Zugang.",
    body: "Für dieses Konto ist noch keine Mitgliedschaft hinterlegt. Wenn das ein Fehler ist, antworte auf deine Aufnahme-Mail.",
  },

  dashboard: {
    greeting: "Willkommen, {name}.",
    nextEvents: "Nächste Termine",
    noEvents: "Gerade sind keine Termine veröffentlicht.",
    forum: "Neu im Forum",
    noThreads: "Noch keine Themen. Eröffne das erste.",
    magazin: "Neu im Magazin",
    messages: "Ungelesene Nachrichten",
    allEvents: "Alle Termine",
    toForum: "Zum Forum",
    toMessages: "Zu den Nachrichten",
    toMagazin: "Zum Magazin",
    membership: "Deine Mitgliedschaft",
    fee: "Mitgliedsbeitrag",
    status: "Status",
    included: "Enthalten",
    paymentQuestions: "Fragen zur Rechnung? Schreib uns über Nachrichten.",
  },

  events: {
    label: "Termine",
    headline: "Termine.",
    intro: "Alle Treffen, Workshops und Events. Zusagen helfen uns bei der Planung. Absagen geht bis zum Termin.",
    empty: "Gerade sind keine Termine veröffentlicht.",
    past: "Vergangene Termine",
    included: "In deiner Mitgliedschaft enthalten",
    price: "Teilnahmebeitrag",
    onlyFor: "Für",
    attend: "Zusagen",
    attending: "Du hast zugesagt",
    decline: "Absagen",
    full: "Ausgebucht",
    cancelled: "Abgesagt",
    seats: "{taken} von {capacity} Plätzen belegt",
    location: "Ort",
    locationTbd: "Ort folgt",
  },

  forum: {
    label: "Forum",
    headline: "Forum.",
    intro: "Der geschlossene Raum für Fragen, Zahlen und Erfahrungen. Nur für Mitglieder, nichts davon verlässt den Kreis.",
    newThread: "Neues Thema",
    empty: "Noch keine Themen. Eröffne das erste.",
    pending: "Wartet auf Freigabe",
    hidden: "Ausgeblendet",
    pinned: "Angeheftet",
    replies: "Antworten",
    reply: "Antworten",
    replyLabel: "Deine Antwort",
    titleLabel: "Titel",
    bodyLabel: "Worum geht es?",
    bodyHint: "Je konkreter, desto besser die Antworten. Zahlen helfen.",
    submit: "Zur Freigabe senden",
    submitted: "Danke. Dein Thema erscheint, sobald wir es freigegeben haben.",
    approvalNote: "Neue Themen geben wir vor der Veröffentlichung frei. Antworten erscheinen sofort.",
    back: "Zurück zum Forum",
    noReplies: "Noch keine Antworten.",
  },

  members: {
    label: "Mitglieder",
    headline: "Mitglieder.",
    intro: "Alle aktiven Mitglieder und das Team. Kontakt über den Website-Chat.",
    empty: "Noch keine Mitglieder.",
    team: "Team",
    message: "Nachricht schreiben",
    back: "Zurück zu den Mitgliedern",
    links: "Links",
  },

  messages: {
    label: "Nachrichten",
    headline: "Nachrichten.",
    intro: "Direkter Austausch mit anderen Mitgliedern. Nur ihr beide seht diese Unterhaltung.",
    empty: "Noch keine Unterhaltungen. Schreib jemandem über das Mitgliederverzeichnis.",
    you: "Du",
    placeholder: "Nachricht schreiben",
    send: "Senden",
    back: "Alle Nachrichten",
    startHint: "Schreib die erste Nachricht.",
  },

  profile: {
    label: "Profil",
    headline: "Dein Profil.",
    intro: "So sehen dich die anderen Mitglieder. E-Mail und Telefon bleiben verborgen.",
    fields: {
      fullName: "Name",
      company: "Unternehmen",
      position: "Position",
      city: "Stadt",
      website: "Website",
      linkedin: "LinkedIn",
      instagram: "Instagram",
      bio: "Über dich",
      bioHint: "Ein paar Sätze: woran du arbeitest und wobei du anderen helfen kannst.",
      avatar: "Foto",
      avatarHint: "JPG, PNG oder WebP, höchstens 3 MB. Wir schneiden es quadratisch zu.",
      removeAvatar: "Foto entfernen",
    },
    save: "Speichern",
    saved: "Gespeichert.",
    membership: "Mitgliedschaft",
  },

  errors: {
    generic: "Das hat nicht geklappt. Bitte versuch es noch einmal.",
    validation: "Bitte prüfe deine Eingaben.",
  },
};

export const admin = {
  label: "Backend",
  nav: [
    { label: "Übersicht", href: "/club/admin" },
    { label: "Bewerbungen", href: "/club/admin/bewerbungen" },
    { label: "Mitglieder", href: "/club/admin/mitglieder" },
    { label: "Magazin", href: "/club/admin/magazin" },
    { label: "Termine", href: "/club/admin/termine" },
    { label: "Schnuppern", href: "/club/admin/schnuppern" },
    { label: "Forum", href: "/club/admin/forum" },
  ],
};
