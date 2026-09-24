import { leaderCircle, type FormatStatus } from "@/content/landing";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { Rail } from "@/components/ui/Rail";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { cx } from "@/lib/cx";

const marker: Record<FormatStatus, string> = {
  aktiv: "bg-pink",
  start: "bg-white",
  vorbereitung: "border border-slate",
};

export function LeaderCircle() {
  const t = leaderCircle;
  return (
    <Section id={t.id} index="03" label={t.label} headline={t.headline} intro={t.intro}>
      <Rail label={t.label}>
        {t.items.map((item, i) => (
          <Reveal
            as="li"
            key={item.title}
            delay={i * 70}
            className={cx(
              "group flex flex-col p-6 transition-colors duration-500 md:p-8",
              item.status === "vorbereitung" ? "border border-line" : "card hover:border-slate",
            )}
          >
            <p className={cx("label flex items-center gap-3", item.status !== "vorbereitung" && "text-white")}>
              <span aria-hidden="true" className={cx("h-2 w-2 shrink-0", marker[item.status])} />
              {t.statusLabels[item.status]}
            </p>
            <h3 className="headline mt-8 text-xl md:text-2xl">{item.title}</h3>
            <p className="mt-4 text-base leading-relaxed text-slate-light">{item.body}</p>
          </Reveal>
        ))}
      </Rail>
      <Reveal className="mt-8">
        <ButtonLink href={t.cta.href} className="w-full sm:w-auto">
          {t.cta.label}
          <Arrow />
        </ButtonLink>
      </Reveal>
    </Section>
  );
}
