// ANNAHME: Produktionsdomain fempireclub.de. Die Domain ist noch nicht gesichert.
const FALLBACK_URL = "https://fempireclub.de";

/**
 * Basis-URL für Metadata, Sitemap und JSON-LD. Wird beim Build ausgewertet und darf
 * ihn nie abbrechen: leere Werte fallen auf die Standard-Domain zurück, eine Domain
 * ohne Protokoll ("fempireclub.de") bekommt https:// vorangestellt.
 */
function resolveSiteUrl(raw: string | undefined): string {
  const value = raw?.trim();
  if (!value) return FALLBACK_URL;
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  if (!URL.canParse(withProtocol)) {
    console.warn(`NEXT_PUBLIC_SITE_URL ist ungültig ("${value}"), verwende ${FALLBACK_URL}`);
    return FALLBACK_URL;
  }
  return new URL(withProtocol).origin;
}

export const siteUrl = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
