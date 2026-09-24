import { z } from "zod";
import { cityBySlug, OTHER_CITY, otherCityLabel, plannedCities } from "@/content/cities";

/** Auswahl der Warteliste: alle geplanten Städte plus "Andere Stadt". Wert ist der Slug. */
export const waitlistCityOptions = [
  ...plannedCities.map((city) => ({ value: city.slug, label: city.name })),
  { value: OTHER_CITY, label: otherCityLabel },
];

const slugs = waitlistCityOptions.map((option) => option.value) as [string, ...string[]];

export const waitlistSchema = z.object({
  email: z.email({ error: "Bitte eine gültige E-Mail-Adresse angeben." }).max(200),
  city: z.enum(slugs, { error: "Bitte eine Stadt wählen." }),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;

/** Anzeigename zu einem gespeicherten Slug */
export function waitlistCityName(slug: string): string {
  return cityBySlug(slug)?.name ?? otherCityLabel;
}
