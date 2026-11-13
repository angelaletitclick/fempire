import Link from "next/link";
import { ConfirmButton } from "@/components/club/ConfirmButton";
import { PageHead, Tag } from "@/components/club/PageHead";
import { ButtonLink } from "@/components/ui/Button";
import { eventStatuses, formatLabel, optionLabel } from "@/content/club";
import { requireAdmin } from "@/lib/auth";
import type { ClubEvent } from "@/lib/events";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatEuro, formatLong, formatTime } from "@/lib/time";
import { setEventStatus } from "./actions";

type Row = ClubEvent & { event_registrations: Array<{ count: number }> };

export default async function AdminTerminePage({ searchParams }: PageProps<"/club/admin/termine">) {
  await requireAdmin();
  const { zeit } = await searchParams;
  const past = zeit === "vergangen";
  const now = new Date().toISOString();
  let query = supabaseAdmin().from("events").select("*, event_registrations(count)");
  query = past ? query.lt("starts_at", now).order("starts_at", { ascending: false }).limit(50) : query.gte("starts_at", now).order("starts_at");
  const { data } = await query;
  const rows = (data ?? []) as Row[];

  return (
    <div className="container-site py-section">
      <PageHead
        label="Backend"
        headline="Termine."
        intro="Veröffentlichte Termine erscheinen auf der Startseite (ohne Ort und Beträge) und im Mitgliederbereich (mit Ort, Beitrag und Zusage)."
        actions={<ButtonLink href="/club/admin/termine/neu">Termin anlegen</ButtonLink>}
      />

      <nav aria-label="Zeitraum" className="mt-10 flex gap-2">
        <Link href="/club/admin/termine" className={`label border px-3 py-2 ${!past ? "border-white bg-white text-plum" : "border-line hover:text-white"}`}>
          Kommend
        </Link>
        <Link href="/club/admin/termine?zeit=vergangen" className={`label border px-3 py-2 ${past ? "border-white bg-white text-plum" : "border-line hover:text-white"}`}>
          Vergangen
        </Link>
      </nav>

      {rows.length === 0 ? (
        <p className="mt-8 border border-line p-6 text-slate-light">Keine Termine.</p>
      ) : (
        <ul className="mt-8 grid gap-3">
          {rows.map((event) => (
            <li key={event.id} className={event.status === "published" ? "card p-5" : "border border-line p-5"}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <Link href={`/club/admin/termine/${event.id}`} className="min-w-0 flex-1 hover:underline">
                  <span className="label">{formatLabel(event.format)}</span>
                  <span className={`mt-1 block text-lg font-semibold text-white ${event.status === "cancelled" ? "line-through" : ""}`}>
                    {event.title}
                    {event.topic ? `: ${event.topic}` : ""}
                  </span>
                  <span className="mt-1 block text-sm text-slate-light">
                    {formatLong(event.starts_at)}, {formatTime(event.starts_at)} Uhr
                    {event.price_cents ? ` · ${formatEuro(event.price_cents)}` : ""}
                    {event.trial_price_cents !== null ? ` · Schnuppern ${formatEuro(event.trial_price_cents)}` : ""}
                  </span>
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  <Tag tone={event.status === "published" ? "white" : event.status === "cancelled" ? "pink" : "line"}>
                    {optionLabel(eventStatuses, event.status)}
                  </Tag>
                  <Tag>
                    {event.event_registrations[0]?.count ?? 0}
                    {event.capacity ? ` / ${event.capacity}` : ""} Zusagen
                  </Tag>
                </div>
              </div>
              {!past ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {event.status !== "published" ? (
                    <form action={setEventStatus.bind(null, event.id, "published")}>
                      <ConfirmButton variant="primary">Veröffentlichen</ConfirmButton>
                    </form>
                  ) : null}
                  {event.status !== "cancelled" ? (
                    <form action={setEventStatus.bind(null, event.id, "cancelled")}>
                      <ConfirmButton confirm="Termin absagen? Er bleibt durchgestrichen sichtbar. Bitte informiert die Teilnehmerinnen.">
                        Absagen
                      </ConfirmButton>
                    </form>
                  ) : null}
                  {event.status !== "draft" ? (
                    <form action={setEventStatus.bind(null, event.id, "draft")}>
                      <ConfirmButton>Zurückziehen</ConfirmButton>
                    </form>
                  ) : null}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
