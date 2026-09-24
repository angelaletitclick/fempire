import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/**
 * Mobil eine wischbare Kartenreihe (Snap, die nächste Karte schaut an),
 * ab md ein normales Raster. `columns` bestimmt die Spalten ab lg.
 */
export function Rail({
  label,
  columns = 3,
  as: Tag = "ul",
  className,
  children,
}: {
  label: string;
  columns?: 2 | 3 | 4;
  as?: "ul" | "ol";
  className?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p aria-hidden="true" className="label mb-4 flex items-center gap-2 md:hidden">
        Wischen
        <svg viewBox="0 0 20 12" className="h-3 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M0 6h18M13 1l5 5-5 5" />
        </svg>
      </p>
      <Tag
        aria-label={label}
        tabIndex={0}
        className={cx(
          "rail md:grid-cols-2",
          columns === 3 && "lg:grid-cols-3",
          columns === 4 && "lg:grid-cols-4",
          className,
        )}
      >
        {children}
      </Tag>
    </div>
  );
}
