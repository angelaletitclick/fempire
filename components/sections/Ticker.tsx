import { ticker } from "@/content/landing";

/**
 * Laufband mit den Themen des Kreises. Dekorativ, deshalb aria-hidden.
 * Hält bei Hover an und steht bei prefers-reduced-motion still.
 */
export function Ticker() {
  // Zwei identische Hälften, die Animation verschiebt um -50 % für eine nahtlose Schleife
  const half = [...ticker, ...ticker];
  return (
    <div aria-hidden="true" className="overflow-hidden border-y border-line py-6 md:py-8">
      <div className="anim-marquee flex w-max">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {half.map((word, i) => (
              <span key={`${copy}-${i}`} className="flex items-center">
                <span className="headline px-6 text-3xl text-slate/30 md:px-10 md:text-5xl">
                  {word}
                </span>
                <span className="h-1.5 w-1.5 rotate-45 bg-line" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
