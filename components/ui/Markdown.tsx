import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cx } from "@/lib/cx";

/**
 * Magazin-Text als Markdown im CI-Look: Überschriften, fett/kursiv, Links, Listen, Zitate, Tabellen.
 * HTML im Text wird nicht ausgeführt, gefährliche Links (javascript:) entfernt react-markdown.
 */
const components: Components = {
  h1: ({ children }) => <h2 className="headline pt-8 text-3xl text-white md:text-4xl">{children}</h2>,
  h2: ({ children }) => <h2 className="headline pt-8 text-2xl text-white md:text-3xl">{children}</h2>,
  h3: ({ children }) => <h3 className="pt-6 text-xl font-semibold text-white md:text-2xl">{children}</h3>,
  h4: ({ children }) => <h4 className="label pt-4 text-white">{children}</h4>,
  p: ({ children }) => <p>{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => {
    const external = href?.startsWith("http");
    return (
      <a
        href={href}
        className="text-white underline underline-offset-4 hover:text-blush"
        {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}
      >
        {children}
      </a>
    );
  },
  ul: ({ children }) => <ul className="grid gap-3">{children}</ul>,
  ol: ({ children }) => <ol className="grid list-decimal gap-3 pl-6 marker:font-semibold marker:text-white">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  blockquote: ({ children }) => <blockquote className="border-l-2 border-white pl-6 text-xl leading-relaxed text-white">{children}</blockquote>,
  hr: () => <hr className="border-line" />,
  code: ({ children }) => <code className="bg-surface px-1.5 py-0.5 text-[0.9em] text-white">{children}</code>,
  table: ({ children }) => (
    <div className="-mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] md:mx-0 md:px-0">
      <table className="w-full min-w-[32rem] border-collapse text-left text-base">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="border-b border-white">{children}</thead>,
  th: ({ children }) => <th className="label px-3 py-3 align-bottom text-white first:pl-0">{children}</th>,
  td: ({ children }) => <td className="border-b border-line px-3 py-3 align-top first:pl-0">{children}</td>,
};

export function Markdown({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cx("markdown space-y-6", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Anfang eines Artikels für Gäste (Paywall): die ersten Blöcke bis zur ersten Leerzeile-Grenze.
 * Tabellen und Listen bleiben dabei ganz, weil sie keine Leerzeilen enthalten.
 */
export function markdownPreview(text: string, blocks: number): string {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .filter((chunk) => chunk.trim())
    .slice(0, blocks)
    .join("\n\n");
}
