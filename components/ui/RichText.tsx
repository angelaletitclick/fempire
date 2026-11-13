import type { Block } from "@/lib/articles";
import { cx } from "@/lib/cx";

/**
 * Gibt Text aus dem Backend aus (Absätze, Zwischenüberschriften, Listen).
 * Alles wird als Text gerendert, nie als HTML: eingegebenes Markup bleibt wirkungslos.
 */
export function RichText({ blocks, className }: { blocks: Block[]; className?: string }) {
  return (
    <div className={cx("space-y-6", className)}>
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          return (
            <h2 key={i} className="headline pt-6 text-2xl text-white md:text-3xl">
              {block.text}
            </h2>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={i} className="grid gap-3">
              {block.items.map((item, j) => (
                <li key={j} className="flex items-start gap-4">
                  <span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 bg-white" />
                  {item}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="whitespace-pre-line">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

/** Kurzer Text aus Forum und Chat: Zeilenumbrüche bleiben erhalten */
export function PlainText({ text, className }: { text: string; className?: string }) {
  return <div className={cx("whitespace-pre-line break-words", className)}>{text}</div>;
}
