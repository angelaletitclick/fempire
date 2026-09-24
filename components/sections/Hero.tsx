import Link from "next/link";
import { hero } from "@/content/landing";
import { site } from "@/content/site";
import { Arrow, ButtonLink } from "@/components/ui/Button";

export function Hero() {
  const [first, ...rest] = hero.headline;
  return (
    <section
      aria-labelledby="hero-heading"
      className="container-site flex min-h-[min(calc(100svh-4rem),56rem)] flex-col"
    >
      <div className="my-auto py-16 md:py-20">
        <p className="label">{hero.eyebrow}</p>
        <h1
          id="hero-heading"
          className="headline mt-8 text-[clamp(2.5rem,6.2vw,5.75rem)] [hyphens:none]"
        >
          <span className="block">{first}</span>
          {/* Der eine Pink-Akzent des Hero */}
          {rest.map((line) => (
            <span key={line} className="block text-pink">
              {line}
            </span>
          ))}
        </h1>

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-end">
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
      </div>

      <div className="border-t border-line pb-8 pt-5">
        <p className="label">{hero.scarcity}</p>
      </div>
    </section>
  );
}
