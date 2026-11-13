import type { ReactNode } from "react";
import { Marked } from "@/components/ui/Marked";
import { SectionLabel } from "@/components/ui/Section";

/** Kopf einer Seite im Mitgliederbereich: Label, große Headline, optional Intro und Aktionen rechts */
export function PageHead({
  label,
  headline,
  intro,
  actions,
  index = "·",
}: {
  label: string;
  headline: string;
  intro?: string;
  actions?: ReactNode;
  index?: string;
}) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <SectionLabel index={index} label={label} />
        <h1 className="headline mt-5 max-w-[22ch] text-[2.25rem] leading-[1.1] [hyphens:auto] sm:text-5xl">
          <Marked text={headline} />
        </h1>
        {intro ? <p className="prose-width mt-5 text-base leading-relaxed text-slate-light">{intro}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

/** Kleiner Status-Marker (Rahmen + Punkt), z. B. "Wartet auf Freigabe" */
export function Tag({ children, tone = "line" }: { children: ReactNode; tone?: "line" | "white" | "pink" }) {
  const styles = {
    line: "border-line text-slate-light",
    white: "border-white text-white",
    pink: "border-pink text-white",
  };
  return (
    <span className={`label inline-flex items-center gap-2 border px-2.5 py-1 text-[0.625rem] ${styles[tone]}`}>
      {children}
    </span>
  );
}
