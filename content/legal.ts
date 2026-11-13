/**
 * Impressum und Datenschutzerklärung.
 *
 * [[...]] markiert einen Platzhalter. Er wird auf der Seite gut sichtbar hervorgehoben,
 * bis er durch die echte Angabe ersetzt ist. Vor dem Livegang alle Platzhalter füllen
 * und beide Texte rechtlich prüfen lassen.
 */

export type LegalSection = { heading: string; paragraphs: string[] };

export type LegalDocument = {
  title: string;
  label: string;
  /** Zeigt oben einen Hinweis, dass der Text noch ein Entwurf ist */
  draft: boolean;
  updated: string;
  sections: LegalSection[];
};

export const impressum: LegalDocument = {
  title: "Impressum",
  label: "Rechtliches",
  draft: true,
  updated: "September 2026",
  sections: [
    {
      heading: "Angaben gemäß § 5 DDG",
      paragraphs: [
        "MejWay GmbH\nStockumer Straße 31\n49086 Osnabrück\nDeutschland",
        "Der FEMPIRE CLUB wird von der MejWay GmbH betrieben.",
      ],
    },
    {
      heading: "Vertreten durch",
      paragraphs: ["Maria Elisabeth Doerk, Geschäftsführerin"],
    },
    {
      heading: "Kontakt",
      paragraphs: ["E-Mail: fempireclubs@gmail.com\nTelefon: [[Telefonnummer]]"],
    },
    {
      heading: "Registereintrag",
      paragraphs: ["Registergericht: Amtsgericht Osnabrück\nRegisternummer: HRB 220801"],
    },
    {
      heading: "Umsatzsteuer-ID",
      paragraphs: ["Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: [[DE …]]"],
    },
    {
      heading: "Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV",
      // ANNAHME: Die Geschäftsführerin ist auch inhaltlich verantwortlich
      paragraphs: ["Maria Elisabeth Doerk\nStockumer Straße 31, 49086 Osnabrück"],
    },
    {
      heading: "Verbraucherstreitbeilegung",
      paragraphs: [
        "Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
      ],
    },
  ],
};

export const datenschutz: LegalDocument = {
  title: "Datenschutz",
  label: "Rechtliches",
  draft: true,
  updated: "September 2026",
  sections: [
    {
      heading: "1. Verantwortliche",
      paragraphs: [
        "Verantwortlich für die Datenverarbeitung auf dieser Website ist die MejWay GmbH, Stockumer Straße 31, 49086 Osnabrück, vertreten durch die Geschäftsführerin Maria Elisabeth Doerk, E-Mail: fempireclubs@gmail.com. Weitere Angaben findest du im Impressum.",
      ],
    },
    {
      heading: "2. Das Wichtigste in Kürze",
      paragraphs: [
        "Wir setzen keine Tracking- oder Analyse-Tools ein und keine Cookies zu Werbe- oder Statistikzwecken. Schriften werden von unserem eigenen Server geladen, es gibt keine Verbindung zu Google Fonts oder anderen externen Schriftdiensten.",
        "Personenbezogene Daten verarbeiten wir nur, wenn du dich bewirbst, dich auf die Warteliste setzt, uns schreibst oder als Mitglied den Mitgliederbereich nutzt.",
      ],
    },
    {
      heading: "3. Hosting und Server-Logfiles",
      paragraphs: [
        "Die Website wird bei Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA gehostet. Beim Aufruf der Seite verarbeitet Vercel technisch notwendige Daten wie IP-Adresse, Zeitpunkt, aufgerufene Seite und Browserinformationen, um die Website auszuliefern und vor Angriffen zu schützen.",
        "Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt in einer sicheren und stabilen Bereitstellung der Website. Vercel ist unter dem EU-US Data Privacy Framework zertifiziert [[Zertifizierung prüfen]]. Mit Vercel besteht ein Vertrag zur Auftragsverarbeitung [[abschließen]]. Die Serverfunktionen laufen in der Region Frankfurt am Main.",
      ],
    },
    {
      heading: "4. Bewerbung",
      paragraphs: [
        "Wenn du dich über das Bewerbungsformular bewirbst, verarbeiten wir die Angaben, die du dort machst: Name, E-Mail, optional Telefon, Stadt, Profil-Link, deine berufliche Situation, Angaben zu deinem Unternehmen und deiner Umsatzspanne oder zu deinem Gründungsvorhaben, Ziele, Engpass, Motivation, deinen Beitrag und deine zeitliche Verfügbarkeit.",
        "Zweck ist die Prüfung deiner Bewerbung und die Kontaktaufnahme für ein Kennenlerngespräch. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Durchführung vorvertraglicher Maßnahmen auf deine Anfrage).",
        "Die Angabe, ob du Kinder hast, ist freiwillig. Wenn du sie machst, verarbeiten wir sie auf Grundlage deiner Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO, um Formate und Termine familienfreundlich zu planen. Du kannst die Einwilligung jederzeit per E-Mail widerrufen.",
        "Zur Sortierung vergeben wir intern eine Vorbewertung und einen Vorschlag, welcher Kreis passen könnte. Grundlage sind deine Angaben zur Situation, zu Umsatzspanne oder Gründungszeitpunkt und die Vollständigkeit der Antworten. Über Aufnahme und Zuordnung entscheiden ausschließlich die Gründerinnen persönlich. Eine automatisierte Entscheidung im Sinne von Art. 22 DSGVO findet nicht statt.",
        "Deine Bewerbung löschen wir [[sechs Monate]] nach einer Absage. Wirst du aufgenommen, speichern wir die Angaben für die Dauer der Mitgliedschaft.",
        "Während du das Formular ausfüllst, speichert dein Browser einen Zwischenstand lokal auf deinem Gerät (localStorage), damit du pausieren kannst. Diese Daten verlassen dein Gerät erst beim Absenden und werden danach aus dem Browser gelöscht. Die Speicherung ist für die von dir gewünschte Funktion unbedingt erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG).",
      ],
    },
    {
      heading: "5. Warteliste",
      paragraphs: [
        "Für die Warteliste speichern wir deine E-Mail-Adresse und die gewünschte Stadt. Wir nutzen das Double-Opt-in-Verfahren: Du stehst erst auf der Liste, wenn du den Link in unserer Bestätigungsmail anklickst. Rechtsgrundlage ist deine Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO.",
        "Du kannst dich jederzeit über den Link in unseren Mails abmelden. Dann löschen wir deine Eintragung vollständig. Nicht bestätigte Eintragungen löschen wir nach [[30 Tagen]].",
      ],
    },
    {
      heading: "6. Schutz vor Missbrauch",
      paragraphs: [
        "Um automatisierte Massenanfragen zu verhindern, begrenzen wir die Zahl der Formularanfragen pro Anschluss. Dafür speichern wir einen verschlüsselten Hashwert deiner IP-Adresse, aus dem sich die IP nicht zurückrechnen lässt. Die Einträge werden nach 24 Stunden gelöscht. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Wir verwenden keinen Captcha-Dienst.",
      ],
    },
    {
      heading: "7. Datenbank",
      paragraphs: [
        "Bewerbungen, Warteliste, Schnupper-Anfragen, Mitgliederkonten und die Inhalte des Mitgliederbereichs speichern wir bei Supabase Inc., 970 Toa Payoh North #07-04, Singapur. Die Daten liegen in einem Rechenzentrum in der EU [[Region prüfen]]. Mit Supabase besteht ein Vertrag zur Auftragsverarbeitung mit EU-Standardvertragsklauseln [[abschließen]].",
      ],
    },
    {
      heading: "8. E-Mail-Versand",
      paragraphs: [
        "Bestätigungs-, Benachrichtigungs- und Anmeldemails versenden wir über unser E-Mail-Konto bei Google (Gmail, Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland). Dabei werden deine E-Mail-Adresse und der Inhalt der Mail verarbeitet. Google kann Daten auch in den USA verarbeiten, Google ist unter dem EU-US Data Privacy Framework zertifiziert. [[Auftragsverarbeitung prüfen: für ein privates Gmail-Konto gibt es keinen AV-Vertrag, dafür wäre Google Workspace nötig]]",
      ],
    },
    {
      heading: "9. Mitgliederbereich",
      paragraphs: [
        "Aufgenommene Mitglieder melden sich per Link per E-Mail im Mitgliederbereich an. Dafür setzen wir technisch notwendige Cookies, die deine Anmeldung speichern (§ 25 Abs. 2 Nr. 2 TDDDG). Rechtsgrundlage für die Verarbeitung ist Art. 6 Abs. 1 lit. b DSGVO.",
        "Im Mitgliederbereich verarbeiten wir dein Profil (Name, Unternehmen, Position, Stadt, Links, Text über dich und optional ein Foto), deine Zusagen zu Terminen, deine Beiträge im Forum und deine Nachrichten im Website-Chat. Profil und Forum-Beiträge sehen nur aktive Mitglieder und das Team. Nachrichten sehen nur du und die Person, mit der du schreibst. Deine E-Mail-Adresse ist für andere Mitglieder nicht sichtbar. Neue Forum-Themen prüft das Team vor der Veröffentlichung und kann Beiträge ausblenden oder löschen.",
        "Profilfotos speichern wir in einem nicht öffentlichen Speicher und liefern sie nur an angemeldete Mitglieder aus. Beim Hochladen schneiden wir das Foto zu und entfernen alle Metadaten, etwa Aufnahmeort und Kameradaten.",
        "Endet deine Mitgliedschaft, wird der Zugang gesperrt. Auf Wunsch löschen wir dein Konto mit Profil, Foto, Forum-Beiträgen und Nachrichten vollständig. [[Löschfrist nach Ende der Mitgliedschaft festlegen]]",
      ],
    },
    {
      heading: "10. Schnuppertermin",
      paragraphs: [
        "Wenn du einen Schnuppertermin anfragst, verarbeiten wir Name, E-Mail, optional Telefon, Unternehmen und deine Nachricht sowie den gewählten Termin. Zweck ist die Planung und Bestätigung deines Besuchs. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Die Anfrage löschen wir [[sechs Monate]] nach dem Termin, sofern daraus keine Bewerbung entsteht.",
      ],
    },
    {
      heading: "11. Kontakt per E-Mail",
      paragraphs: [
        "Wenn du uns schreibst, verarbeiten wir deine Angaben, um deine Anfrage zu beantworten (Art. 6 Abs. 1 lit. b bzw. f DSGVO).",
      ],
    },
    {
      heading: "12. Deine Rechte",
      paragraphs: [
        "Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Eine erteilte Einwilligung kannst du jederzeit für die Zukunft widerrufen. Eine formlose E-Mail an fempireclubs@gmail.com genügt.",
        "Du kannst dich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel bei der Landesbeauftragten für den Datenschutz Niedersachsen, Prinzenstraße 5, 30159 Hannover.",
      ],
    },
  ],
};
