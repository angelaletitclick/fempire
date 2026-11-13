"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { buttonClasses } from "@/components/ui/Button";

/**
 * Absende-Knopf für kleine Formulare (Freigeben, Löschen, Absagen).
 * Mit `confirm` fragt der Browser vorher nach, z. B. vor dem endgültigen Löschen.
 */
export function ConfirmButton({
  children,
  confirm,
  variant = "outline",
  className,
  ...props
}: {
  confirm?: string;
  /** "link": schlichter Text-Knopf wie ein Link, z. B. in Aktionszeilen */
  variant?: "primary" | "accent" | "outline" | "link";
} & ComponentProps<"button">) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={variant === "link" ? `label transition-colors hover:text-white disabled:opacity-50 ${className ?? ""}` : buttonClasses({ variant, size: "sm", className })}
      onClick={(event) => {
        if (confirm && !window.confirm(confirm)) event.preventDefault();
      }}
      {...props}
    >
      {children}
    </button>
  );
}
