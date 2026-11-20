/**
 * FAQ der Startseite. Reihenfolge hier = Reihenfolge auf der Seite.
 * Keine Beträge in der FAQ (die stehen nur auf /mitgliedsbeitrag). Zur Investition nur:
 * „Die Investition besprechen wir im persönlichen Gespräch.“
 */
export const faq = {
  id: "faq",
  label: "FAQ",
  headline: "Fragen.",
  items: [
    /*
     * Aufbauphase (content/site.ts): Fragen zu Kosten, Kreiswahl, Community-Mitgliedschaft und Absagen
     * sind angepasst oder entfernt. Alte Fassung in der Git-Historie.
     */
    {
      question: "Was kostet die Teilnahme?",
      answer: [
        "In den ersten Monaten bauen wir den Club gemeinsam auf. In dieser Zeit gibt es keine Mitgliedschaft und keinen Beitrag. Pro Treffen nehmen wir nur eine Aufwandsentschädigung.",
      ],
    },
    {
      question: "Kann ich schon Mitglied werden?",
      answer: [
        "Noch nicht. Trag dich auf die Warteliste ein. Sobald die Mitgliedschaften starten, melden wir uns zuerst bei dir.",
      ],
    },
    {
      question: "Wie hängen Leader Circle und Founder Circle zusammen?",
      answer: [
        "Beide Kreise treffen sich jeweils im eigenen Kreis, Workshops und Community teilen sie. Der Leader Circle ist für Frauen mit bestehendem Business. Der Founder Circle ist ein eigenes Programm über zwölf Monate für Frauen, die gründen werden. Danach ist der Wechsel in den Leader Circle möglich.",
      ],
    },
    {
      question: "Wie komme ich zu einem Treffen?",
      answer: [
        "Unter Termine siehst du, welche Treffen offen für Gäste sind. Dort fragst du deinen Platz an, inklusive Heißgetränk. Die Plätze sind begrenzt, wir bestätigen jede Anfrage persönlich.",
      ],
    },
    {
      question: "Für wen ist der Leader Circle gedacht?",
      answer: [
        "Gründerinnen, Holding-Inhaberinnen, Investorinnen und Frauen mit hoher Management-Verantwortung. Entscheidend ist nicht die Rechtsform allein, sondern ob du auf Augenhöhe beitragen kannst.",
      ],
    },
    {
      question: "Muss ich meine Zahlen offenlegen?",
      answer: [
        "Im Kreis legst du so viel offen, wie du für echtes Feedback brauchst. Wer nichts zeigt, bekommt auch nichts Brauchbares zurück.",
        // ANNAHME: Vertraulichkeit wird schriftlich geregelt
        "Was im Kreis besprochen wird, bleibt dort. Das halten wir mit allen Mitgliedern schriftlich fest.",
      ],
    },
    {
      question: "Wo und wann finden die Treffen statt?",
      answer: [
        "Der Leader Circle trifft sich ab XX in Osnabrück, 12 Mal im Jahr jeweils am XX, dazu kommen Business Talk & Walk, Events und im XX ein Retreat-Wochenende. Der Founder Circle hat eigene Termine. Den genauen Ort erhalten aufgenommene Mitglieder.",
      ],
    },
    {
      question: "Wie läuft ein Treffen ab?",
      answer: [
        "Jedes Treffen ist ein Workshop mit einem Thema. Es gibt inhaltlichen Input in kompakten Input Snacks, danach arbeiten wir an euren konkreten Fällen. Die nächsten Themen: Website, KI, Mitarbeiter, Social Media.",
        "Die Atmosphäre ist ungezwungen. Private Themen haben genauso Platz wie Zahlen, denn Erfolg, Familie und Frau sein lassen sich nicht sauber trennen. Genau daraus entsteht die Verbindung, die den Kreis trägt.",
      ],
    },
    {
      question: "Wie viel Zeit muss ich investieren?",
      answer: [
        "Ein Treffen im Monat. Dazwischen läuft der Austausch im Community-Hub, so viel oder wenig, wie du einbringen willst. Wir erwarten Verbindlichkeit bei den Treffen, nicht ständige Präsenz online.",
      ],
    },
    {
      question: "Ich komme nicht aus Osnabrück.",
      answer: [
        "Wenn du regelmäßig nach Osnabrück kommen kannst, komm zu den Treffen. Sonst trag dich in die Warteliste für deine Stadt ein. Der Club wächst über weitere Städte.",
      ],
    },
  ],
};
