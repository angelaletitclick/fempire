import { cx } from "@/lib/cx";

/**
 * Platzhalter bis echte Fotos vorliegen: schwarze Fläche, feine Linie, Bildunterschrift.
 * Später durch next/image mit demselben Seitenverhältnis ersetzen.
 */
export function ImagePlaceholder({
  caption,
  ratio = "aspect-[4/5]",
  className,
}: {
  caption: string;
  ratio?: string;
  className?: string;
}) {
  return (
    <figure className={cx("m-0", className)}>
      <div
        role="img"
        aria-label={caption}
        className={cx("relative w-full border border-line bg-onyx", ratio)}
      >
        <span aria-hidden="true" className="absolute left-4 top-4 h-px w-8 bg-line" />
        <span aria-hidden="true" className="absolute left-4 top-4 h-8 w-px bg-line" />
        <span aria-hidden="true" className="absolute bottom-4 right-4 h-px w-8 bg-line" />
        <span aria-hidden="true" className="absolute bottom-4 right-4 h-8 w-px bg-line" />
      </div>
      <figcaption className="label mt-3">{caption}</figcaption>
    </figure>
  );
}
