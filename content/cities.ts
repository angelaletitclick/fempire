/**
 * Städte des Clubs. Neue Stadt: Eintrag ergänzen. Sobald ein Kreis startet,
 * `status` auf "aktiv" setzen. Termine pflegt ihr im Backend unter /club/admin/termine.
 *
 * - aktiv:   Kreis läuft, Bewerbung möglich
 * - geplant: erscheint in der Warteliste und in der Stadt-Auswahl der Bewerbung
 */
export type CityStatus = "aktiv" | "geplant";

export type City = {
  slug: string;
  name: string;
  status: CityStatus;
};

export const cities: City[] = [
  {
    slug: "osnabrueck",
    name: "Osnabrück",
    status: "aktiv",
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

export function cityBySlug(slug: string): City | undefined {
  return cities.find((city) => city.slug === slug);
}
