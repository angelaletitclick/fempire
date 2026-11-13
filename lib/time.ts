/**
 * Datum und Uhrzeit immer in deutscher Zeit, unabhängig von der Server-Zeitzone (Vercel läuft in UTC).
 */
const TZ = "Europe/Berlin";

function berlinParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

/** Abstand der deutschen Zeit zu UTC in Millisekunden für diesen Zeitpunkt */
function offsetMs(date: Date): number {
  const p = berlinParts(date);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - date.getTime();
}

/** "2027-01-05T18:30" (Eingabe in deutscher Zeit) → Date */
export function berlinLocalToDate(local: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
  if (!match) return null;
  const [, y, mo, d, h, mi] = match.map(Number);
  const naive = Date.UTC(y, mo - 1, d, h, mi);
  let ts = naive - offsetMs(new Date(naive));
  ts = naive - offsetMs(new Date(ts));
  return new Date(ts);
}

/** Date oder ISO-String → "2027-01-05T18:30" in deutscher Zeit, für datetime-local-Felder */
export function toBerlinLocal(value: string | Date | null | undefined): string {
  if (!value) return "";
  const p = berlinParts(new Date(value));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

const formats = {
  long: new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TZ }),
  date: new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long", year: "numeric", timeZone: TZ }),
  day: new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", timeZone: TZ }),
  time: new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: TZ }),
  short: new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  }),
};

const asDate = (value: string | Date) => (typeof value === "string" ? new Date(value) : value);

/** "Dienstag, 5. Januar 2027" */
export const formatLong = (value: string | Date) => formats.long.format(asDate(value));
/** "5. Januar 2027" */
export const formatDate = (value: string | Date) => formats.date.format(asDate(value));
/** "05.01." */
export const formatDay = (value: string | Date) => formats.day.format(asDate(value));
/** "18:30" */
export const formatTime = (value: string | Date) => formats.time.format(asDate(value));
/** "05.01.2027, 18:30" */
export const formatShort = (value: string | Date) => formats.short.format(asDate(value));

/** Betrag in Cent → "29 €" bzw. "19,90 €" */
export function formatEuro(cents: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}
