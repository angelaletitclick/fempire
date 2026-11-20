/** Seite /schnuppern: Anfrage für einen einzelnen Schnuppertermin. Keine Beträge hier, die stehen auf /mitgliedsbeitrag. */
export const schnuppern = {
  meta: {
    title: "Schnuppertermin",
    description: "Ein Treffen des FEMPIRE CLUB als Gast besuchen, ohne Mitgliedschaft.",
  },
  label: "Schnuppertermin",
  headline: "Komm ++vorbei.++",
  intro:
    "In der Aufbauphase sind ausgewählte Treffen offen für Gäste, inklusive Heißgetränk. Die Plätze sind begrenzt, deshalb bestätigen wir jede Anfrage persönlich.",
  /** Aufbauphase: Hinweis ohne Betrag. Danach wieder mit Link auf /mitgliedsbeitrag. */
  priceNote: "Keine Mitgliedschaft nötig. Pro Treffen nehmen wir nur eine Aufwandsentschädigung, die Details stehen in deiner Bestätigung.",
  priceLink: "Mitgliedsbeitrag",
  empty: "Die Termine stehen in Kürze fest. Schau bald wieder vorbei oder trag dich auf die Warteliste ein.",
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
