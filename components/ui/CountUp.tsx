"use client";

import { useEffect, useRef } from "react";

const format = (cents: number) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);

/**
 * Betrag, der beim Sichtbarwerden von 0 hochzählt. Server und Screenreader bekommen
 * immer den Endwert, die Animation läuft nur im sichtbaren Text und nicht bei
 * prefers-reduced-motion.
 */
export function CountUp({ cents, prefix = "", duration = 1400, className }: { cents: number; prefix?: string; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const final = `${prefix}${format(cents)}`;

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    // Ganze Euro während des Zählens, am Ende der exakte Betrag
    const step = (value: number) => `${prefix}${format(Math.round(value / 100) * 100)}`;
    el.textContent = step(0);
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 4);
          el.textContent = t < 1 ? step(cents * eased) : final;
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      el.textContent = final;
    };
  }, [cents, prefix, duration, final]);

  return (
    <span className={className}>
      <span ref={ref} aria-hidden="true" className="tabular-nums">
        {final}
      </span>
      <span className="sr-only">{final}</span>
    </span>
  );
}
