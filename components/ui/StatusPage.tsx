import type { ReactNode } from "react";
import { Marked } from "./Marked";
import { SectionLabel } from "./Section";

/** Schlichte Seite für Bestätigungen und Hinweise (Warteliste, Club-Login usw.) */
export function StatusPage({
  label,
  headline,
  body,
  children,
}: {
  label: string;
  headline: string;
  body?: string;
  children?: ReactNode;
}) {
  return (
    <section className="container-site flex min-h-[60svh] flex-col justify-center py-section">
      <SectionLabel index="·" label={label} />
      <h1 className="headline mt-6 max-w-[18ch] text-[2.25rem] leading-[1.15] sm:text-5xl lg:text-6xl">
        <Marked text={headline} />
      </h1>
      {body ? <p className="prose-width mt-6 text-lg leading-relaxed text-slate-light">{body}</p> : null}
      {children ? <div className="mt-10">{children}</div> : null}
    </section>
  );
}
