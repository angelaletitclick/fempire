import { ActionForm } from "@/components/club/ActionForm";
import { CheckField, Fieldset, SelectField, TextAreaField, TextField } from "@/components/club/fields";
import { cities } from "@/content/cities";
import { eventFormats, eventStatuses, tiers } from "@/content/club";
import { membership } from "@/content/membership";
import type { ClubEvent } from "@/lib/events";
import { toBerlinLocal } from "@/lib/time";
import { saveEvent } from "./actions";

export const emptyEvent: ClubEvent = {
  id: "",
  title: "",
  format: "workshop",
  topic: null,
  description: null,
  starts_at: "",
  ends_at: null,
  city_slug: "osnabrueck",
  location: null,
  audience: ["founder", "leader", "mastermind"],
  price_cents: null,
  trial_price_cents: null,
  capacity: null,
  status: "draft",
  cancel_note: null,
};

const euro = (cents: number | null) => (cents === null ? "" : (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2).replace(".", ","));

export function EventForm({ event }: { event: ClubEvent }) {
  return (
    <ActionForm action={saveEvent} submitLabel="Speichern" className="mt-10">
      <input type="hidden" name="id" value={event.id} />
      <div className="grid gap-5 md:grid-cols-2">
        <TextField name="title" label="Titel" defaultValue={event.title} maxLength={160} placeholder="z. B. Leader Circle Workshop" />
        <SelectField name="format" label="Format" options={eventFormats} defaultValue={event.format} />
      </div>
      <TextField name="topic" label="Thema" defaultValue={event.topic ?? ""} optional maxLength={160} placeholder="z. B. KI" />
      <div className="grid gap-5 md:grid-cols-2">
        <TextField name="startsAt" label="Beginn" type="datetime-local" defaultValue={toBerlinLocal(event.starts_at)} />
        <TextField name="endsAt" label="Ende" type="datetime-local" defaultValue={toBerlinLocal(event.ends_at)} optional />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <SelectField name="citySlug" label="Stadt" options={cities.map((city) => ({ value: city.slug, label: city.name }))} defaultValue={event.city_slug} />
        <TextField name="location" label="Ort" hint="Nur für Mitglieder sichtbar." defaultValue={event.location ?? ""} optional maxLength={300} />
      </div>
      <TextAreaField name="description" label="Beschreibung" defaultValue={event.description ?? ""} optional rows={5} maxLength={5000} />

      <Fieldset legend="Wer kann teilnehmen?" className="border-t border-line pt-6">
        <div className="grid gap-1 sm:grid-cols-2">
          {tiers.map((tier) => (
            <CheckField key={tier.value} name="audience" value={tier.value} label={tier.label} defaultChecked={event.audience.includes(tier.value)} />
          ))}
        </div>
      </Fieldset>

      <div className="grid gap-5 border-t border-line pt-6 md:grid-cols-3">
        <TextField
          name="price"
          label="Teilnahmebeitrag in €"
          hint="Leer = in der Mitgliedschaft enthalten."
          defaultValue={euro(event.price_cents)}
          optional
          inputMode="decimal"
        />
        <TextField name="capacity" label="Plätze" hint="Leer = unbegrenzt." defaultValue={event.capacity?.toString() ?? ""} optional inputMode="numeric" />
        <div className="grid content-start gap-2">
          <CheckField name="trial" label="Schnuppern möglich" defaultChecked={event.trial_price_cents !== null} />
          <TextField
            name="trialPrice"
            label="Schnupper-Beitrag in €"
            defaultValue={euro(event.trial_price_cents ?? membership.trial.priceCents)}
            optional
            inputMode="decimal"
          />
        </div>
      </div>

      <div className="grid gap-5 border-t border-line pt-6 md:grid-cols-2">
        <SelectField
          name="status"
          label="Status"
          options={eventStatuses}
          defaultValue={event.status}
          hint="Entwurf ist unsichtbar. Veröffentlicht erscheint auf der Website und im Mitgliederbereich. Abgesagt bleibt durchgestrichen sichtbar."
        />
        <TextField name="cancelNote" label="Hinweis bei Absage" defaultValue={event.cancel_note ?? ""} optional maxLength={500} placeholder="z. B. Ersatztermin folgt" />
      </div>
    </ActionForm>
  );
}
