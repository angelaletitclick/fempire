import { cx } from "@/lib/cx";

/** Geometrische Krone aus fünf Zacken, 1px-Linie. Das Symbol des Clubs. */
export function Crown({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 40 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="miter"
      className={className}
    >
      <path d="M3 22 L3 7 L11.5 14 L20 2 L28.5 14 L37 7 L37 22 Z" />
      <path d="M3 26 H37" />
    </svg>
  );
}

/**
 * Siegel: Krone in der Mitte, umlaufender Text dreht sich langsam.
 * Rein dekorativ, für Screenreader ausgeblendet.
 */
export function Seal({ id, text, className }: { id: string; text: string; className?: string }) {
  const ring = text.toUpperCase();
  return (
    <div aria-hidden="true" className={cx("relative aspect-square", className)}>
      <svg viewBox="0 0 200 200" className="anim-spin absolute inset-0 h-full w-full text-slate-light">
        <defs>
          <path id={id} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <circle cx="100" cy="100" r="97" fill="none" style={{ stroke: "var(--line)" }} strokeWidth="1" />
        <circle cx="100" cy="100" r="62" fill="none" style={{ stroke: "var(--line)" }} strokeWidth="1" />
        <text fill="currentColor" fontSize="18" letterSpacing="4.9" fontWeight="600" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
          <textPath href={`#${id}`}>
            {ring}
          </textPath>
        </text>
      </svg>
      <Crown className="absolute left-1/2 top-1/2 w-[26%] -translate-x-1/2 -translate-y-1/2 text-white" />
    </div>
  );
}
