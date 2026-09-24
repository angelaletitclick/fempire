"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Animation beim Scrollen. Server-seitig ist der Inhalt immer sichtbar.
 * Erst nach dem Mounten werden Elemente, die noch unterhalb des Viewports liegen,
 * auf "pending" gesetzt und beim Eintreten animiert. Bei prefers-reduced-motion
 * greift die Animation per CSS nicht.
 *
 * fade: weich von unten einblenden
 * wipe: von unten nach oben freilegen (für Headlines)
 * line: von links nach rechts zeichnen (für Trennlinien)
 */
export function Reveal({
  as: Tag = "div",
  id,
  variant = "fade",
  delay = 0,
  className,
  children,
}: {
  as?: ElementType;
  id?: string;
  variant?: "fade" | "wipe" | "line";
  delay?: number;
  className?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    el.dataset.reveal = "pending";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        el.dataset.reveal = "shown";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      id={id}
      data-variant={variant}
      className={className}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
