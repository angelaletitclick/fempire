// ANNAHME: Produktionsdomain fempireclub.de. Die Domain ist noch nicht gesichert.
const FALLBACK_URL = "https://fempireclub.de";

/** Basis-URL für Metadata, Sitemap und JSON-LD. Darf auch ohne .env.local funktionieren. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK_URL).replace(/\/$/, "");
