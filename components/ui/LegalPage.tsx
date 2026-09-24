import { Fragment, type ReactNode } from "react";
import type { LegalDocument } from "@/content/legal";
import { SectionLabel } from "./Section";

/** [[...]] als deutlich sichtbaren Platzhalter darstellen, Zeilenumbrüche erhalten */
function renderText(text: string): ReactNode {
  return text.split(/(\[\[[^\]]+\]\])/g).map((part, i) => {
    if (part.startsWith("[[") && part.endsWith("]]")) {
      return (
        <span key={i} className="border border-dashed border-slate-light px-1.5 text-slate-light">
          {part.slice(2, -2)}
        </span>
      );
    }
    return (
      <Fragment key={i}>
        {part.split("\n").map((line, j, lines) => (
          <Fragment key={j}>
            {line}
            {j < lines.length - 1 ? <br /> : null}
          </Fragment>
        ))}
      </Fragment>
    );
  });
}

export function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <article className="container-site py-section">
      <SectionLabel index="§" label={document.label} />
      <h1 className="headline mt-6 text-[2.5rem] leading-[1.1] sm:text-6xl">{document.title}.</h1>
      {document.draft ? (
        <p className="card mt-8 max-w-3xl px-5 py-4 text-sm leading-relaxed text-slate-light">
          Entwurf. Gestrichelt umrandete Angaben werden noch ergänzt.
        </p>
      ) : null}
      <div className="mt-12 grid max-w-3xl gap-10">
        {document.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-semibold text-white md:text-xl">{section.heading}</h2>
            <div className="mt-3 space-y-4 text-base leading-relaxed text-slate-light">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{renderText(paragraph)}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
      <p className="label mt-14">Stand: {document.updated}</p>
    </article>
  );
}
