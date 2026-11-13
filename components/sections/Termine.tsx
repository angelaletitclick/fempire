import Link from "next/link";
import { cityBySlug } from "@/content/cities";
import { termine } from "@/content/landing";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { upcomingPublicEvents } from "@/lib/events";
import { formatDay, formatLong } from "@/lib/time";

/** Kommende Termine auf der Startseite. Öffentlich ohne Ort und ohne Beträge. */
export async function Termine() {
  return (
    <Section
      id={termine.id}
      index="05"
      label={termine.label}
      headline={termine.headline}
      intro={termine.intro}
    >
      <TermineList limit={termine.show} />
      <p className="mt-8">
        <Link
          href="/termine"
          className="label text-white underline underline-offset-4 hover:text-slate-light"
        >
          {termine.allLink}
        </Link>
      </p>
    </Section>
  );
}

/** Liste der kommenden Termine plus Hinweis auf Events und Retreat. Auch auf /termine. */
export async function TermineList({ limit }: { limit: number }) {
  const events = await upcomingPublicEvents(limit);
  return (
    <div className="grid gap-3 lg:grid-cols-12 lg:gap-4">
      {events.length === 0 ? (
        <p className="border border-line p-6 text-lg text-slate-light lg:col-span-8">
          {termine.empty}
        </p>
      ) : (
        <ol className="grid gap-3 lg:col-span-8">
          {events.map((event, i) => {
            const cancelled = event.status === "cancelled";
            return (
              <Reveal
                as="li"
                key={event.id}
                delay={i * 80}
                className={`flex items-center gap-5 p-5 md:gap-8 md:p-6 ${cancelled ? "border border-line" : "card"}`}
              >
                <p className="flex h-16 w-16 shrink-0 flex-col items-center justify-center border border-line md:h-20 md:w-20">
                  <time
                    dateTime={event.starts_at}
                    className="headline text-lg tabular-nums md:text-2xl"
                  >
                    {formatDay(event.starts_at)}
                  </time>
                </p>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-lg font-semibold ${cancelled ? "line-through decoration-1" : ""}`}
                  >
                    {event.title}
                  </p>
                  {event.topic ? (
                    <p className="mt-1 text-base text-white">
                      {termine.topicLabel}: {event.topic}
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm text-slate-light md:text-base">
                    {formatLong(event.starts_at)} ·{" "}
                    {cityBySlug(event.city_slug)?.name ?? event.city_slug}
                  </p>
                  {cancelled ? (
                    <p className="label mt-2 text-white">{termine.cancelled}</p>
                  ) : null}
                  {!cancelled && event.trial ? (
                    <Link
                      href={`/schnuppern?termin=${event.id}`}
                      className="label mt-2 inline-block text-white underline underline-offset-4 hover:text-slate-light"
                    >
                      {termine.trialLink}
                    </Link>
                  ) : null}
                </div>
                <p className="label hidden sm:block">{termine.note}</p>
              </Reveal>
            );
          })}
        </ol>
      )}

      <Reveal
        as="aside"
        delay={150}
        className="self-start border border-white p-6 md:p-8 lg:col-span-4"
      >
        <p className="label text-white">{termine.events.title}</p>
        <p className="mt-4 text-lg leading-relaxed">{termine.events.body}</p>
        <p className="label mt-8 text-white">{termine.retreat.title}</p>
        <p className="mt-4 text-lg leading-relaxed">{termine.retreat.body}</p>
      </Reveal>
    </div>
  );
}
