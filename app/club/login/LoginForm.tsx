"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/form";
import { requestLoginLink, type LoginState } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(requestLoginLink, { status: "idle" });

  if (state.status === "sent") {
    return (
      <p role="status" className="card p-5 text-base leading-relaxed text-white">
        Wenn die Adresse zu einem Mitglied gehört, ist der Anmeldelink unterwegs. Schau in dein Postfach.
      </p>
    );
  }

  return (
    <form action={action} className="grid gap-5">
      <Field id="club-email" label="E-Mail" error={state.status === "error" ? state.message : undefined}>
        {(describedBy) => (
          <TextInput
            id="club-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            aria-invalid={state.status === "error" ? true : undefined}
            aria-describedby={describedBy}
          />
        )}
      </Field>
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Wird gesendet" : "Anmeldelink senden"}
      </Button>
    </form>
  );
}
