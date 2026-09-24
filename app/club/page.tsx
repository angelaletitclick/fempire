import { redirect } from "next/navigation";
import { cityBySlug } from "@/content/cities";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/Section";
import { supabaseServer } from "@/lib/supabase/server";
import { signOut } from "./actions";

/**
 * Gerüst des Mitgliederbereichs. Zugang nur mit Sitzung UND Eintrag in public.members
 * (RLS: jede sieht nur ihren eigenen Datensatz).
 */
export default async function ClubPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/club/login");

  const { data: member } = await supabase
    .from("members")
    .select("full_name, circle, city_slug")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member) {
    return (
      <section className="container-site max-w-xl py-section">
        <SectionLabel index="·" label="Mitgliederbereich" />
        <h1 className="headline mt-6 text-[2.25rem] leading-[1.1] sm:text-5xl">Kein Zugang.</h1>
        <p className="mt-5 text-base leading-relaxed text-slate-light">
          Für dieses Konto ist noch keine Mitgliedschaft hinterlegt. Wenn das ein Fehler ist, antworte auf deine
          Aufnahme-Mail.
        </p>
        <form action={signOut} className="mt-10">
          <Button type="submit" variant="outline">
            Abmelden
          </Button>
        </form>
      </section>
    );
  }

  return (
    <section className="container-site py-section">
      <SectionLabel
        index="·"
        label={`${member.circle === "foundations" ? "FEMPIRE FOUNDATIONS" : "Leader Circle"} · ${cityBySlug(member.city_slug)?.name ?? ""}`}
      />
      <h1 className="headline mt-6 text-[2.25rem] leading-[1.1] sm:text-5xl">Willkommen, {member.full_name}.</h1>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-light">
        Hier entstehen Termine, Unterlagen und der Zugang zum Community-Hub.
      </p>
      <form action={signOut} className="mt-10">
        <Button type="submit" variant="outline">
          Abmelden
        </Button>
      </form>
    </section>
  );
}
