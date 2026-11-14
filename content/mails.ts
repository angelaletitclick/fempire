/**
 * Texte der automatischen E-Mails. {name}, {city} usw. werden automatisch ersetzt.
 */
export const mails = {
  signature: "Angela Pister und Maria Elisabeth Doerk\nFEMPIRE CLUB, Osnabrück",

  applicationConfirmation: {
    subject: "Deine Bewerbung beim FEMPIRE CLUB",
    greeting: "Hallo {name},",
    body: [
      "deine Bewerbung für {circle} ist bei uns angekommen. Danke für die offenen Antworten.",
      "Wir lesen jede Bewerbung selbst. Innerhalb von 10 Werktagen hörst du von uns. Wenn es passt, vereinbaren wir ein Kennenlerngespräch von rund 30 Minuten, persönlich oder per Video. Dort besprechen wir auch die Investition.",
      "Bis dahin musst du nichts weiter tun. Wenn du etwas ergänzen willst, antworte einfach auf diese Mail.",
    ],
  },

  applicationNotification: {
    subject: "Neue Bewerbung: {name}, {circle} (Score {score})",
    intro: "Neue Bewerbung über fempireclub.de. Der Score ist nur intern sichtbar.",
    circleLabel: "Beworben für",
    codeLabel: "Einladungscode",
  },

  /** An das Team: jemand ist über einen Einladungscode ohne Bewerbung Mitglied geworden */
  directJoinNotification: {
    subject: "Neues Mitglied über Code {code}: {name}, {circle}",
    intro: "Über einen Einladungscode ohne Bewerbung angelegt. Status und Beitrag seht ihr im Backend unter Mitglieder.",
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

  /** Nach der Aufnahme im Backend. {tier} = Mitgliedschaft, {loginUrl} = Link zur Anmeldung */
  welcome: {
    subject: "Willkommen im FEMPIRE CLUB",
    greeting: "Hallo {name},",
    body: [
      "dein Mitgliederbereich ist freigeschaltet: {tier}. Schön, dass du dabei bist.",
      "Im Mitgliederbereich findest du alle Termine, das Forum, das Verzeichnis der anderen Mitglieder und die Artikel für Mitglieder. Du meldest dich mit dieser E-Mail-Adresse an, ohne Passwort. Wir schicken dir dafür jedes Mal einen Link.",
      "Leg als Erstes dein Profil an: Foto, Unternehmen, Position und ein paar Sätze über dich. So wissen die anderen, mit wem sie es zu tun haben.",
    ],
    button: "Zum Mitgliederbereich",
  },

  /** Aufnahme über die Bewerbung: Zusage mit Bitte um den ersten Beitrag. Freigeschaltet wird erst danach. */
  accepted: {
    subject: "Deine Aufnahme in den FEMPIRE CLUB",
    greeting: "Hallo {name},",
    body: [
      "du bist aufgenommen: {tier}. Wir freuen uns auf dich.",
      "Dein Beitrag: {price} {period} ({vat}).{codeNote}",
      "Bevor wir den Mitgliederbereich für dich freischalten, überweise bitte deinen ersten Monatsbeitrag. Die Rechnung mit allen Angaben zur Überweisung bekommst du in den nächsten Tagen per E-Mail.",
      "Sobald der Beitrag eingegangen ist, schalten wir dich frei. Du bekommst dann eine zweite Mail mit dem Zugang zum Mitgliederbereich.",
      "Fragen? Antworte einfach auf diese Mail.",
    ],
  },

  /** Absage nach Prüfung oder Gespräch */
  rejection: {
    subject: "Deine Bewerbung beim FEMPIRE CLUB",
    greeting: "Hallo {name},",
    body: [
      "danke für deine Bewerbung und die Zeit, die du dir dafür genommen hast.",
      "Wir haben uns entschieden, dir aktuell keinen Platz anzubieten. Meist liegt das an der Phase, nicht an der Person. Eine Absage ist keine Bewertung von dir.",
      "Wenn sich deine Situation verändert, kannst du dich gern erneut bewerben.",
    ],
  },

  /** Schnuppertermin: Bestätigung an die Interessentin */
  trialConfirmation: {
    subject: "Deine Anfrage für einen Schnuppertermin",
    greeting: "Hallo {name},",
    body: [
      "deine Anfrage für den Termin am {date} ist bei uns angekommen.",
      "Wir melden uns in den nächsten Tagen mit allen Details zu Ort und Ablauf. Die Plätze sind begrenzt, deshalb bestätigen wir jeden Schnuppertermin persönlich.",
    ],
  },

  /** Schnuppertermin: Benachrichtigung an das Team */
  trialNotification: {
    subject: "Schnupper-Anfrage: {name} für {date}",
    intro: "Neue Anfrage für einen Schnuppertermin. Bestätigen oder absagen im Backend unter Schnuppern.",
  },

  /** Neues Forum-Thema wartet auf Freigabe */
  forumPending: {
    subject: "Forum: neues Thema wartet auf Freigabe",
    body: "{author} hat ein neues Thema eröffnet: „{title}“. Freigeben im Backend unter Forum.",
    button: "Zur Freigabe",
  },

  /** Neue Nachricht im Website-Chat. Der Inhalt steht bewusst nicht in der Mail. */
  newMessage: {
    subject: "Neue Nachricht von {sender} im FEMPIRE CLUB",
    greeting: "Hallo {name},",
    body: [
      "{sender} hat dir im Mitgliederbereich eine Nachricht geschrieben.",
      "Aus Datenschutzgründen steht der Inhalt nicht in dieser Mail. Du liest und beantwortest sie im Mitgliederbereich.",
    ],
    button: "Nachricht lesen",
    note: "Du bekommst eine Mail pro Unterhaltung, solange du die Nachrichten noch nicht gelesen hast.",
  },
};
