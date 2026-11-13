import { Footer } from "@/components/sections/Footer";
import { MobileActionBar } from "@/components/sections/MobileActionBar";
import { Nav } from "@/components/sections/Nav";

// Aktionsleiste und Startseite zeigen den nächsten Termin: stündlich neu erzeugen
export const revalidate = 3600;

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main id="inhalt">{children}</main>
      <Footer />
      <MobileActionBar />
    </>
  );
}
