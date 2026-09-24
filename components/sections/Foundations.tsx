import { circlesNote, foundations } from "@/content/landing";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

/**
 * FEMPIRE FOUNDATIONS als eigenständiges Programm. Bewusst anders aufgebaut als der
 * Leader Circle (kein gleiches Kartenraster daneben), damit es nicht wie eine Stufe wirkt.
 */
export function Foundations() {
  const t = foundations;
  return (
    <Section id={t.id} index="04" label={t.label} headline={t.headline} intro={t.intro}>
      <div className="grid gap-3 lg:grid-cols-12 lg:gap-4">
        {/* Programm-Anker: Dauer statt Stufe */}
        <Reveal className="flex flex-col justify-between border border-white p-6 sm:p-8 lg:col-span-4 lg:p-10">
          <p className="label text-white">Programm</p>
          <p className="mt-10 flex items-baseline gap-3">
            <span className="headline text-[5.5rem] leading-none md:text-[7rem]">{t.duration.value}</span>
            <span className="headline text-2xl md:text-3xl">{t.duration.unit}</span>
          </p>
          <p className="mt-6 text-base leading-relaxed text-slate-light">{t.duration.note}</p>
        </Reveal>

        <ol className="grid gap-3 sm:grid-cols-2 lg:col-span-8 lg:gap-4">
          {t.items.map((item, i) => (
            <Reveal as="li" key={item.title} delay={i * 80} className="card p-6 md:p-8">
              <span aria-hidden="true" className="label tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 text-lg font-semibold md:text-xl">{item.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-slate-light">{item.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>

      <Reveal className="mt-8 grid gap-6 md:grid-cols-12 md:items-center">
        <p className="text-lg leading-relaxed text-white md:col-span-7">{t.forWhom}</p>
        <div className="md:col-span-5 md:justify-self-end">
          <ButtonLink href={t.cta.href} className="w-full sm:w-auto">
            {t.cta.label}
            <Arrow />
          </ButtonLink>
        </div>
      </Reveal>

      <Reveal as="p" className="mt-10 border-t border-line pt-6 text-sm leading-relaxed text-slate-light md:max-w-3xl">
        {circlesNote}
      </Reveal>
    </Section>
  );
}
