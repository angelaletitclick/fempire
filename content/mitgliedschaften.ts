/**
 * Seite /mitgliedschaften: alle Mitgliedschaften mit Beschreibung, für wen, Rhythmus und Verbindlichkeit.
 * Keine Beträge hier, die stehen nur auf /mitgliedsbeitrag (content/membership.ts).
 * Was enthalten ist, kommt aus content/membership.ts (included), die Verbindlichkeit aus content/funnel.ts.
 */

import type { Tier } from "./club";

export const mitgliedschaften = {
  meta: {
    title: "Mitgliedschaften",
    description: "Community, Founder Circle, Leader Circle und Masterminds: für wen welche Mitgliedschaft gedacht ist und was dazugehört.",
  },
  label: "Mitgliedschaften",
  headline: "Vier Wege ++in den Club.++",
  intro:
    "Jede Mitgliedschaft hat ein eigenes Ziel und einen eigenen Rhythmus. Wähle die, die zu deiner Phase passt. Jede baut auf der vorigen auf, Masterminds enthalten alles.",
  jumpLabel: "Direkt zu",
  labels: {
    for: "Für dich, wenn",
    notFor: "Nicht für dich, wenn",
    rhythm: "Rhythmus",
    included: "Was dazugehört",
    commitment: "Verbindlichkeit",
  },
  priceLink: { label: "Beiträge im Überblick", href: "/mitgliedsbeitrag" },
  ctaTemplate: "Mitglied werden: {name}",

  circles: [
    {
      tier: "community" as Tier,
      name: "Community",
      tagline: "Teil der Gemeinschaft, ohne festen Kreis.",
      description:
        "Die Community ist der digitale Raum des Clubs. Du kennst alle Mitglieder, schreibst sie direkt an, stellst deine Fragen im geschlossenen Forum und liest alle Artikel für Mitglieder. Die festen Treffen gehören zu den Kreisen.",
      for: ["Du willst Kontakt zu Unternehmerinnen, die über Zahlen sprechen.", "Dir fehlt gerade die Zeit für feste Treffen.", "Du willst den Club erst einmal von innen kennenlernen."],
      notFor: ["Du suchst eine feste Runde, die dich jeden Monat fordert."],
      rhythm: "Jederzeit digital. Termine und Events siehst du im Mitgliederbereich.",
    },
    {
      tier: "founder" as Tier,
      name: "Founder Circle",
      tagline: "Zwölf Monate bis zur Gründung.",
      description:
        "Ein eigenes Programm für Frauen, die gründen werden. Zwölf Monate mit klarem Ziel: dein Unternehmen steht. Eigene Treffen mit Frauen in derselben Phase, begleitet von Angela Pister und Maria Elisabeth Doerk.",
      for: ["Du wirst gründen und willst es strukturiert angehen.", "Du suchst Sparring, das dich fordert, nicht nur bestärkt.", "Du willst sichtbar werden, wenn es darauf ankommt."],
      notFor: ["Du führst schon ein laufendes Unternehmen. Dann ist der Leader Circle dein Kreis."],
      rhythm: "Ein eigenes Treffen im Monat, Workshops und Community dazu. Nach zwölf Monaten endet das Programm.",
    },
    {
      tier: "leader" as Tier,
      name: "Leader Circle",
      tagline: "Der feste Kreis für Unternehmerinnen.",
      description:
        "Der Hauptkreis des Clubs. Für Unternehmerinnen mit eigener GmbH oder Holding und Frauen mit hoher Führungsverantwortung. Bestehendes Business, echte Zahlen, ein fester Rhythmus. Einmal im Quartal steht dein Unternehmen im Hot Seat.",
      for: ["Du führst ein laufendes Unternehmen oder trägst hohe Führungsverantwortung.", "Du legst deine Zahlen offen, wenn du echtes Feedback willst.", "Du planst feste Termine und hältst sie."],
      notFor: ["Du suchst neue Kundinnen für dein Angebot.", "Du willst Austausch ohne Verbindlichkeit."],
      rhythm: "Zwölf Treffen im Jahr, jeden ersten Dienstag im Monat. Dazu Business Talk & Walk, Workshops und einmal im Quartal Hot Seats.",
    },
    {
      tier: "mastermind" as Tier,
      name: "Masterminds",
      tagline: "Die feste Kleingruppe für den nächsten Sprung.",
      description:
        "Alles aus dem Leader Circle, dazu eine feste Kleingruppe mit festem Rhythmus. Jede legt ihre Kennzahlen offen, die anderen stellen die unbequemen Fragen. Für Unternehmerinnen, die an einem großen Schritt arbeiten.",
      for: ["Du arbeitest an einem großen Schritt: Standort, Holding, Führungsebene, Exit.", "Du willst eine Gruppe, die dich ein Jahr lang begleitet.", "Du bist bei jeder Sitzung dabei."],
      notFor: ["Dir reicht der Austausch im Leader Circle."],
      rhythm: "Feste Sitzungen in der Kleingruppe, dazu alles aus dem Leader Circle inklusive Hot Seats.",
    },
  ],

  trial: {
    title: "Noch unsicher?",
    body: "Besuch ein Treffen einmalig als Gast, inklusive Heißgetränk. Danach weißt du, ob und welcher Kreis zu dir passt.",
    cta: { label: "Schnuppertermin anfragen", href: "/schnuppern" },
  },
};
