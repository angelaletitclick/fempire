import Link from "next/link";
import { cityBySlug } from "@/content/cities";
import { trialBand } from "@/content/landing";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { trialEvents } from "@/lib/events";
import { formatDay, formatLong } from "@/lib/time";

/** Schnuppertermine hervorgehoben: Vorteile, nächste offene Termine, Anfrage */
export async function TrialBand({ index = "+" }: { index?: string }) {
  const t = trialBand;
  const events = (await trialEvents()).slice(0, t.show);
  return (
    <Section id={t.id} index={index} label={t.label} headline={t.headline} intro={t.intro}>
      <div className="grid gap-3 lg:grid-cols-12 lg:gap-4">
        <Reveal className="flex flex-col border-2 border-white p-6 sm:p-8 lg:col-span-5 lg:p-10">
          <ul className="grid gap-4">
            {t.points.map((point) => (
              <li key={point} className="flex items-start gap-4 text-lg text-white">
                <span aria-hidden="true" className="mt-2.5 h-2 w-2 shrink-0 bg-white" />
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-10 lg:mt-auto lg:pt-10">
            <ButtonLink href={t.cta.href} variant="accent" className="w-full sm:w-auto">
              {t.cta.label}
              <Arrow />
            </ButtonLink>
          </div>
        </Reveal>

        <Reveal delay={120} className="border border-line p-6 sm:p-8 lg:col-span-7 lg:p-10">
          <p className="label text-white">{t.nextLabel}</p>
          {events.length === 0 ? (
            <p className="mt-5 text-lg leading-relaxed text-slate-light">{t.empty}</p>
          ) : (
            <ol className="mt-5 divide-y divide-line border-y border-line">
              {events.map((event) => (
                <li key={event.id}>
                  <Link href={`/schnuppern?termin=${event.id}`} className="group flex items-center gap-5 py-4 hover:bg-surface md:px-3">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center border border-line">
                      <time dateTime={event.starts_at} className="headline text-base tabular-nums">
                        {formatDay(event.starts_at)}
                      </time>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-white">{event.title}</span>
                      <span className="block text-sm text-slate-light">
                        {event.topic ? `Thema: ${event.topic} · ` : ""}
                        {formatLong(event.starts_at)} · {cityBySlug(event.city_slug)?.name ?? event.city_slug}
                      </span>
                    </span>
                    <span aria-hidden="true" className="text-white transition-transform group-hover:translate-x-1">
                      <Arrow />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </Reveal>
      </div>
    </Section>
  );
}
