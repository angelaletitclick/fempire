import type { ComponentProps, ReactNode } from "react";
import { cx } from "@/lib/cx";

/**
 * Formular-Primitives. Harte Kanten, 1px-Linien, Fokus in Pink.
 * Label, Hinweis und Fehler sind über id/aria-describedby mit dem Feld verbunden.
 */

const control =
  "w-full border border-line bg-plum px-4 py-3.5 text-base text-white placeholder:text-slate transition-colors duration-200 hover:border-slate focus:border-white focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink aria-[invalid=true]:border-pink";

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: string;
  children: (describedBy: string | undefined) => ReactNode;
};

export function Field({ id, label, hint, error, optional, children }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="flex items-baseline justify-between gap-4 text-sm font-medium text-white">
        {label}
        {optional ? <span className="label text-[0.625rem]">{optional}</span> : null}
      </label>
      {children(describedBy)}
      {hint ? (
        <p id={hintId} className="text-sm leading-relaxed text-slate-light">
          {hint}
        </p>
      ) : null}
      {error ? <FieldError id={errorId!}>{error}</FieldError> : null}
    </div>
  );
}

export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="flex items-start gap-2 text-sm font-medium text-white">
      <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-pink" />
      {children}
    </p>
  );
}

export function TextInput({ className, ...props }: ComponentProps<"input">) {
  return <input className={cx(control, "h-14", className)} {...props} />;
}

export function TextArea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cx(control, "min-h-36 resize-y leading-relaxed", className)} {...props} />;
}

export function Select({
  className,
  options,
  placeholder,
  ...props
}: ComponentProps<"select"> & { options: ReadonlyArray<{ value: string; label: string }>; placeholder: string }) {
  return (
    <div className="relative">
      <select className={cx(control, "h-14 appearance-none pr-12", className)} {...props}>
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 12 8"
        className="pointer-events-none absolute right-4 top-1/2 h-2 w-3 -translate-y-1/2 text-slate-light"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M1 1l5 5 5-5" />
      </svg>
    </div>
  );
}

/** Auswahl als große, gut tippbare Flächen (Radio-Buttons) */
export function ChoiceGroup({
  name,
  legend,
  hint,
  error,
  optional,
  options,
  value,
  onChange,
  columns = 1,
}: {
  name: string;
  legend: string;
  hint?: string;
  error?: string;
  optional?: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  columns?: 1 | 2 | 3;
}) {
  const hintId = hint ? `${name}-hint` : undefined;
  const errorId = error ? `${name}-error` : undefined;
  return (
    <fieldset
      className="grid gap-3"
      aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
      aria-invalid={error ? true : undefined}
    >
      <legend className="mb-2 flex w-full items-baseline justify-between gap-4 text-sm font-medium text-white">
        {legend}
        {optional ? <span className="label text-[0.625rem]">{optional}</span> : null}
      </legend>
      <div
        className={cx(
          "grid gap-2",
          columns === 2 && "sm:grid-cols-2",
          columns === 3 && "sm:grid-cols-3",
        )}
      >
        {options.map((option) => {
          const id = `${name}-${option.value || "none"}`;
          const checked = value === option.value;
          return (
            <label
              key={id}
              htmlFor={id}
              className={cx(
                "flex min-h-14 cursor-pointer items-center gap-4 border px-4 py-3 text-base transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-pink",
                checked ? "border-white bg-white text-plum" : "border-line text-white hover:border-slate",
              )}
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={cx("h-3 w-3 shrink-0 border", checked ? "border-plum bg-plum" : "border-slate")}
              />
              {option.label}
            </label>
          );
        })}
      </div>
      {hint ? (
        <p id={hintId} className="text-sm leading-relaxed text-slate-light">
          {hint}
        </p>
      ) : null}
      {error ? <FieldError id={errorId!}>{error}</FieldError> : null}
    </fieldset>
  );
}

export function Checkbox({
  id,
  checked,
  onChange,
  error,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  children: ReactNode;
}) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="grid gap-2">
      <label
        htmlFor={id}
        className="flex cursor-pointer items-start gap-4 text-base leading-relaxed text-white has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-pink"
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={cx(
            "mt-1 flex h-5 w-5 shrink-0 items-center justify-center border transition-colors",
            checked ? "border-white bg-white" : error ? "border-pink" : "border-slate",
          )}
        >
          {checked ? (
            <svg viewBox="0 0 12 10" className="h-2.5 w-3 text-plum" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 5l3.5 3.5L11 1" />
            </svg>
          ) : null}
        </span>
        <span>{children}</span>
      </label>
      {error ? <FieldError id={errorId!}>{error}</FieldError> : null}
    </div>
  );
}
