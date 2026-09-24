"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Fade-up beim Scrollen. Server-seitig ist der Inhalt immer sichtbar.
 * Erst nach dem Mounten werden Elemente, die noch unterhalb des Viewports liegen,
 * auf "pending" gesetzt und beim Eintreten eingeblendet. Bei
 * prefers-reduced-motion greift die Animation per CSS nicht.
 */
export function Reveal({
  as: Tag = "div",
  delay = 0,
  className,
  children,
}: {
  as?: ElementType;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.dataset.reveal = "pending";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        el.dataset.reveal = "shown";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={className} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}
