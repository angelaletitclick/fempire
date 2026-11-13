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
  variant?: "primary" | "accent" | "outline";
} & ComponentProps<"button">) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={buttonClasses({ variant, size: "sm", className })}
      onClick={(event) => {
        if (confirm && !window.confirm(confirm)) event.preventDefault();
      }}
      {...props}
    >
      {children}
    </button>
  );
}
