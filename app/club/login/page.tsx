import { SectionLabel } from "@/components/ui/Section";
import { LoginForm } from "./LoginForm";

export default async function ClubLoginPage({ searchParams }: PageProps<"/club/login">) {
  const { fehler } = await searchParams;
  return (
    <section className="container-site max-w-xl py-section">
      <SectionLabel index="·" label="Anmeldung" />
      <h1 className="headline mt-6 text-[2.25rem] leading-[1.1] sm:text-5xl">Nur für Mitglieder.</h1>
      <p className="mt-5 text-base leading-relaxed text-slate-light">
        Gib die E-Mail-Adresse ein, mit der du aufgenommen wurdest. Wir schicken dir einen Anmeldelink, ohne Passwort.
      </p>
      {fehler ? (
        <p role="alert" className="mt-6 border border-pink px-4 py-3 text-sm text-white">
          Der Link ist abgelaufen oder wurde schon benutzt. Fordere einfach einen neuen an.
        </p>
      ) : null}
      <div className="mt-10">
        <LoginForm />
      </div>
    </section>
  );
}
