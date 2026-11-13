import { cx } from "@/lib/cx";

/** Kurzer Text aus Forum und Chat: Zeilenumbrüche bleiben erhalten */
export function PlainText({ text, className }: { text: string; className?: string }) {
  return <div className={cx("whitespace-pre-line break-words", className)}>{text}</div>;
}
