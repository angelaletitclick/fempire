import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/club/ConfirmButton";
import { PageHead } from "@/components/club/PageHead";
import { tierLabel, trialStatuses, optionLabel } from "@/content/club";
import { requireAdmin } from "@/lib/auth";
import type { ClubEvent } from "@/lib/events";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatShort } from "@/lib/time";
import { deleteEvent, duplicateEvent } from "../actions";
import { EventForm } from "../EventForm";

type Registration = { created_at: string; member: { full_name: string; email: string | null; tier: string | null; role: string } | null };
type Trial = { id: string; name: string; email: string; status: string; created_at: string };

export default async function EditEventPage({ params, searchParams }: PageProps<"/club/admin/termine/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const { neu } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const db = supabaseAdmin();
  const [{ data }, { data: regs }, { data: trials }] = await Promise.all([
    db.from("events").select("*").eq("id", id).maybeSingle(),
    db.from("event_registrations").select("created_at, member:members(full_name, email, tier, role)").eq("event_id", id).order("created_at"),
    db.from("trial_requests").select("id, name, email, status, created_at").eq("event_id", id).order("created_at"),
  ]);
  if (!data) notFound();
  const event = data as ClubEvent;
  const registrations = (regs ?? []) as unknown as Registration[];
  const trialRequests = (trials ?? []) as Trial[];

  return (
    <div className="container-site max-w-4xl py-section">
      <Link href="/club/admin/termine" className="label hover:text-white">
        Alle Termine
      </Link>
      <div className="mt-8">
        <PageHead label="Termine" headline={event.topic ? `${event.title}: ${event.topic}` : event.title} />
      </div>
      {neu ? (
        <p role="status" className="mt-6 border border-white px-4 py-3 text-sm text-white">
          Angelegt. Zum Veröffentlichen den Status auf „Veröffentlicht“ setzen.
        </p>
      ) : null}

      <EventForm event={event} />

      <section className="mt-14 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="label text-white">Zusagen ({registrations.length})</h2>
          {registrations.length ? (
            <ul className="mt-3 divide-y divide-line border-y border-line text-sm">
              {registrations.map((reg, i) => (
                <li key={i} className="flex flex-wrap justify-between gap-2 py-3">
                  <span className="text-white">{reg.member?.full_name}</span>
                  <span className="text-slate-light">{reg.member?.role === "admin" ? "Team" : tierLabel(reg.member?.tier, true)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-light">Noch keine Zusagen.</p>
          )}
        </div>
        <div>
          <h2 className="label text-white">Schnupper-Anfragen ({trialRequests.length})</h2>
          {trialRequests.length ? (
            <ul className="mt-3 divide-y divide-line border-y border-line text-sm">
              {trialRequests.map((trial) => (
                <li key={trial.id} className="flex flex-wrap justify-between gap-2 py-3">
                  <span className="text-white">
                    {trial.name} <span className="text-slate-light">{trial.email}</span>
                  </span>
                  <span className="text-slate-light">
                    {optionLabel(trialStatuses, trial.status)} · {formatShort(trial.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-light">Keine.</p>
          )}
          <Link href="/club/admin/schnuppern" className="label mt-3 inline-block text-white hover:underline">
            Anfragen verwalten
          </Link>
        </div>
      </section>

      <div className="mt-14 flex flex-wrap gap-3 border-t border-line pt-6">
        <form action={duplicateEvent.bind(null, event.id)}>
          <ConfirmButton>Als Entwurf kopieren</ConfirmButton>
        </form>
        <form action={deleteEvent.bind(null, event.id)}>
          <ConfirmButton confirm="Termin endgültig löschen? Zusagen gehen verloren. Zum Absagen lieber den Status „Abgesagt“ nutzen.">
            Termin löschen
          </ConfirmButton>
        </form>
      </div>
    </div>
  );
}
