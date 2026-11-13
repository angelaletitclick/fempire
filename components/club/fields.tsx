import type { ReactNode } from "react";
import { TextArea, TextInput } from "@/components/ui/form";
import { cx } from "@/lib/cx";

/**
 * Unkontrollierte Formularfelder für Backend und Mitgliederbereich (defaultValue statt State).
 * Gleiche Optik wie im Bewerbungsformular.
 */

function Label({ htmlFor, label, optional }: { htmlFor: string; label: string; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="flex items-baseline justify-between gap-4 text-sm font-medium text-white">
      {label}
      {optional ? <span className="label text-[0.625rem]">optional</span> : null}
    </label>
  );
}

function Hint({ id, children }: { id: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} className="text-sm leading-relaxed text-slate-light">
      {children}
    </p>
  );
}

export function TextField({
  name,
  label,
  hint,
  optional,
  className,
  ...props
}: {
  name: string;
  label: string;
  hint?: string;
  optional?: boolean;
  className?: string;
} & Omit<React.ComponentProps<"input">, "name">) {
  const id = `f-${name}`;
  return (
    <div className={cx("grid gap-2", className)}>
      <Label htmlFor={id} label={label} optional={optional} />
      <TextInput id={id} name={name} required={!optional} aria-describedby={hint ? `${id}-hint` : undefined} {...props} />
      <Hint id={`${id}-hint`}>{hint}</Hint>
    </div>
  );
}

export function TextAreaField({
  name,
  label,
  hint,
  optional,
  className,
  ...props
}: {
  name: string;
  label: string;
  hint?: string;
  optional?: boolean;
  className?: string;
} & Omit<React.ComponentProps<"textarea">, "name">) {
  const id = `f-${name}`;
  return (
    <div className={cx("grid gap-2", className)}>
      <Label htmlFor={id} label={label} optional={optional} />
      <TextArea id={id} name={name} required={!optional} aria-describedby={hint ? `${id}-hint` : undefined} {...props} />
      <Hint id={`${id}-hint`}>{hint}</Hint>
    </div>
  );
}

export function SelectField({
  name,
  label,
  options,
  defaultValue,
  hint,
  className,
  emptyLabel,
}: {
  name: string;
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  defaultValue?: string;
  hint?: string;
  className?: string;
  /** Zusätzliche leere Auswahl, z. B. "Keine" */
  emptyLabel?: string;
}) {
  const id = `f-${name}`;
  return (
    <div className={cx("grid gap-2", className)}>
      <Label htmlFor={id} label={label} />
      <div className="relative">
        <select
          id={id}
          name={name}
          defaultValue={defaultValue ?? ""}
          className="h-14 w-full appearance-none border border-line bg-plum px-4 pr-12 text-base text-white transition-colors hover:border-slate focus:border-white focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink"
        >
          {emptyLabel !== undefined ? <option value="">{emptyLabel}</option> : null}
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
      <Hint id={`${id}-hint`}>{hint}</Hint>
    </div>
  );
}

/** Native Checkbox, auch mehrfach mit gleichem Namen (Mehrfachauswahl) */
export function CheckField({
  name,
  value = "on",
  label,
  defaultChecked,
  id,
}: {
  name: string;
  value?: string;
  label: ReactNode;
  defaultChecked?: boolean;
  id?: string;
}) {
  const fieldId = id ?? `f-${name}-${value}`;
  return (
    <label
      htmlFor={fieldId}
      className="group flex min-h-11 cursor-pointer items-center gap-3 text-base text-white has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-pink"
    >
      <input
        id={fieldId}
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className="flex h-5 w-5 shrink-0 items-center justify-center border border-slate transition-colors group-has-[:checked]:border-white group-has-[:checked]:bg-white"
      >
        <svg viewBox="0 0 12 10" className="h-2.5 w-3 text-plum opacity-0 group-has-[:checked]:opacity-100" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 5l3.5 3.5L11 1" />
        </svg>
      </span>
      <span>{label}</span>
    </label>
  );
}

export function Fieldset({ legend, children, className }: { legend: string; children: ReactNode; className?: string }) {
  return (
    <fieldset className={cx("grid gap-2", className)}>
      <legend className="mb-2 text-sm font-medium text-white">{legend}</legend>
      {children}
    </fieldset>
  );
}
