import { z } from "zod";
import { closing } from "@/content/landing";

const cities = closing.waitlist.cities as unknown as [string, ...string[]];

export const waitlistSchema = z.object({
  email: z.email({ error: "Bitte eine gültige E-Mail-Adresse angeben." }).max(200),
  city: z.enum(cities, { error: "Bitte eine Stadt wählen." }),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
