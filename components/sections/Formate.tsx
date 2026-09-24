import { formate } from "@/content/landing";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { cx } from "@/lib/cx";

export function Formate() {
  return (
    <Section id={formate.id} index="03" label={formate.label} headline={formate.headline} intro={formate.intro}>
      <ul className="border-b border-line">
        {formate.items.map((item) => {
          const active = item.status === "start";
          return (
            <Reveal
              as="li"
              key={item.title}
              className="grid gap-4 border-t border-line py-8 md:grid-cols-12 md:gap-10 md:py-10"
            >
              <p className={cx("label flex items-center gap-3 md:col-span-3", active && "text-white")}>
                <span
                  aria-hidden="true"
                  className={cx("h-2 w-2 shrink-0", active ? "bg-pink" : "border border-slate")}
                />
                {formate.statusLabels[item.status]}
              </p>
              <h3 className="headline text-xl md:col-span-4 md:text-2xl">{item.title}</h3>
              <p className="prose-width text-base leading-relaxed text-slate md:col-span-5">{item.body}</p>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}
