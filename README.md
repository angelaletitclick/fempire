# FEMPIRE CLUB

Website, Bewerbungsfunnel, Mitgliederbereich und Backend des FEMPIRE CLUB.
Next.js (App Router), Supabase, Resend, Deployment auf Vercel.

## Texte ändern (ohne Programmierkenntnisse)

Alle festen Texte stehen im Ordner `content/`. Text zwischen den Anführungszeichen ändern, speichern, fertig.

| Datei | Inhalt |
|---|---|
| `content/landing.ts` | Startseite: Hero, Manifest, Für wen, Leader Circle, Founder Circle, Termine-Texte, Gründerinnen, Ablauf |
| `content/faq.ts` | Fragen und Antworten |
| `content/membership.ts` | Seite /mitgliedsbeitrag, die einzige Stelle mit Beträgen |
| `content/schnuppern.ts` | Seite /schnuppern |
| `content/magazin.ts` | Texte rund ums Magazin (die Artikel selbst schreibt ihr im Backend) |
| `content/club.ts` | Mitgliederbereich und Backend, Mitgliedschaften, Treff-Formate |
| `content/mails.ts` | Alle automatischen E-Mails |
| `content/funnel.ts` | Bewerbungsformular |
| `content/cities.ts` | Städte |
| `content/legal.ts` | Impressum und Datenschutz |

Hervorheben: `==Text==` ergibt eine pinke Fläche (nur große Headlines), `++Text++` eine weiße.
Regeln: Du-Anrede, weibliche Formen, kurze Sätze, keine Ausrufezeichen, keine Emojis.

## Backend und Mitgliederbereich

Anmeldung unter `/club/login` mit der E-Mail-Adresse, ohne Passwort (Link per Mail).

- `/club`: Mitgliederbereich mit Terminen und Zusage, Forum, Mitgliederverzeichnis, Nachrichten (Website-Chat) und Profil.
- `/club/admin`: Backend, nur für Admins.
  - **Bewerbungen**: lesen, Status und Notiz, aufnehmen (legt Konto an, schickt Willkommensmail) oder ablehnen.
  - **Mitglieder**: Mitgliedschaft, Status und Rolle. „Aktiv (bezahlt)“ schaltet den Mitgliederbereich frei.
  - **Magazin**: Artikel schreiben. „Nur für Mitglieder“ setzt die Paywall: Gäste sehen den Anfang.
  - **Termine**: anlegen, veröffentlichen, absagen, kopieren. Formate, Beitrag, Plätze, Schnuppern.
  - **Schnuppern**: Anfragen für Schnuppertermine bestätigen oder absagen.
  - **Forum**: neue Themen freigeben, Beiträge ausblenden oder löschen.

Neuen Admin anlegen: `node scripts/admin-anlegen.mjs "mail@example.com" "Vorname Nachname" "Firma" "Position"`
oder im Backend unter Mitglieder die Rolle auf Admin setzen.

## Entwicklung

```bash
cp .env.example .env.local   # Werte eintragen
npm install
npm run dev
```

Datenbank: Migrationen in `supabase/migrations/` der Reihe nach im Supabase SQL-Editor ausführen.
Umgebungsvariablen lokal in `.env.local`, auf Vercel unter Project Settings, Environment Variables.
