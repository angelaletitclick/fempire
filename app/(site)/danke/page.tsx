import type { Metadata } from "next";
import { ClearDraft } from "@/components/funnel/ClearDraft";
import { ButtonLink } from "@/components/ui/Button";
import { Marked } from "@/components/ui/Marked";
import { SectionLabel } from "@/components/ui/Section";
import { danke } from "@/content/funnel";

export const metadata: Metadata = {
  title: danke.meta.title,
  robots: { index: false, follow: false },
};

export default function DankePage() {
  return (
    <section className="container-site py-section">
      <ClearDraft />
      <SectionLabel index="✓" label={danke.label} />
      <h1 className="headline mt-6 max-w-[16ch] text-[2.5rem] leading-[1.15] sm:text-6xl lg:text-7xl">
        <Marked text={danke.headline} />
      </h1>
      <p className="prose-width mt-8 text-lg leading-relaxed text-slate-light">{danke.body}</p>

      <h2 className="label mt-14 text-white">{danke.nextTitle}</h2>
      <ol className="mt-5 grid gap-3 md:grid-cols-3">
        {danke.next.map((item, i) => (
          <li key={item.title} className="card p-6">
            <span aria-hidden="true" className="headline text-4xl text-white">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-6 text-lg font-semibold">{item.title}</h3>
            <p className="mt-2 text-base leading-relaxed text-slate-light">{item.body}</p>
          </li>
        ))}
      </ol>

      <p className="mt-8 text-sm text-slate-light">{danke.mailHint}</p>
      <div className="mt-10">
        <ButtonLink href={danke.back.href} variant="outline">
          {danke.back.label}
        </ButtonLink>
      </div>
    </section>
  );
}
