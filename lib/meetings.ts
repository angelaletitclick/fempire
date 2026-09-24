import { homeCity, type MeetingRule } from "@/content/cities";
import { termine } from "@/content/landing";

export type Meeting = {
  /** JJJJ-MM-TT */
  iso: string;
  date: Date;
  isFirst: boolean;
};

/** Heutiges Datum in Deutschland als JJJJ-MM-TT, unabhängig von der Server-Zeitzone. */
function todayInBerlin(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(now);
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** n-ter Wochentag eines Monats, in UTC gerechnet (nur das Datum zählt). */
function nthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): Date {
  const first = new Date(Date.UTC(year, month, 1));
  const offset = (weekday - first.getUTCDay() + 7) % 7;
  return new Date(Date.UTC(year, month, 1 + offset + (nth - 1) * 7));
}

/** Die nächsten Termine laut Terminregel einer Stadt (content/cities.ts), ab heute. */
export function upcomingMeetings(
  count = termine.show,
  rule: MeetingRule | undefined = homeCity.meetings,
  now = new Date(),
): Meeting[] {
  if (!rule) return [];
  const { startMonth, weekday, nth, cancelled } = rule;
  const [startYear, startMonthNumber] = startMonth.split("-").map(Number);
  const firstIso = toIso(nthWeekdayOfMonth(startYear, startMonthNumber - 1, weekday, nth));
  const today = todayInBerlin(now);

  const result: Meeting[] = [];
  // Obergrenze verhindert eine Endlosschleife, falls sehr viele Termine abgesagt sind
  for (let i = 0; result.length < count && i < 120; i++) {
    const date = nthWeekdayOfMonth(startYear, startMonthNumber - 1 + i, weekday, nth);
    const iso = toIso(date);
    if (iso < today || cancelled.includes(iso)) continue;
    result.push({ iso, date, isFirst: iso === firstIso });
  }
  return result;
}

const longFormat = new Intl.DateTimeFormat("de-DE", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const dayMonth = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", timeZone: "UTC" });

/** "Mittwoch, 6. Januar 2027" */
export function formatLong(date: Date): string {
  return longFormat.format(date);
}

/** "06.01." */
export function formatDay(date: Date): string {
  return dayMonth.format(date);
}
