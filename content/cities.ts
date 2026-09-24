/**
 * Städte des Clubs. Neue Stadt: Eintrag ergänzen. Sobald ein Kreis startet,
 * `status` auf "aktiv" setzen und eine Terminregel eintragen.
 *
 * - aktiv:   Kreis läuft, Bewerbung möglich, Termine werden angezeigt
 * - geplant: erscheint in der Warteliste und in der Stadt-Auswahl der Bewerbung
 */
export type CityStatus = "aktiv" | "geplant";

export type MeetingRule = {
  /** Erster Termin-Monat im Format JJJJ-MM */
  startMonth: string;
  /** Wochentag: 0 = Sonntag, 1 = Montag, ... 3 = Mittwoch */
  weekday: number;
  /** Der wievielte dieser Wochentage im Monat (1 = erster) */
  nth: number;
  /** Einzelne Termine absagen, Format JJJJ-MM-TT, z. B. "2027-08-04" */
  cancelled: string[];
};

export type City = {
  slug: string;
  name: string;
  status: CityStatus;
  /** Terminregel des Leader Circle in dieser Stadt */
  meetings?: MeetingRule;
};

export const cities: City[] = [
  {
    slug: "osnabrueck",
    name: "Osnabrück",
    status: "aktiv",
    meetings: { startMonth: "2027-01", weekday: 3, nth: 1, cancelled: [] },
  },
  { slug: "muenster", name: "Münster", status: "geplant" },
  { slug: "hamburg", name: "Hamburg", status: "geplant" },
  { slug: "frankfurt", name: "Frankfurt", status: "geplant" },
];

/** Wert für "meine Stadt ist nicht dabei" in Formularen */
export const OTHER_CITY = "andere";
export const otherCityLabel = "Andere Stadt";

export const activeCities = cities.filter((city) => city.status === "aktiv");
export const plannedCities = cities.filter((city) => city.status === "geplant");

/** Die Stadt, deren Termine auf der Startseite stehen (erste aktive Stadt) */
export const homeCity = activeCities[0]!;

export function cityBySlug(slug: string): City | undefined {
  return cities.find((city) => city.slug === slug);
}
