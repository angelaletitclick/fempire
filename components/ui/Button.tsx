import Link from "next/link";
import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";

/**
 * primary: Weiß auf Onyx, Standard-CTA.
 * accent:  Pink. Pro Viewport-Höhe höchstens einmal einsetzen.
 * outline: 1px-Rahmen, für Navigation und Nebenaktionen.
 * Auf Pink steht Onyx-Text, auf Pink-Deep weißer Text (beides AA-konform).
 */
type Variant = "primary" | "accent" | "outline";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-3 whitespace-nowrap font-sans font-semibold uppercase tracking-[0.12em] transition-colors duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-white text-onyx hover:bg-pink hover:text-onyx",
  accent: "bg-pink text-onyx hover:bg-pink-deep hover:text-white",
  outline: "border border-white/40 text-white hover:border-pink hover:text-pink",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-[0.7rem]",
  md: "h-14 px-7 text-xs",
};

type Common = { variant?: Variant; size?: Size; className?: string };

export function buttonClasses({ variant = "primary", size = "md", className }: Common = {}) {
  return cx(base, variants[variant], sizes[size], className);
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: Common & ComponentProps<typeof Link>) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />;
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: Common & ComponentProps<"button">) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}

export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 12"
      className={cx("h-3 w-5 shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M0 6h18M13 1l5 5-5 5" />
    </svg>
  );
}
