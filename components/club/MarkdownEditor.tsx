"use client";

import { useRef, useState, type ClipboardEvent } from "react";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { Markdown } from "@/components/ui/Markdown";
import { downscaleImage } from "@/lib/downscale";
import { cx } from "@/lib/cx";

/** HTML aus Word, Google Docs oder Webseiten → Markdown (Überschriften, Listen, Tabellen, Links) */
function htmlToMarkdown(html: string): string {
  const service = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    emDelimiter: "_",
    strongDelimiter: "**",
    codeBlockStyle: "fenced",
  });
  service.use(gfm);
  service.remove(["style", "script", "meta", "title", "img"]);
  // Google Docs packt alles in <b style="font-weight:normal">: das ist kein Fettdruck
  service.addRule("docsWrapper", {
    filter: (node) => node.nodeName === "B" && /font-weight:\s*normal/.test(node.getAttribute("style") ?? ""),
    replacement: (content) => content,
  });
  // Google Docs markiert Fett/Kursiv über style statt <strong>/<em>
  service.addRule("styledSpan", {
    filter: (node) => node.nodeName === "SPAN" && /font-weight:\s*(700|bold)|font-style:\s*italic/.test(node.getAttribute("style") ?? ""),
    replacement: (content, node) => {
      const style = (node as HTMLElement).getAttribute("style") ?? "";
      if (!content.trim()) return content;
      let out = content;
      if (/font-style:\s*italic/.test(style)) out = `_${out}_`;
      if (/font-weight:\s*(700|bold)/.test(style)) out = `**${out}**`;
      return out;
    },
  });
  // Jede Tabelle als Markdown-Tabelle, erste Zeile wird Kopfzeile (Google Docs und Word liefern keine <th>)
  service.addRule("anyTable", {
    filter: "table",
    replacement: (_content, node) => {
      const rows = Array.from((node as HTMLElement).querySelectorAll("tr")).map((row) =>
        Array.from(row.querySelectorAll("th, td")).map((cell) =>
          service
            .turndown((cell as HTMLElement).innerHTML)
            .replace(/\s*\n+\s*/g, " ")
            .replace(/\|/g, "\\|")
            .trim(),
        ),
      );
      if (!rows.length) return "";
      const width = Math.max(...rows.map((row) => row.length));
      const line = (row: string[]) => `| ${Array.from({ length: width }, (_, i) => row[i] || " ").join(" | ")} |`;
      const [head, ...body] = rows;
      return `\n\n${line(head!)}\n| ${Array.from({ length: width }, () => "---").join(" | ")} |\n${body.map(line).join("\n")}\n\n`;
    },
  });
  return service
    .turndown(html)
    .replace(/^(\s*)([-*]|\d+\.)\s{2,}/gm, "$1$2 ")
    .replace(/ /g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

type Tool =
  | { label: string; title: string; kind: "line"; prefix: string }
  | { label: string; title: string; kind: "wrap"; before: string; after: string; placeholder: string }
  | { label: string; title: string; kind: "insert"; text: string };

const TOOLS: Tool[] = [
  { label: "H2", title: "Überschrift", kind: "line", prefix: "## " },
  { label: "H3", title: "Zwischenüberschrift", kind: "line", prefix: "### " },
  { label: "H4", title: "Kleine Überschrift", kind: "line", prefix: "#### " },
  { label: "B", title: "Fett", kind: "wrap", before: "**", after: "**", placeholder: "fett" },
  { label: "I", title: "Kursiv", kind: "wrap", before: "_", after: "_", placeholder: "kursiv" },
  { label: "Link", title: "Link", kind: "wrap", before: "[", after: "](https://)", placeholder: "Linktext" },
  { label: "• Liste", title: "Aufzählung", kind: "line", prefix: "- " },
  { label: "1. Liste", title: "Nummerierte Liste", kind: "line", prefix: "1. " },
  { label: "Zitat", title: "Zitat", kind: "line", prefix: "> " },
  {
    label: "Tabelle",
    title: "Tabelle einfügen",
    kind: "insert",
    text: "\n\n| Spalte 1 | Spalte 2 | Spalte 3 |\n| --- | --- | --- |\n| Wert | Wert | Wert |\n| Wert | Wert | Wert |\n\n",
  },
  { label: "Linie", title: "Trennlinie", kind: "insert", text: "\n\n---\n\n" },
];

/**
 * Editor für Magazin-Artikel: Markdown mit Werkzeugleiste und Vorschau.
 * Das Textfeld heißt "body" und wird mit dem umgebenden Formular abgeschickt.
 */
export function MarkdownEditor({
  name,
  defaultValue,
  hint,
  onUploadImage,
}: {
  name: string;
  defaultValue: string;
  hint?: string;
  /** Lädt ein Bild hoch und gibt dessen Adresse zurück (Server Action) */
  onUploadImage?: (formData: FormData) => Promise<{ url: string } | { error: string }>;
}) {
  const [value, setValue] = useState(defaultValue);
  const [preview, setPreview] = useState(false);
  const [imageStatus, setImageStatus] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /** Bild verkleinern, hochladen und mit Bildunterschrift an der Cursorposition einfügen */
  async function insertImage(file: File) {
    if (!onUploadImage) return;
    const el = ref.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    setImageStatus("Bild wird hochgeladen …");
    const formData = new FormData();
    formData.set("image", await downscaleImage(file, 1800));
    const result = await onUploadImage(formData);
    if ("error" in result) {
      setImageStatus(result.error);
      return;
    }
    setImageStatus("");
    // Zeichen entfernen, die die Markdown-Syntax des Bildes brechen würden
    const caption = (window.prompt("Bildunterschrift (optional, z. B. Foto: Name)") ?? "").replace(/["[\]]/g, "").trim();
    const alt = (window.prompt("Kurze Bildbeschreibung für Screenreader (was ist zu sehen?)", caption) ?? caption)
      .replace(/[[\]]/g, "")
      .trim();
    const markdown = `\n\n![${alt}](${result.url}${caption ? ` "${caption}"` : ""})\n\n`;
    replace(start, end, markdown, start + markdown.length, start + markdown.length);
  }

  /** Text ersetzen und Auswahl setzen, ohne den Verlauf (Strg+Z) zu zerstören, wo möglich */
  function replace(start: number, end: number, text: string, selectStart: number, selectEnd: number) {
    const el = ref.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(start, end);
    const ok = typeof document.execCommand === "function" && document.execCommand("insertText", false, text);
    if (!ok) el.setRangeText(text, start, end, "end");
    setValue(el.value);
    requestAnimationFrame(() => el.setSelectionRange(selectStart, selectEnd));
  }

  function apply(tool: Tool) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end, value: current } = el;
    const selected = current.slice(start, end);

    if (tool.kind === "wrap") {
      const inner = selected || tool.placeholder;
      const text = `${tool.before}${inner}${tool.after}`;
      replace(start, end, text, start + tool.before.length, start + tool.before.length + inner.length);
      return;
    }
    if (tool.kind === "insert") {
      replace(start, end, tool.text, start + tool.text.length, start + tool.text.length);
      return;
    }
    // Zeilen-Präfix: auf alle markierten Zeilen anwenden, bestehende Überschriften-Präfixe ersetzen
    const lineStart = current.lastIndexOf("\n", start - 1) + 1;
    const lineEndIndex = current.indexOf("\n", end);
    const lineEnd = lineEndIndex === -1 ? current.length : lineEndIndex;
    const lines = current.slice(lineStart, lineEnd).split("\n");
    const text = lines
      .map((line, i) => {
        const stripped = line.replace(/^(#{1,6} |> |- |\d+\. )/, "");
        const prefix = tool.prefix === "1. " ? `${i + 1}. ` : tool.prefix;
        return line.startsWith(prefix) && lines.length === 1 ? stripped : `${prefix}${stripped}`;
      })
      .join("\n");
    replace(lineStart, lineEnd, text, lineStart + text.length, lineStart + text.length);
  }

  function onPaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const html = event.clipboardData.getData("text/html");
    if (!html) return;
    const markdown = htmlToMarkdown(html);
    if (!markdown) return;
    event.preventDefault();
    const el = event.currentTarget;
    replace(el.selectionStart, el.selectionEnd, markdown, el.selectionStart + markdown.length, el.selectionStart + markdown.length);
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <label htmlFor={`f-${name}`} className="text-sm font-medium text-white">
          Text
        </label>
        <div role="tablist" aria-label="Ansicht" className="flex gap-1">
          {[
            { id: false, label: "Schreiben" },
            { id: true, label: "Vorschau" },
          ].map((tab) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={preview === tab.id}
              onClick={() => setPreview(tab.id)}
              className={cx("label border px-3 py-1.5", preview === tab.id ? "border-white bg-white text-plum" : "border-line hover:text-white")}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className={cx("flex flex-wrap gap-1 border border-b-0 border-line bg-surface p-2", preview && "hidden")} role="toolbar" aria-label="Formatierung">
        {onUploadImage ? (
          <>
            <button
              type="button"
              title="Bild mit Bildunterschrift einfügen"
              aria-label="Bild mit Bildunterschrift einfügen"
              onClick={() => fileRef.current?.click()}
              className="h-9 min-w-9 border border-transparent px-2.5 text-xs font-semibold text-white hover:border-line hover:bg-plum"
            >
              Bild
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              tabIndex={-1}
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = "";
                if (file) void insertImage(file);
              }}
            />
          </>
        ) : null}
        {TOOLS.map((tool) => (
          <button
            key={tool.label}
            type="button"
            title={tool.title}
            aria-label={tool.title}
            onClick={() => apply(tool)}
            className={cx(
              "h-9 min-w-9 border border-transparent px-2.5 text-xs font-semibold text-white hover:border-line hover:bg-plum",
              tool.label === "B" && "font-black",
              tool.label === "I" && "italic",
            )}
          >
            {tool.label}
          </button>
        ))}
      </div>

      <textarea
        ref={ref}
        id={`f-${name}`}
        name={name}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onPaste={onPaste}
        rows={24}
        maxLength={100000}
        aria-describedby={hint ? `f-${name}-hint` : undefined}
        className={cx(
          "w-full resize-y border border-line bg-plum px-4 py-3.5 font-mono text-sm leading-relaxed text-white placeholder:text-slate focus:border-white focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink",
          preview && "hidden",
        )}
      />

      {preview ? (
        <div className="min-h-64 border border-line bg-plum p-6 text-lg leading-relaxed text-slate-light">
          {value.trim() ? <Markdown text={value} /> : <p className="text-slate">Noch kein Text.</p>}
        </div>
      ) : null}

      {imageStatus ? (
        <p role="status" className="text-sm text-white">
          {imageStatus}
        </p>
      ) : null}
      {hint ? (
        <p id={`f-${name}-hint`} className="text-sm leading-relaxed text-slate-light">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
