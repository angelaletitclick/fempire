import Link from "next/link";
import { ConfirmButton } from "@/components/club/ConfirmButton";
import { PageHead, Tag } from "@/components/club/PageHead";
import { PlainText } from "@/components/ui/RichText";
import { cityBySlug } from "@/content/cities";
import { club, formatLabel, tierLabel } from "@/content/club";
import { requireMember } from "@/lib/auth";
import type { ClubEvent } from "@/lib/events";
import { supabaseServer } from "@/lib/supabase/server";
import { formatEuro, formatLong, formatTime } from "@/lib/time";
import { ButtonLink } from "@/components/ui/Button";
import { deleteEvent, setEventStatus } from "../admin/termine/actions";
import { attendEvent, declineEvent } from "./actions";

export const metadata = { title: "Termine" };

export default async function ClubTerminePage() {
  const viewer = await requireMember();
  const t = club.events;
  const supabase = await supabaseServer();
  const now = new Date().toISOString();

  const [upcoming, past, mine, seats] = await Promise.all([
    supabase.from("events").select("*").gte("starts_at", now).order("starts_at"),
    supabase.from("events").select("*").lt("starts_at", now).order("starts_at", { ascending: false }).limit(6),
    supabase.from("event_registrations").select("event_id").eq("user_id", viewer.userId),
    supabase.rpc("event_seats_taken"),
  ]);

  const attending = new Set((mine.data ?? []).map((row) => row.event_id as string));
  const taken = new Map(((seats.data ?? []) as Array<{ event_id: string; taken: number }>).map((row) => [row.event_id, Number(row.taken)]));
  const events = (upcoming.data ?? []) as ClubEvent[];

  return (
    <div className="container-site py-section">
      <PageHead
        label={t.label}
        headline={t.headline}
        intro={t.intro}
        actions={
          viewer.isAdmin ? (
            <>
              <ButtonLink href="/club/admin/termine/neu">Termin anlegen</ButtonLink>
              <ButtonLink href="/club/admin/termine" variant="outline">
                Entwürfe und Verwaltung
              </ButtonLink>
            </>
          ) : undefined
        }
      />

      {events.length === 0 ? (
        <p className="mt-12 border border-line p-6 text-slate-light">{t.empty}</p>
      ) : (
        <ol className="mt-12 grid gap-3">
          {events.map((event) => {
            const cancelled = event.status === "cancelled";
            const eligible = viewer.isAdmin || (viewer.member.tier !== null && event.audience.includes(viewer.member.tier));
            const isAttending = attending.has(event.id);
            const seatsTaken = taken.get(event.id) ?? 0;
            const full = event.capacity !== null && seatsTaken >= event.capacity;
            return (
              <li key={event.id} className={cancelled ? "border border-line p-6 md:p-8" : "card p-6 md:p-8"}>
                <div className="grid gap-6 md:grid-cols-12">
                  <div className="md:col-span-8">
                    <p className="flex flex-wrap items-center gap-3">
                      <span className="label">{formatLabel(event.format)}</span>
                      {cancelled ? <Tag tone="pink">{t.cancelled}</Tag> : null}
                      {isAttending && !cancelled ? <Tag tone="white">{t.attending}</Tag> : null}
                    </p>
                    <h2 className={`headline mt-3 text-2xl leading-tight ${cancelled ? "line-through decoration-1" : ""}`}>
                      {event.title}
                      {event.topic ? `: ${event.topic}` : ""}
                    </h2>
                    <p className="mt-3 text-base text-white">
                      {formatLong(event.starts_at)}, {formatTime(event.starts_at)}
                      {event.ends_at ? ` bis ${formatTime(event.ends_at)}` : ""} Uhr
                    </p>
                    <p className="mt-1 text-sm text-slate-light">
                      {t.location}: {event.location || t.locationTbd} · {cityBySlug(event.city_slug)?.name ?? event.city_slug}
                    </p>
                    {cancelled && event.cancel_note ? <p className="mt-3 text-base text-white">{event.cancel_note}</p> : null}
                    {event.description && !cancelled ? (
                      <PlainText text={event.description} className="prose-width mt-4 text-base leading-relaxed text-slate-light" />
                    ) : null}
                    {viewer.isAdmin ? (
                      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4">
                        <span className="label text-white">Admin</span>
                        <Link href={`/club/admin/termine/${event.id}`} className="label hover:text-white">
                          Bearbeiten
                        </Link>
                        {cancelled ? (
                          <form action={setEventStatus.bind(null, event.id, "published")}>
                            <ConfirmButton variant="link">Wieder ansetzen</ConfirmButton>
                          </form>
                        ) : (
                          <form action={setEventStatus.bind(null, event.id, "cancelled")}>
                            <ConfirmButton variant="link" confirm="Termin absagen? Er bleibt durchgestrichen sichtbar.">
                              Absagen
                            </ConfirmButton>
                          </form>
                        )}
                        <form action={deleteEvent.bind(null, event.id, "/club/termine")}>
                          <ConfirmButton variant="link" confirm="Termin endgültig löschen? Zusagen gehen verloren.">
                            Löschen
                          </ConfirmButton>
                        </form>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-3 md:col-span-4 md:items-end md:text-right">
                    <p className="label">
                      {t.onlyFor} {event.audience.map((tier) => tierLabel(tier, true)).join(", ")}
                    </p>
                    {eligible ? (
                      <p className="text-sm text-white">
                        {event.price_cents ? `${t.price}: ${formatEuro(event.price_cents)}` : t.included}
                      </p>
                    ) : null}
                    {event.capacity ? (
                      <p className="text-sm text-slate-light">
                        {t.seats.replace("{taken}", String(seatsTaken)).replace("{capacity}", String(event.capacity))}
                      </p>
                    ) : null}
                    {!cancelled && eligible ? (
                      isAttending ? (
                        <form action={declineEvent.bind(null, event.id)}>
                          <ConfirmButton>{t.decline}</ConfirmButton>
                        </form>
                      ) : full ? (
                        <Tag>{t.full}</Tag>
                      ) : (
                        <form action={attendEvent.bind(null, event.id)}>
                          <ConfirmButton variant="primary">{t.attend}</ConfirmButton>
                        </form>
                      )
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {past.data?.length ? (
        <section className="mt-16">
          <h2 className="label text-white">{t.past}</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {(past.data as ClubEvent[]).map((event) => (
              <li key={event.id} className="flex flex-wrap justify-between gap-2 py-4 text-slate-light">
                <span className="text-white">
                  {event.title}
                  {event.topic ? `: ${event.topic}` : ""}
                </span>
                <span>{formatLong(event.starts_at)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
