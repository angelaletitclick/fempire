import { cx } from "@/lib/cx";

/**
 * Platzhalter bis echte Fotos vorliegen: schwarze Fläche, feine Linie, Bildunterschrift.
 * Später durch next/image mit demselben Seitenverhältnis ersetzen.
 */
export function ImagePlaceholder({
  caption,
  ratio = "aspect-[4/5]",
  className,
  captionClassName,
}: {
  caption: string;
  ratio?: string;
  className?: string;
  captionClassName?: string;
}) {
  return (
    <figure className={cx("m-0", className)}>
      <div
        role="img"
        aria-label={caption}
        className={cx("relative w-full border border-line bg-plum", ratio)}
      >
        <span aria-hidden="true" className="absolute left-3 top-3 h-px w-6 bg-line" />
        <span aria-hidden="true" className="absolute left-3 top-3 h-6 w-px bg-line" />
        <span aria-hidden="true" className="absolute bottom-3 right-3 h-px w-6 bg-line" />
        <span aria-hidden="true" className="absolute bottom-3 right-3 h-6 w-px bg-line" />
      </div>
      <figcaption className={cx("label mt-3 text-[0.625rem]", captionClassName)}>{caption}</figcaption>
    </figure>
  );
}
