import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import { site } from "@/content/site";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

// next/font lädt die Dateien beim Build und liefert sie von der eigenen Domain aus.
// Zur Laufzeit geht keine Anfrage an Google.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Headline-Schrift. Zum Wechseln nur diesen Block ändern, alle Headlines nutzen --font-heading.
const heading = Montserrat({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: site.seo.title,
    template: `%s — ${site.name}`,
  },
  description: site.seo.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: site.name,
    title: site.seo.title,
    description: site.seo.description,
  },
  twitter: {
    card: "summary_large_image",
    title: site.seo.title,
    description: site.seo.description,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#2a1430",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${inter.variable} ${heading.variable} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
