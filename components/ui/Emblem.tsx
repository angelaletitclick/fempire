
/** Geometrische Krone aus fünf Zacken, 1px-Linie. Das Symbol des Clubs. */
export function Crown({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 40 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="miter"
      className={className}
    >
      <path d="M3 22 L3 7 L11.5 14 L20 2 L28.5 14 L37 7 L37 22 Z" />
      <path d="M3 26 H37" />
    </svg>
  );
}

