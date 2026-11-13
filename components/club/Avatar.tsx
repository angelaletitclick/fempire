import { avatarUrl, type Member } from "@/lib/auth";
import { cx } from "@/lib/cx";

const sizes = {
  sm: "h-10 w-10 text-xs",
  md: "h-14 w-14 text-sm",
  lg: "h-28 w-28 text-2xl sm:h-36 sm:w-36",
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/**
 * Profilfoto in Schwarz-Weiß, sonst Initialen. Die Fotos liegen privat und werden über
 * /club/avatar/[id] erst nach der Login-Prüfung ausgeliefert, deshalb ohne Bildoptimierung.
 */
export function Avatar({
  member,
  size = "md",
}: {
  member: Pick<Member, "user_id" | "avatar_path" | "updated_at" | "full_name">;
  size?: keyof typeof sizes;
}) {
  const src = avatarUrl(member);
  return (
    <span className={cx("relative flex shrink-0 items-center justify-center overflow-hidden border border-line bg-plum", sizes[size])}>
      {src ? (
        // Privates Bild hinter Login: die Bildoptimierung von Next würde ohne Cookies anfragen
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover grayscale contrast-110" />
      ) : (
        <span aria-hidden="true" className="headline tabular-nums text-white">
          {initials(member.full_name)}
        </span>
      )}
    </span>
  );
}
