import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm } from "@/components/club/ActionForm";
import { CheckField, SelectField, TextAreaField, TextField } from "@/components/club/fields";
import { Marked } from "@/components/ui/Marked";
import { SectionLabel } from "@/components/ui/Section";
import { schnuppern } from "@/content/schnuppern";
import { trialEvents } from "@/lib/events";
import { formatLong, formatTime } from "@/lib/time";
import { HONEYPOT } from "@/lib/validation/application";
import { requestTrial } from "./actions";

export const metadata: Metadata = {
  title: schnuppern.meta.title,
  description: schnuppern.meta.description,
  alternates: { canonical: "/schnuppern" },
};

export default async function SchnuppernPage({ searchParams }: PageProps<"/schnuppern">) {
  const { termin } = await searchParams;
  const events = await trialEvents();
  const t = schnuppern;
  const f = t.fields;
  const preselected = typeof termin === "string" && events.some((event) => event.id === termin) ? termin : events[0]?.id;

  return (
    <div className="container-site py-section">
      <SectionLabel index="·" label={t.label} />
      <h1 className="headline mt-6 max-w-[20ch] text-[2.25rem] leading-[1.1] sm:text-5xl lg:text-6xl">
        <Marked text={t.headline} />
      </h1>
      <p className="prose-width mt-6 text-lg leading-relaxed text-slate-light">{t.intro}</p>
      <p className="mt-3 text-sm text-slate-light">
        {t.priceNote}{" "}
        <Link href="/mitgliedsbeitrag" className="text-white underline underline-offset-4">
          {t.priceLink}
        </Link>
        .
      </p>

      {events.length === 0 ? (
        <p className="mt-12 max-w-2xl border border-line p-6 text-lg text-slate-light">{t.empty}</p>
      ) : (
        <div className="mt-12 max-w-2xl">
          <ActionForm action={requestTrial} submitLabel={t.submit} pendingLabel="Wird gesendet" resetOnSuccess>
            <SelectField
              name="eventId"
              label={f.event}
              defaultValue={preselected}
              options={events.map((event) => ({
                value: event.id,
                label: `${formatLong(event.starts_at)}, ${formatTime(event.starts_at)} Uhr · ${event.topic ? `${event.title}, Thema: ${event.topic}` : event.title}`,
              }))}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField name="name" label={f.name} autoComplete="name" maxLength={120} />
              <TextField name="email" label={f.email} type="email" inputMode="email" autoComplete="email" maxLength={200} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField name="phone" label={f.phone} type="tel" autoComplete="tel" optional maxLength={40} />
              <TextField name="company" label={f.company} autoComplete="organization" optional maxLength={160} />
            </div>
            <TextAreaField name="message" label={f.message} optional rows={4} maxLength={2000} />

            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor={`trial-${HONEYPOT}`}>Firmenwebsite</label>
              <input id={`trial-${HONEYPOT}`} name={HONEYPOT} type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <CheckField
              name="privacy"
              label={
                <>
                  {t.privacy}{" "}
                  <Link href="/datenschutz" className="underline underline-offset-4">
                    {t.privacyLink}
                  </Link>
                  .
                </>
              }
            />
          </ActionForm>
        </div>
      )}
    </div>
  );
}
