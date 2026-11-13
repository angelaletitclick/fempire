import { z } from "zod";

/** Nur http(s)-Links ausgeben, alles andere (z. B. javascript:) wird verworfen */
export function safeUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** "example.de" → "https://example.de", leere Eingabe → null */
function normalizeUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** "@name" oder "name" → Instagram-Profil */
function normalizeInstagram(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^(https?:\/\/|www\.|instagram\.com)/i.test(trimmed)) return normalizeUrl(trimmed);
  return `https://www.instagram.com/${trimmed.replace(/^@/, "")}`;
}

const link = (normalize: (value: string) => string | null) =>
  z
    .string()
    .max(300)
    .transform(normalize)
    .refine((value) => value === null || safeUrl(value) !== null, "Bitte einen gültigen Link angeben.");

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null);

export const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Bitte gib deinen Namen an.").max(120),
  company: optionalText(160),
  position: optionalText(160),
  city_slug: z.string().trim().min(1).max(60),
  website: link(normalizeUrl),
  linkedin: link(normalizeUrl),
  instagram: link(normalizeInstagram),
  bio: optionalText(2000),
});

export type ProfileInput = z.infer<typeof profileSchema>;
