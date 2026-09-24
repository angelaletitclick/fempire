"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { site } from "@/content/site";
import { ButtonLink } from "@/components/ui/Button";
import { cx } from "@/lib/cx";
import { Logo } from "./Logo";

export function Nav() {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-onyx/90 pt-[env(safe-area-inset-top)]">
      <a
        href="#inhalt"
        className="label sr-only bg-onyx px-4 py-3 text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-2"
      >
        Zum Inhalt springen
      </a>
      <div className="container-site flex h-16 items-center justify-between gap-3">
        <Logo />

        <nav aria-label="Hauptnavigation" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="label transition-colors hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 sm:gap-3">
          <ButtonLink href={site.cta.href} variant="outline" size="sm">
            {site.cta.shortLabel}
          </ButtonLink>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center lg:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "Menü schließen" : "Menü öffnen"}</span>
            <span aria-hidden="true" className="relative block h-3 w-6">
              <span
                className={cx(
                  "absolute left-0 h-px w-6 bg-white transition-transform duration-300",
                  open ? "top-1.5 rotate-45" : "top-0",
                )}
              />
              <span
                className={cx(
                  "absolute left-0 h-px w-6 bg-white transition-transform duration-300",
                  open ? "top-1.5 -rotate-45" : "top-3",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      <nav
        id={menuId}
        aria-label="Hauptnavigation mobil"
        className={cx("border-t border-line lg:hidden", open ? "block" : "hidden")}
      >
        <ul className="container-site py-4">
          {site.nav.map((item) => (
            <li key={item.href} className="border-b border-line last:border-b-0">
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="headline block py-5 text-2xl"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
