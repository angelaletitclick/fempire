"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Startet die CSS-Animationen (anim-draw, anim-fill, anim-pop, anim-fade-up) der Kinder erst,
 * wenn der Bereich ins Bild scrollt. Bis dahin pausieren sie in ihrem Anfangszustand.
 * Ohne JavaScript schaltet ein <noscript>-Style alles sofort frei, bei
 * prefers-reduced-motion gibt es gar keine Animation.
 */
export function PlayInView({
  as: Tag = "div",
  className,
  children,
  ...rest
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  [key: `aria-${string}`]: string | undefined;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.dataset.play = "go";
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        el.dataset.play = "go";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} data-play="wait" className={className} {...rest}>
      {children}
    </Tag>
  );
}

/** Ohne JavaScript nichts pausieren */
export function PlayInViewFallback() {
  return (
    <noscript>
      <style>{`[data-play="wait"] * { animation-play-state: running !important; }`}</style>
    </noscript>
  );
}
