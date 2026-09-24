import { gruenderinnen } from "@/content/landing";
import { site } from "@/content/site";
import { siteUrl } from "@/lib/site-url";

export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: siteUrl,
    description: site.seo.description,
    slogan: `${site.claim} // ${site.claimSuffix}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.city,
      addressCountry: "DE",
    },
    areaServed: site.city,
    founder: gruenderinnen.people.map((person) => ({
      "@type": "Person",
      name: person.name,
      jobTitle: person.role,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}
