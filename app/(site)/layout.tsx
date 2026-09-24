import { Footer } from "@/components/sections/Footer";
import { Nav } from "@/components/sections/Nav";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main id="inhalt">{children}</main>
      <Footer />
    </>
  );
}
