"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { site } from "@/content/site";
import { Arrow, ButtonLink } from "@/components/ui/Button";
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
    // Hintergrund nicht mitscrollen, solange das Menü offen ist
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-plum/95 pt-[env(safe-area-inset-top)]">
      <a
        href="#inhalt"
        className="label sr-only bg-plum px-4 py-3 text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-2"
      >
        Zum Inhalt springen
      </a>
      <div className="container-site flex h-16 items-center justify-between gap-3">
        <Logo />

        <nav aria-label="Hauptnavigation" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="label transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          {/* Mobil liegt der CTA in der Aktionsleiste unten */}
          <span className="hidden lg:block">
            <ButtonLink href={site.cta.href} variant="outline" size="sm">
              {site.cta.shortLabel}
            </ButtonLink>
          </span>
          <button
            type="button"
            className="-mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">
              {open ? "Menü schließen" : "Menü öffnen"}
            </span>
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

      {/* Mobiles Menü als Vollbild-Sheet unter der Kopfzeile */}
      <div
        id={menuId}
        className={cx(
          "fixed inset-x-0 bottom-0 top-[calc(4rem+env(safe-area-inset-top))] z-50 flex-col overflow-y-auto bg-plum lg:hidden",
          open ? "flex" : "hidden",
        )}
      >
        <nav
          aria-label="Hauptnavigation mobil"
          className="container-site flex-1 pt-6"
        >
          <ul>
            {site.nav.map((item, i) => (
              <li key={item.href} className="border-b border-line">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-5 py-6 active:bg-surface"
                >
                  <span className="label w-6 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="headline text-3xl">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="container-site grid gap-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-8">
          <ButtonLink
            href={site.cta.href}
            onClick={() => setOpen(false)}
            className="w-full"
          >
            {site.cta.label}
            <Arrow />
          </ButtonLink>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {site.footer.legal.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="label"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
