"use client";

import { useActionState, useEffect, useRef, startTransition, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { cx } from "@/lib/cx";

export type FormState = { status: "idle" } | { status: "ok"; message: string } | { status: "error"; message: string };

export const idle: FormState = { status: "idle" };

/**
 * Formular für Server Actions im Mitgliederbereich und Backend.
 * Wird bewusst per onSubmit abgeschickt: So bleiben Eingaben bei einem Fehler stehen
 * (ein <form action> würde das Formular danach zurücksetzen).
 */
export function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel = "Wird gespeichert",
  className,
  variant = "primary",
  resetOnSuccess = false,
  footer,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  children: ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  className?: string;
  variant?: "primary" | "outline";
  resetOnSuccess?: boolean;
  footer?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, idle);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (resetOnSuccess && state.status === "ok") formRef.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form
      ref={formRef}
      className={cx("grid gap-5", className)}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => formAction(data));
      }}
    >
      {children}
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant={variant} disabled={pending}>
          {pending ? pendingLabel : submitLabel}
        </Button>
        {footer}
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (state.status === "idle") return null;
  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className="flex items-start gap-2 text-sm font-medium text-white"
    >
      <span aria-hidden="true" className={cx("mt-1.5 h-1.5 w-1.5 shrink-0", state.status === "error" ? "bg-pink" : "bg-white")} />
      {state.message}
    </p>
  );
}
