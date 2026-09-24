/**
 * Texte der automatischen E-Mails. {name}, {city} usw. werden automatisch ersetzt.
 */
export const mails = {
  signature: "Angela Pister und Maria Elisabeth Doerk\nFEMPIRE CLUB, Osnabrück",

  applicationConfirmation: {
    subject: "Deine Bewerbung beim FEMPIRE CLUB",
    greeting: "Hallo {name},",
    body: [
      "deine Bewerbung ist bei uns angekommen. Danke für die offenen Antworten.",
      "Wir lesen jede Bewerbung selbst. Innerhalb von 10 Werktagen hörst du von uns. Wenn es passt, vereinbaren wir ein Kennenlerngespräch von rund 30 Minuten, persönlich oder per Video. Dort besprechen wir auch die Investition.",
      "Bis dahin musst du nichts weiter tun. Wenn du etwas ergänzen willst, antworte einfach auf diese Mail.",
    ],
  },

  applicationNotification: {
    subject: "Neue Bewerbung: {name}, Vorschlag {circle} (Score {score})",
    intro: "Neue Bewerbung über fempireclub.de. Kreis-Vorschlag und Score sind nur intern sichtbar. Die Zuordnung trefft ihr.",
    circleLabel: "Kreis-Vorschlag (aus Schritt 2)",
    circleLeader: "Leader Circle",
    circleFoundations: "FEMPIRE FOUNDATIONS",
  },

  waitlistConfirm: {
    subject: "Bitte bestätige deine Eintragung für {city}",
    greeting: "Hallo,",
    body: [
      "du hast dich auf die Warteliste des FEMPIRE CLUB für {city} eingetragen. Bitte bestätige deine Adresse über den folgenden Link. Erst danach stehst du auf der Liste.",
      "Wenn du dich nicht eingetragen hast, ignoriere diese Mail einfach. Ohne Bestätigung speichern wir nichts dauerhaft.",
    ],
    button: "Eintragung bestätigen",
    unsubscribe: "Von der Warteliste abmelden",
  },
};
