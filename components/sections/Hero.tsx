import Link from "next/link";
import { hero } from "@/content/landing";
import { site } from "@/content/site";
import { Arrow, ButtonLink } from "@/components/ui/Button";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="container-site flex min-h-[min(calc(100svh-4rem),60rem)] flex-col justify-between pb-8 pt-16 md:pt-24"
    >
      <div>
        <p className="label">{hero.eyebrow}</p>
        <h1
          id="hero-heading"
          className="headline mt-8 text-[clamp(1.75rem,7.6vw,9rem)] [hyphens:none]"
        >
          {hero.headline.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:items-end">
        <p className="prose-width text-lg leading-relaxed text-white lg:col-span-6 md:text-xl">
          {hero.subline}
        </p>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center lg:col-span-6 lg:justify-end">
          <ButtonLink href={site.cta.href}>
            {site.cta.label}
            <Arrow />
          </ButtonLink>
          <Link href={hero.secondaryCta.href} className="label py-3 transition-colors hover:text-white">
            {hero.secondaryCta.label}
          </Link>
        </div>
      </div>

      <div className="relative mt-14 border-t border-line pt-5">
        {/* Die eine Pink-Akzentlinie des Hero */}
        <span aria-hidden="true" className="absolute -top-px left-0 h-0.5 w-1/3 bg-pink md:w-1/4" />
        <p className="label">{hero.scarcity}</p>
      </div>
    </section>
  );
}
