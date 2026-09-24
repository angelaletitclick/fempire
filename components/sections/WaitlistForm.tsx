"use client";

import Link from "next/link";
import { useActionState } from "react";
import { joinWaitlist, type WaitlistState } from "@/app/(site)/warteliste/actions";
import { closing } from "@/content/landing";
import { Button } from "@/components/ui/Button";
import { Field, Select, TextInput } from "@/components/ui/form";
import { Reveal } from "@/components/ui/Reveal";
import { HONEYPOT } from "@/lib/validation/application";
import { waitlistCityOptions } from "@/lib/validation/waitlist";

const t = closing.waitlist;

export function WaitlistForm() {
  const [state, action, pending] = useActionState<WaitlistState, FormData>(joinWaitlist, { status: "idle" });
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <Reveal className="mt-3 grid gap-8 border border-line p-6 sm:p-10 lg:grid-cols-12 lg:gap-10 lg:p-16">
      <div className="lg:col-span-5">
        <h3 className="headline text-2xl md:text-3xl">{t.title}</h3>
        <p className="mt-4 text-base leading-relaxed text-slate-light">{t.body}</p>
      </div>

      <div className="lg:col-span-7">
        {state.status === "success" ? (
          <p role="status" className="card flex items-start gap-3 p-5 text-base leading-relaxed text-white">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 bg-white" />
            {t.success}
          </p>
        ) : (
          <form action={action} noValidate className="grid gap-5">
            <div className="grid gap-5 sm:grid-cols-[1fr_12rem]">
              <Field id="waitlist-email" label={t.emailLabel} error={fieldErrors?.email}>
                {(describedBy) => (
                  <TextInput
                    id="waitlist-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    aria-invalid={fieldErrors?.email ? true : undefined}
                    aria-describedby={describedBy}
                  />
                )}
              </Field>
              <Field id="waitlist-city" label={t.cityLabel} error={fieldErrors?.city}>
                {(describedBy) => (
                  <Select
                    id="waitlist-city"
                    name="city"
                    defaultValue=""
                    options={waitlistCityOptions}
                    placeholder="Wählen"
                    required
                    aria-invalid={fieldErrors?.city ? true : undefined}
                    aria-describedby={describedBy}
                  />
                )}
              </Field>
            </div>

            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor={`waitlist-${HONEYPOT}`}>Firmenwebsite</label>
              <input id={`waitlist-${HONEYPOT}`} name={HONEYPOT} type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <p className="text-sm leading-relaxed text-slate-light">
              {t.doiNote} {t.privacyNote}{" "}
              <Link href="/datenschutz" className="underline underline-offset-4 hover:text-white">
                {t.privacyLinkLabel}
              </Link>
              .
            </p>

            {state.status === "error" && !state.fieldErrors ? (
              <p role="alert" className="border border-pink px-4 py-3 text-sm text-white">
                {state.message}
              </p>
            ) : null}

            <div>
              <Button type="submit" variant="outline" disabled={pending} className="w-full sm:w-auto">
                {pending ? "Wird gesendet" : t.submit}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Reveal>
  );
}
