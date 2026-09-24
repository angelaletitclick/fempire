import Link from "next/link";
import { filter } from "@/content/landing";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function Filter() {
  return (
    <Section id={filter.id} index="02" label={filter.label} headline={filter.headline}>
      <div className="grid gap-3 md:grid-cols-2 md:gap-4">
        <Reveal className="card p-6 md:p-10">
          <h3 className="label flex items-center gap-3 text-white">
            <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center bg-white text-onyx">
              +
            </span>
            {filter.yes.title}
          </h3>
          <ul className="mt-6 divide-y divide-line">
            {filter.yes.items.map((item) => (
              <li key={item} className="py-4 text-lg leading-snug first:pt-0 last:pb-0 md:text-xl">
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={120} className="border border-line p-6 md:p-10">
          <h3 className="label flex items-center gap-3 text-white">
            <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center border border-slate text-slate-light">
              –
            </span>
            {filter.no.title}
          </h3>
          <ul className="mt-6 divide-y divide-line">
            {filter.no.items.map((item) => (
              <li key={item} className="py-4 text-lg leading-snug text-slate-light line-through decoration-slate/50 decoration-1 first:pt-0 last:pb-0 md:text-xl">
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
      <Reveal className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-base">
        <span className="text-slate-light">{filter.foundationsHint.text}</span>
        <Link href={filter.foundationsHint.href} className="font-semibold text-white underline underline-offset-4 hover:text-slate-light">
          {filter.foundationsHint.link}
        </Link>
      </Reveal>
    </Section>
  );
}
