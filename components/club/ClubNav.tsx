"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/cx";

/**
 * Navigation im Mitgliederbereich und Backend. Mobil eine wischbare Zeile,
 * der aktive Punkt ist unterstrichen.
 */
export function ClubNav({
  items,
  label,
  badges = {},
  exact = [],
}: {
  items: ReadonlyArray<{ label: string; href: string }>;
  label: string;
  /** Zähler hinter einem Punkt, z. B. ungelesene Nachrichten */
  badges?: Record<string, number>;
  /** Punkte, die nur bei exakt gleicher Adresse aktiv sind (Übersichtsseiten) */
  exact?: string[];
}) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="-mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] [scrollbar-width:none]">
      <ul className="flex min-w-max items-center gap-6 md:gap-8">
        {items.map((item) => {
          const active = exact.includes(item.href)
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const badge = badges[item.href] ?? 0;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "label flex h-12 items-center gap-2 border-b-2 transition-colors hover:text-white",
                  active ? "border-white text-white" : "border-transparent",
                )}
              >
                {item.label}
                {badge > 0 ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center bg-white px-1 text-[0.625rem] font-semibold text-plum tabular-nums">
                    {badge}
                    <span className="sr-only"> neu</span>
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
