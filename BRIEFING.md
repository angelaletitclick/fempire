# FEMPIRE CLUB — Projekt-Briefing für den Coding-Agent

## 0. Rolle und Arbeitsweise

Komplette Website für den FEMPIRE CLUB: Marketing- und Bewerbungsseite für einen geschlossenen Unternehmerinnen-Club. Eigenständig, in kleinen nachvollziehbaren Schritten, produktionsreifer Code, keine Platzhalter-Demos.

- Vor dem ersten Code: Projektstruktur und Seitenplan vorschlagen, auf Freigabe warten.
- Etappen: Setup → Design-System → Landing → Bewerbungsfunnel → Rechtliches → Feinschliff. Nach jeder Etappe kurz zusammenfassen, was läuft und was fehlt.
- Rückfragen bündeln. Fehlende Infos: begründete Annahme treffen, im Code als `// ANNAHME:` markieren und in der Zusammenfassung auflisten.
- Keine Geheimnisse im Repo. Alles über `.env.local`, plus `.env.example` mit Dummy-Werten.
- Kein Lorem Ipsum. Texte aus Abschnitt 7 oder im vorgegebenen Tone of Voice.

## 1. Das Projekt

- Marke: FEMPIRE CLUB (Female + Empire)
- Claim: Exklusiver Kreis für Unternehmerinnen & Leaderinnen // Application Only
- Sitz: Osnabrück, Start als lokaler Kern-Kreis, danach Münster, Hamburg, Frankfurt.

Was es ist: geschlossener, kuratierter Kreis für Gründerinnen, Holding-Inhaberinnen, Investorinnen, Top-Führungskräfte und selbstständige Mütter. Aufnahme nur über Bewerbung.

Was es nicht ist: kein offenes Netzwerk, kein Frauenstammtisch, kein Kaffeekränzchen. Spürbar machen über Auswahl, Ton und Verknappung, nicht über Behauptungen.

Zielgruppe: Frauen ca. 30–45, eigene GmbH/Holding oder hohe Management-Verantwortung, siebenstellige Ambitionen, oft Mutter. Durchschauen Floskeln sofort.

USP, in dieser Reihenfolge:
1. Radikale Ehrlichkeit — echte Zahlen: Umsätze, Margen, Gewinne, Business-Pains.
2. Motherhood & Boardroom — große Ziele ohne die Realität als Mutter auszublenden.
3. Kuratierter Zugang — Bewerbung, begrenzte Plätze, Aufnahme auf Augenhöhe.

Formate: Treffen alle zwei Monate, Masterminds, digitaler Community-Hub für KPI-Austausch, später FEMPIRE Academy und mehrtägige Retreats.

Preise: nur auf /mitgliedsbeitrag, siehe Abschnitt 11.

## 2. Die Gründerinnen

**Angela Pister** — Co-Geschäftsführerin der LET IT CLICK GmbH (Marketing- und Medienagentur, Region Osnabrück). Social-Media-Strategie, High-End-Content, Short-Form-Video, Branding, Webentwicklung, visuelle B2B-Positionierung. 33, Mutter einer Tochter. Im Club: Marke, Content, Ästhetik, Marken-Erlebnis.

**Maria Elisabeth Doerk** — M.A. Geschichte, serielle Gründerin in Osnabrück. GF der Walk With Me GmbH (Erlebnis- und Stadtführungen, Nachtwächter-Touren, Outdoor Escape Games in Osnabrück, Münster, Oldenburg, Bielefeld, Paderborn) und der MejWay GmbH (Medienprojekt The Entrepreness). Mitgründerin von Eskapadia. Themen: Business-Systeme und Autonomie, Krisen-Resilienz und Skalierung, Vereinbarkeit über Strukturen und Holdings. Mutter von drei Kindern. Im Club: Struktur, Prozesse, Skalierung, Multi-City-Aufbau.

Erzählkern: Markenwelt trifft auf skalierbare Struktur. Zwei Unternehmerinnen, die selbst liefern, was sie predigen. Beide neurodivergent — sachlich erwähnen, nicht pathetisch.

## 3. Tech-Stack (verbindlich)

- Next.js (aktuell stabil), App Router, TypeScript strict
- Tailwind CSS, Design-Tokens als CSS-Variablen, keine Inline-Hex-Werte im JSX
- Supabase für Bewerbungen, Warteliste, später Mitgliederbereich
- Server Actions für Formulare, zod auf Client und Server
- Resend o. ä. für Transaktionsmails, in eigenem Modul gekapselt
- Vercel als Deployment-Ziel
- Framer Motion nur sparsam (Scroll-Reveals, Hover)
- Keine UI-Library mit eigenem Look. shadcn/ui erlaubt, vollständig auf CI umgestylt.

Struktur: `app/`, `components/ui/`, `components/sections/`, `lib/` (supabase, validation, mail), `content/` (Texte zentral).

## 4. Corporate Identity

| Token | Hex | Einsatz |
|---|---|---|
| `--plum` | #2A1430 | Hauptfarbe, Hintergrund (Aubergine, ersetzt Onyx seit 25.09.2026) |
| `--pink` | #CB1570 | Akzent, Signale, CTA. Darauf immer weiße Schrift. |
| `--pink-deep` | #A5105A | Hover, Tiefe |
| `--white` | #FFFFFF | Typografie, Kontrast |
| `--slate` | #8A8A8E | Sublines, Sekundärtext |
| `--blush` | #E8C9D9 | Linien, Rahmen, Kapitel-Labels ("Für wen", "Termine" …) |

- Dark by default, kein Light-Mode-Toggle. Pink ist Akzent, nie Fläche: max. ein Pink-Element pro Viewport-Höhe. Keine weiteren Farben, keine Verläufe außer Pink auf Onyx.
- Headlines: fette geometrische Sans in Versalien (Syne 800 oder Inter Black), enges Tracking, große Größensprünge.
- Fließtext: Inter 400/500, max. 65 Zeichen pro Zeile.
- Labels/Navigation: Versalien, Letter-Spacing ~0.1em, klein, in `--slate`.
- Schriften self-hosted (next/font), kein Laufzeit-Aufruf an Google (DSGVO).
- Layout: clean, architektonisch, viel Schwarz, viel Luft, harte Kanten. 1px-Linien in #2A2A2A statt Karten mit Schatten. Radius max. 2–4px, eher 0. Keine weichen Schatten, kein Glassmorphism. Sektionsabstand ≥120px Desktop.
- Bildsprache: B2B-Dokumentarstil, candid, editorial, S/W, high contrast, Pink-Typo-Akzente. Bis echte Fotos da sind: schwarze Flächen mit feiner Linie und Bildunterschrift. Keine Stockfotos, keine KI-Bilder.
- Motion: Fade-up beim Scroll, 300–500ms, ease-out. Kein Parallax, kein Autoplay-Karussell. prefers-reduced-motion respektieren.
- Tone of Voice: direkt, selbstbewusst, präzise, kurze Sätze. Keine Floskeln, keine Ausrufezeichen, keine Emojis. Anrede Du. Konsequent weibliche Formen.

## 5. Seitenstruktur

`/` Landing:
1. Hero — Claim, ein Satz Positionierung, CTA „Bewerbung starten“, Hinweis begrenzte Plätze. Vollbild, schwarz, eine Pink-Akzentlinie.
2. Manifest — 3–5 Statements.
3. Für wen — und für wen nicht. Zwei Spalten, rechts der Filter, darf abschrecken.
4. Formate — mit Status: läuft / in Vorbereitung.
5. Die Gründerinnen — je ein Porträtblock.
6. Der Ablauf — Bewerbung → Prüfung → Kennenlerngespräch → Aufnahme.
7. FAQ — Accordion, inkl. Preisfrage.
8. Abschluss-CTA — Bewerbung plus Warteliste für andere Städte.

`/bewerbung` — mehrstufiges Formular, fokussierter Screen ohne Navigation.
`/danke` — Bestätigung, nächste Schritte, Zeitraum.
`/impressum`, `/datenschutz` — Platzhalter für Betreibergesellschaft klar markiert.
`/club` — geschützte Route, vorerst Gerüst mit Auth-Check.

Navigation: max. drei Punkte plus CTA. Sticky, schmal, transparent auf Schwarz.

## 6. Bewerbungsfunnel

Ein Schritt pro Screen, Fortschrittsanzeige, Zwischenstände im localStorage.

1. Person: Name, E-Mail, Telefon (optional), Stadt, Website/LinkedIn/Instagram.
2. Unternehmen: Firmenname, Rechtsform, Rolle, Gründungsjahr, Mitarbeiterinnen, Branche.
3. Zahlen: Jahresumsatz (Spanne), Ziel nächste 12 Monate, größter Engpass (Freitext).
4. Passung: Warum dieser Kreis, was bringst du ein, Kinder ja/nein (optional), Zeitinvestment.
5. Bestätigung: Datenschutz-Checkbox, Absenden.

Danach: Eintrag in Supabase, Bestätigungsmail an Bewerberin, Benachrichtigung an beide Gründerinnen, Weiterleitung auf `/danke`.

Scoring: serverseitig (Umsatzspanne, Rolle, Vollständigkeit), Zahl im Datensatz, nur intern.

Spam-Schutz: Honeypot plus Rate-Limit pro IP. Kein Captcha-Dienst mit US-Datentransfer.

## 7. Textbausteine

- Hero-Headline: „KEIN NETZWERK. EIN KREIS.“
- Hero-Subline: „Für Unternehmerinnen, die über Zahlen sprechen statt über Sichtbarkeit. Osnabrück. Application Only.“
- Manifest: „Wir reden über Umsatz, nicht über Reichweite.“ / „Kein Smalltalk. Keine Visitenkarten.“ / „Mutter sein ist hier kein Nachteil, sondern Kontext.“ / „Plätze sind begrenzt, weil Qualität es ist.“
- Filter links: „Du führst eine GmbH oder Holding.“ / „Du denkst in Systemen, nicht in Aufgaben.“ / „Du legst deine Zahlen offen, wenn du echtes Feedback willst.“
- Filter rechts: „Du suchst neue Kundinnen für dein Coaching.“ / „Du willst Austausch ohne Verbindlichkeit.“ / „Du bist noch in der Ideenphase.“
- FAQ Preis: „Die Mitgliedschaft ist eine Jahresinvestition im vierstelligen Bereich. Die genaue Höhe hängt von der Stufe ab und besprechen wir im persönlichen Gespräch.“

## 8. Qualitätsanforderungen

- Responsive, mobile first, sauber ab 360px, Safe-Area-Insets.
- A11y: semantisches HTML, sichtbare Fokus-Zustände in Pink, Kontrast ≥ AA. `--slate` auf Onyx nur ab 16px, sonst aufhellen.
- Performance: Lighthouse mobil ≥ 90 in allen Kategorien. next/image, keine render-blockierenden Skripte.
- SEO: Metadata-API, OG-Bild im CI-Look, sitemap.xml, robots.txt, JSON-LD Organisation.
- DSGVO: keine externen CDNs, keine Tracker mit Cookies. Analytics nur cookiefrei. AV-Verträge als offene Punkte notieren.
- Formularrecht: Double-Opt-in-Hinweis bei Warteliste, Datenschutzhinweis am Formular, kein vorangekreuztes Häkchen.

## 9. Verbote

- Keine Preise öffentlich.
- Keine erfundenen Testimonials, Logos, Mitgliederzahlen. Fehlt Social Proof, Sektion weglassen.
- Keine Stockfotos, keine KI-Bilder.
- Keine Emojis, keine Ausrufezeichen, keine Superlative im Seitentext.
- Kein Cookie-Banner, das Tracking voraussetzt.
- Nichts deployen oder an externe Dienste senden, ohne vorher zu fragen.

## 10. Definition of Done

Landing und Funnel vollständig in CI, Bewerbungen kommen in Supabase an, beide Mails werden zuverlässig zugestellt, Impressum und Datenschutz stehen, Lighthouse mobil ≥ 90, geprüft auf iPhone SE, iPad, Desktop, README erklärt Textpflege in `content/` ohne Code.

## 11. Nachtrag: Zwei Kreise, Preise, Städte (Stand September 2026)

Der Club hat **zwei getrennte Kreise**. Sie teilen die Marke, aber nie den Raum, nie den Chat, nie die Treffen.

- **Leader Circle** (Hauptkreis): Unternehmerinnen mit eigener GmbH/Holding oder hoher Führungsverantwortung. Bestehendes Business, echte Zahlen. 12 Treffen pro Jahr (monatlich, erster Mittwoch) plus Events, Masterminds in festen Kleingruppen, Community-Hub, Retreats, Academy.
- **FEMPIRE FOUNDATIONS**: Frauen vor der Gründung. Eigenes Programm über 12 Monate mit Abschluss, danach Bewerbung in den Leader Circle oder Ende. Kein Dauerabo. Eigene monatliche Treffen, Coaching durch die Gründerinnen, eigener Kanal.

Regeln für die Website:
- Beiträge stehen ausschließlich auf der Seite /mitgliedsbeitrag (Texte in content/membership.ts), die nur im Footer verlinkt ist. Dort netto und brutto, beide Kreise untereinander, keine Vergleichstabelle. Überall sonst (Startseite, FAQ, Bewerbung) keine Beträge, nur: „Die Investition besprechen wir im persönlichen Gespräch.“ Founding-Konditionen (Sonderpreise der ersten Runde) werden nirgends genannt.
- Beide Kreise sichtbar getrennt: eigene Sektion, eigener CTA. Keine Preistabelle, keine Stufen-Optik, kein „Basic vs. Premium“.
- FOUNDATIONS nie als günstigere Variante des Leader Circle, sondern als eigenes Programm mit eigenem Ziel. Nie „Einsteigerinnen“, „Anfängerinnen“ oder „kleine Selbstständige“.
- Bewerberinnen wählen keinen Kreis. Schritt 2 der Bewerbung (Situation) entscheidet über den Pfad: Wer noch nicht gegründet hat, bekommt die FOUNDATIONS-Fragen, alle anderen die Leader-Fragen. Die Zuordnung trifft das Auswahlteam.

Skalierung: Start in Osnabrück, Wachstum über City-Leads in weitere Städte. Städte sind Daten (`content/cities.ts`): Stadt-Auswahl in der Bewerbung, Warteliste für Städte ohne Kreis, Terminregel pro Stadt. Markenelemente wie das Siegel nennen keine Stadt.
