/** Seite /schnuppern: Anfrage für einen einzelnen Schnuppertermin. Keine Beträge hier, die stehen auf /mitgliedsbeitrag. */
export const schnuppern = {
  meta: {
    title: "Schnuppertermin",
    description: "Ein Treffen des FEMPIRE CLUB einmalig kennenlernen, bevor du dich bewirbst.",
  },
  label: "Schnuppertermin",
  headline: "Komm ++vorbei.++",
  intro:
    "Ausgewählte Treffen kannst du einmalig als Gast besuchen, inklusive Heißgetränk. Die Plätze sind begrenzt, deshalb bestätigen wir jede Anfrage persönlich.",
  priceNote: "Den Beitrag für einen Schnuppertermin findest du unter",
  priceLink: "Mitgliedsbeitrag",
  empty: "Gerade ist kein Termin für Schnuppergäste offen. Schau bald wieder vorbei oder bewirb dich direkt.",
  fields: {
    event: "Termin",
    name: "Name",
    email: "E-Mail",
    phone: "Telefon",
    company: "Unternehmen",
    message: "Was möchtest du uns vorab sagen?",
  },
  privacy: "Ich bin einverstanden, dass meine Angaben zur Bearbeitung meiner Anfrage verarbeitet werden. Details in der",
  privacyLink: "Datenschutzerklärung",
  submit: "Anfrage senden",
  success: "Danke. Deine Anfrage ist da, die Bestätigung ist per E-Mail unterwegs. Wir melden uns mit allen Details.",
  errors: {
    event: "Bitte wähle einen Termin.",
    name: "Bitte gib deinen Namen an.",
    email: "Bitte gib eine gültige E-Mail-Adresse an.",
    privacy: "Bitte bestätige den Datenschutzhinweis.",
    rateLimit: "Zu viele Anfragen von diesem Anschluss. Bitte versuch es später noch einmal.",
    generic: "Das hat nicht geklappt. Bitte versuch es in ein paar Minuten noch einmal.",
  },
};
