import { homeCity } from "@/content/cities";
import Link from "next/link";
import { hero } from "@/content/landing";
import { site } from "@/content/site";
import { Arrow } from "@/components/ui/Button";
import { formatDay, upcomingMeetings } from "@/lib/meetings";

/**
 * Mobil fixierte Aktionsleiste unten, wie in einer App: nächster Termin links, Bewerben rechts.
 * Ab lg ausgeblendet, dort steht der CTA in Kopfzeile und Hero.
 */
export function MobileActionBar() {
  const next = upcomingMeetings(1)[0];
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-plum/95 pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="container-site flex h-[4.5rem] items-center justify-between gap-4">
        {next ? (
          <p className="min-w-0 leading-tight">
            <span className="label block text-[0.625rem]">{hero.nextMeetingLabel}</span>
            <span className="text-sm font-semibold text-white">{formatDay(next.date)} · {homeCity.name}</span>
          </p>
        ) : (
          <span />
        )}
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
