import { Footer } from "@/components/sections/Footer";
import { Nav } from "@/components/sections/Nav";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main id="inhalt">
        <section className="container-site flex min-h-[70svh] flex-col justify-center py-section">
          <p className="label">404</p>
          <h1 className="headline mt-8 text-[clamp(2.5rem,6.2vw,5.75rem)]">Hier ist nichts.</h1>
          <p className="prose-width mt-8 text-lg text-slate">Die Seite gibt es nicht oder nicht mehr.</p>
          <div className="mt-10">
            <ButtonLink href="/">Zur Startseite</ButtonLink>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
