import { cityBySlug } from "@/content/cities";
import Link from "next/link";
import { hero } from "@/content/landing";
import { site } from "@/content/site";
import { Arrow } from "@/components/ui/Button";
import { nextPublicEvent } from "@/lib/events";
import { formatDay } from "@/lib/time";

/**
 * Mobil fixierte Aktionsleiste unten, wie in einer App: Schnuppertermin und nächstes Treffen links, Mitglied werden rechts.
 * Ab lg ausgeblendet, dort steht der CTA in Kopfzeile und Hero.
 */
export async function MobileActionBar() {
  const next = await nextPublicEvent();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-plum/95 pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="container-site flex h-[4.5rem] items-center justify-between gap-4">
        {/* Links: Schnuppertermin, darunter das nächste Treffen */}
        <Link href={site.trialCta.href} className="min-w-0 leading-tight">
          <span className="label block text-[0.625rem] text-white underline underline-offset-4">{site.trialCta.label}</span>
          {next ? (
            <span className="text-sm text-slate-light">
              {hero.nextMeetingLabel} {formatDay(next.starts_at)} · {cityBySlug(next.city_slug)?.name ?? next.city_slug}
            </span>
          ) : null}
        </Link>
        <Link
          href={site.cta.href}
          className="group inline-flex h-12 shrink-0 items-center gap-3 bg-white px-5 text-xs font-semibold uppercase tracking-[0.12em] text-plum active:bg-pink active:text-white"
        >
          {site.cta.shortLabel}
          <Arrow />
        </Link>
      </div>
    </div>
  );
}
