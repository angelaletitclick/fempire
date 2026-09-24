import Link from "next/link";
import { site } from "@/content/site";
import { cx } from "@/lib/cx";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${site.name}, zur Startseite`}
      className={cx("whitespace-nowrap font-[family-name:var(--font-syne)] text-xs font-extrabold uppercase tracking-[0.04em] sm:text-sm sm:tracking-[0.08em]", className)}
    >
      Fempire<span className="text-slate-light"> Club</span>
    </Link>
  );
}
