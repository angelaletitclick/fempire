import { Fragment, type ReactNode } from "react";

/**
 * Hervorhebungen in Texten aus content/:
 *   ==Text==  pinke Fläche, weiße Schrift
 *   ++Text++  weiße Fläche, schwarze Schrift
 *
 * Pinke Flächen nur in großen Headlines verwenden: Weiß auf Pink erfüllt den
 * Kontrast (AA) erst ab großer, fetter Schrift.
 */
const MARK_PATTERN = /(==[^=]+==|\+\+[^+]+\+\+)/g;

export function Marked({ text }: { text: string }): ReactNode {
  const parts = text.split(MARK_PATTERN);
  return parts.map((part, i) => {
    if (part.startsWith("==") && part.endsWith("==")) {
      return (
        <mark key={i} className="mark mark-pink">
          {part.slice(2, -2)}
        </mark>
      );
    }
    if (part.startsWith("++") && part.endsWith("++")) {
      return (
        <mark key={i} className="mark mark-white">
          {part.slice(2, -2)}
        </mark>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

/** Text ohne Markierungszeichen, z. B. für Alt-Texte und Metadaten */
export function plain(text: string): string {
  return text.replace(/==|\+\+/g, "");
}

/** Zerlegt Text in Abschnitte für Umgebungen ohne React-DOM (OG-Bild) */
export function markSegments(text: string): Array<{ text: string; mark?: "pink" | "white" }> {
  return text
    .split(MARK_PATTERN)
    .filter(Boolean)
    .map((part) => {
      if (part.startsWith("==") && part.endsWith("==")) return { text: part.slice(2, -2), mark: "pink" as const };
      if (part.startsWith("++") && part.endsWith("++")) return { text: part.slice(2, -2), mark: "white" as const };
      return { text: part };
    });
}
