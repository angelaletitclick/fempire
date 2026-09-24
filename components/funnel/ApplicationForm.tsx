"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { submitApplication, type ApplicationState } from "@/app/bewerbung/actions";
import { OTHER_CITY } from "@/content/cities";
import { funnel } from "@/content/funnel";
import { Arrow } from "@/components/ui/Button";
import { Checkbox, ChoiceGroup, Field, Select, TextArea, TextInput } from "@/components/ui/form";
import { Marked } from "@/components/ui/Marked";
import { cx } from "@/lib/cx";
import {
  cityOptions,
  emptyDraft,
  HONEYPOT,
  pathForStage,
  schemaForStep,
  stepIds,
  toFieldErrors,
  type ApplicationDraft,
  type FieldErrors,
  type StepId,
} from "@/lib/validation/application";

/** Version im Schlüssel erhöhen, wenn sich die Felder grundlegend ändern */
export const DRAFT_KEY = "fempire-bewerbung-v2";

const { fields, options, nav } = funnel;

function loadDraft(): { draft: ApplicationDraft; step: number } | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { draft?: Partial<ApplicationDraft>; step?: number };
    // Einwilligung nie aus dem Zwischenstand übernehmen, sie muss frisch gegeben werden
    return {
      draft: { ...emptyDraft, ...parsed.draft, privacy: false },
      step: Math.min(Math.max(parsed.step ?? 0, 0), stepIds.length - 1),
    };
  } catch {
    return null;
  }
}

function saveDraft(draft: ApplicationDraft, step: number) {
  try {
    // Einwilligung wird nicht gespeichert
    const rest: Partial<ApplicationDraft> = { ...draft };
    delete rest.privacy;
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ draft: rest, step }));
  } catch {
    // Privater Modus oder Speicher voll: Formular funktioniert trotzdem
  }
}

/** Titel eines Schritts, abhängig vom Pfad (Schritt 3 heißt bei FOUNDATIONS „Dein Vorhaben“) */
function stepTitle(index: number, stage: string): string {
  const step = funnel.steps[index];
  if (!step) return "";
  if (pathForStage(stage) === "foundations" && "titleFoundations" in step && step.titleFoundations) {
    return step.titleFoundations;
  }
  return step.title;
}

export function ApplicationForm() {
  const [draft, setDraft] = useState<ApplicationDraft>(emptyDraft);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [restored, setRestored] = useState(false);
  const [state, formAction, pending] = useActionState<ApplicationState, FormData>(submitApplication, {
    status: "idle",
  });
  const startedAt = useRef(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hydrated = useRef(false);
  const [handledState, setHandledState] = useState(state);

  // Zwischenstand laden. localStorage gibt es erst im Browser, deshalb nach dem Mounten
  // statt im Initialwert (sonst weicht das Server-HTML vom Client ab).
  useEffect(() => {
    startedAt.current = Date.now();
    const saved = loadDraft();
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- einmaliger Abgleich mit localStorage
      setDraft(saved.draft);
      setStep(saved.step);
      setRestored(saved.step > 0 || Object.values(saved.draft).some((value) => value !== "" && value !== false));
    }
    hydrated.current = true;
  }, []);

  // Zwischenstand sichern
  useEffect(() => {
    if (hydrated.current) saveDraft(draft, step);
  }, [draft, step]);

  // Serverfehler: zum betroffenen Schritt springen (Zustand während des Renderns angleichen)
  if (state !== handledState) {
    setHandledState(state);
    if (state.status === "error") {
      if (state.fieldErrors) setErrors(state.fieldErrors);
      if (state.step) setStep(stepIds.indexOf(state.step));
    }
  }

  const stepId = stepIds[step] as StepId;
  const isLast = step === stepIds.length - 1;
  const foundations = pathForStage(draft.stage) === "foundations";

  function update<K extends keyof ApplicationDraft>(key: K, value: ApplicationDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function goTo(index: number) {
    setStep(index);
    setErrors({});
    window.scrollTo({ top: 0 });
    // Fokus auf die Schritt-Überschrift, damit Screenreader den Wechsel ansagen
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function validateStep(): boolean {
    const result = schemaForStep(stepId, draft.stage).safeParse(draft);
    if (result.success) return true;
    setErrors(toFieldErrors(result.error));
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
    });
    return false;
  }

  function next() {
    if (validateStep()) goTo(step + 1);
  }

  function submit() {
    if (!validateStep()) return;
    const formData = new FormData();
    for (const [key, value] of Object.entries(draft)) {
      if (key === "privacy") {
        if (value) formData.set(key, "on");
      } else {
        formData.set(key, String(value));
      }
    }
    formData.set("startedAt", String(startedAt.current));
    const honeypot = document.querySelector<HTMLInputElement>(`input[name="${HONEYPOT}"]`);
    formData.set(HONEYPOT, honeypot?.value ?? "");
    startTransition(() => formAction(formData));
  }

  const input = (key: Exclude<keyof ApplicationDraft, "privacy">) => ({
    id: key,
    name: key,
    value: draft[key],
    "aria-invalid": errors[key] ? true : undefined,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      update(key, event.target.value),
  });

  const progress = ((step + 1) / stepIds.length) * 100;
  const currentTitle = stepTitle(step, draft.stage);

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Kopf: Schließen, Schritt-Zähler, Fortschritt */}
      <header className="sticky top-0 z-30 border-b border-line bg-onyx/95 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between gap-4 px-[var(--gutter)]">
          <p className="label text-white" aria-live="polite">
            {nav.stepOf(step + 1, stepIds.length)}
            <span className="text-slate-light"> · {currentTitle}</span>
          </p>
          <Link
            href={funnel.exit.href}
            className="-mr-2 flex h-11 w-11 items-center justify-center text-slate-light hover:text-white"
          >
            <span className="sr-only">{funnel.exit.label}</span>
            <svg aria-hidden="true" viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </Link>
        </div>
        <div
          className="h-0.5 bg-line"
          role="progressbar"
          aria-label="Fortschritt"
          aria-valuemin={1}
          aria-valuemax={stepIds.length}
          aria-valuenow={step + 1}
        >
          <div className="h-full bg-white transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (isLast) submit();
          else next();
        }}
        className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-[var(--gutter)]"
      >
        <div className="flex-1 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-8 md:pt-14">
          {step === 0 ? (
            <div className="mb-10">
              <h1 className="headline text-[2.25rem] leading-[1.15] md:text-5xl">
                <Marked text={funnel.intro.headline} />
              </h1>
              <p className="mt-5 text-base leading-relaxed text-slate-light">{funnel.intro.body}</p>
            </div>
          ) : (
            <h1 className="sr-only">{funnel.meta.title}</h1>
          )}
          {restored ? <p className="card mb-8 px-4 py-3 text-sm text-white">{funnel.restored}</p> : null}

          <h2
            ref={headingRef}
            tabIndex={-1}
            className={cx("headline outline-none", step === 0 ? "text-xl" : "text-[2rem] leading-[1.1] md:text-4xl")}
          >
            {currentTitle}
          </h2>

          <div className="mt-8 grid gap-7">
            {stepId === "person" ? (
              <>
                <Field id="name" label={fields.name.label} error={errors.name}>
                  {(describedBy) => <TextInput {...input("name")} autoComplete="name" aria-describedby={describedBy} />}
                </Field>
                <Field id="email" label={fields.email.label} error={errors.email}>
                  {(describedBy) => (
                    <TextInput {...input("email")} type="email" inputMode="email" autoComplete="email" aria-describedby={describedBy} />
                  )}
                </Field>
                <Field id="phone" label={fields.phone.label} hint={fields.phone.hint} error={errors.phone} optional={funnel.optional}>
                  {(describedBy) => (
                    <TextInput {...input("phone")} type="tel" inputMode="tel" autoComplete="tel" aria-describedby={describedBy} />
                  )}
                </Field>
                <Field id="city" label={fields.city.label} hint={fields.city.hint} error={errors.city}>
                  {(describedBy) => (
                    <Select {...input("city")} options={cityOptions} placeholder="Bitte wählen" aria-describedby={describedBy} />
                  )}
                </Field>
                {draft.city === OTHER_CITY ? (
                  <Field id="cityOther" label={fields.cityOther.label} error={errors.cityOther}>
                    {(describedBy) => (
                      <TextInput {...input("cityOther")} autoComplete="address-level2" aria-describedby={describedBy} />
                    )}
                  </Field>
                ) : null}
                <Field id="profileUrl" label={fields.profileUrl.label} hint={fields.profileUrl.hint} error={errors.profileUrl}>
                  {(describedBy) => (
                    <TextInput {...input("profileUrl")} inputMode="url" autoComplete="url" placeholder="linkedin.com/in/…" aria-describedby={describedBy} />
                  )}
                </Field>
              </>
            ) : null}

            {stepId === "situation" ? (
              <>
                {/* Die Bewerberin beschreibt ihre Situation, sie wählt keinen Kreis */}
                <ChoiceGroup
                  name="stage"
                  legend={fields.stage.label}
                  error={errors.stage}
                  options={options.stage}
                  value={draft.stage}
                  onChange={(value) => update("stage", value)}
                />

                {draft.stage && !foundations ? (
                  <>
                    <Field id="company" label={fields.company.label} error={errors.company}>
                      {(describedBy) => <TextInput {...input("company")} autoComplete="organization" aria-describedby={describedBy} />}
                    </Field>
                    <Field id="legalForm" label={fields.legalForm.label} error={errors.legalForm}>
                      {(describedBy) => (
                        <Select {...input("legalForm")} options={options.legalForm} placeholder="Bitte wählen" aria-describedby={describedBy} />
                      )}
                    </Field>
                    <Field id="role" label={fields.role.label} error={errors.role}>
                      {(describedBy) => (
                        <Select {...input("role")} options={options.role} placeholder="Bitte wählen" aria-describedby={describedBy} />
                      )}
                    </Field>
                    <div className="grid gap-7 sm:grid-cols-2">
                      <Field id="foundedYear" label={fields.foundedYear.label} error={errors.foundedYear}>
                        {(describedBy) => (
                          <TextInput {...input("foundedYear")} inputMode="numeric" maxLength={4} placeholder="2019" aria-describedby={describedBy} />
                        )}
                      </Field>
                      <Field id="employees" label={fields.employees.label} error={errors.employees}>
                        {(describedBy) => (
                          <Select {...input("employees")} options={options.employees} placeholder="Bitte wählen" aria-describedby={describedBy} />
                        )}
                      </Field>
                    </div>
                    <Field id="industry" label={fields.industry.label} error={errors.industry}>
                      {(describedBy) => <TextInput {...input("industry")} aria-describedby={describedBy} />}
                    </Field>
                  </>
                ) : null}

                {foundations ? (
                  <>
                    <Field id="industry" label={fields.industry.labelFoundations} error={errors.industry}>
                      {(describedBy) => <TextInput {...input("industry")} aria-describedby={describedBy} />}
                    </Field>
                    <Field
                      id="currentActivity"
                      label={fields.currentActivity.label}
                      hint={fields.currentActivity.hint}
                      error={errors.currentActivity}
                    >
                      {(describedBy) => <TextInput {...input("currentActivity")} aria-describedby={describedBy} />}
                    </Field>
                    <ChoiceGroup
                      name="foundingTimeline"
                      legend={fields.foundingTimeline.label}
                      error={errors.foundingTimeline}
                      options={options.foundingTimeline}
                      value={draft.foundingTimeline}
                      onChange={(value) => update("foundingTimeline", value)}
                      columns={2}
                    />
                  </>
                ) : null}
              </>
            ) : null}

            {stepId === "plan" && !foundations ? (
              <>
                <ChoiceGroup
                  name="revenueRange"
                  legend={fields.revenueRange.label}
                  hint={fields.revenueRange.hint}
                  error={errors.revenueRange}
                  options={options.revenueRange}
                  value={draft.revenueRange}
                  onChange={(value) => update("revenueRange", value)}
                  columns={2}
                />
                <Field id="goal12m" label={fields.goal12m.label} hint={fields.goal12m.hint} error={errors.goal12m}>
                  {(describedBy) => <TextArea {...input("goal12m")} aria-describedby={describedBy} />}
                </Field>
                <Field id="bottleneck" label={fields.bottleneck.label} hint={fields.bottleneck.hint} error={errors.bottleneck}>
                  {(describedBy) => <TextArea {...input("bottleneck")} aria-describedby={describedBy} />}
                </Field>
              </>
            ) : null}

            {stepId === "plan" && foundations ? (
              <>
                <Field id="idea" label={fields.idea.label} hint={fields.idea.hint} error={errors.idea}>
                  {(describedBy) => <TextArea {...input("idea")} aria-describedby={describedBy} />}
                </Field>
                <Field
                  id="goal12m"
                  label={fields.goal12m.labelFoundations}
                  hint={fields.goal12m.hintFoundations}
                  error={errors.goal12m}
                >
                  {(describedBy) => <TextArea {...input("goal12m")} aria-describedby={describedBy} />}
                </Field>
                <Field id="bottleneck" label={fields.bottleneck.labelFoundations} error={errors.bottleneck}>
                  {(describedBy) => <TextArea {...input("bottleneck")} aria-describedby={describedBy} />}
                </Field>
              </>
            ) : null}

            {stepId === "passung" ? (
              <>
                <Field id="motivation" label={fields.motivation.label} error={errors.motivation}>
                  {(describedBy) => <TextArea {...input("motivation")} aria-describedby={describedBy} />}
                </Field>
                <Field id="contribution" label={fields.contribution.label} hint={fields.contribution.hint} error={errors.contribution}>
                  {(describedBy) => <TextArea {...input("contribution")} aria-describedby={describedBy} />}
                </Field>
                <ChoiceGroup
                  name="hasChildren"
                  legend={fields.hasChildren.label}
                  hint={fields.hasChildren.hint}
                  optional={funnel.optional}
                  options={options.hasChildren}
                  value={draft.hasChildren}
                  onChange={(value) => update("hasChildren", value)}
                  columns={3}
                />
                <ChoiceGroup
                  name="timeCommitment"
                  legend={fields.timeCommitment.label}
                  error={errors.timeCommitment}
                  options={options.timeCommitment}
                  value={draft.timeCommitment}
                  onChange={(value) => update("timeCommitment", value)}
                />
              </>
            ) : null}

            {stepId === "bestaetigung" ? (
              <>
                <Summary draft={draft} onEdit={goTo} />
                <Checkbox
                  id="privacy"
                  checked={draft.privacy}
                  onChange={(checked) => update("privacy", checked)}
                  error={errors.privacy}
                >
                  {fields.privacy.label}{" "}
                  <Link href="/datenschutz" target="_blank" className="underline underline-offset-4 hover:text-slate-light">
                    {fields.privacy.linkLabel}
                  </Link>
                </Checkbox>
              </>
            ) : null}
          </div>

          {/* Honeypot: für Menschen unsichtbar und nicht per Tab erreichbar */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor={HONEYPOT}>Firmenwebsite</label>
            <input id={HONEYPOT} name={HONEYPOT} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
          </div>
        </div>

        {/* Fixierte Aktionsleiste unten, wie in einer App */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-onyx/95 pb-[env(safe-area-inset-bottom)]">
          {/* Fehler beim Absenden direkt über den Buttons, wo der Blick gerade ist */}
          {state.status === "error" && !state.fieldErrors ? (
            <p role="alert" className="mx-auto w-full max-w-2xl px-[var(--gutter)] pt-3">
              <span className="flex items-start gap-3 border border-pink px-4 py-3 text-sm text-white">
                <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-pink" />
                {state.message}
              </span>
            </p>
          ) : null}
          <div className="mx-auto flex h-20 w-full max-w-2xl items-center gap-3 px-[var(--gutter)]">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                className="label flex h-14 items-center px-2 text-white hover:text-slate-light"
              >
                {nav.back}
              </button>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className={cx(
                "group ml-auto inline-flex h-14 flex-1 items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] transition-colors sm:flex-none sm:px-10",
                isLast ? "bg-pink text-onyx hover:bg-pink-deep hover:text-white" : "bg-white text-onyx hover:bg-pink",
                pending && "opacity-60",
              )}
            >
              {pending ? nav.submitting : isLast ? nav.submit : nav.next}
              {!pending ? <Arrow /> : null}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Summary({ draft, onEdit }: { draft: ApplicationDraft; onEdit: (step: number) => void }) {
  const label = (list: ReadonlyArray<{ value: string; label: string }>, value: string) =>
    list.find((option) => option.value === value)?.label ?? value;
  const foundations = pathForStage(draft.stage) === "foundations";
  const city = draft.city === OTHER_CITY ? draft.cityOther : label(cityOptions, draft.city);

  const groups: Array<{ step: number; rows: Array<[string, string]> }> = [
    {
      step: 0,
      rows: [
        [fields.name.label, draft.name],
        [fields.email.label, draft.email],
        [fields.phone.label, draft.phone || "–"],
        [fields.city.label, city],
        [fields.profileUrl.label, draft.profileUrl],
      ],
    },
    {
      step: 1,
      rows: foundations
        ? [
            [fields.stage.label, label(options.stage, draft.stage)],
            [fields.industry.labelFoundations, draft.industry],
            [fields.currentActivity.label, draft.currentActivity],
            [fields.foundingTimeline.label, label(options.foundingTimeline, draft.foundingTimeline)],
          ]
        : [
            [fields.stage.label, label(options.stage, draft.stage)],
            [fields.company.label, draft.company],
            [fields.legalForm.label, label(options.legalForm, draft.legalForm)],
            [fields.role.label, label(options.role, draft.role)],
            [fields.foundedYear.label, draft.foundedYear],
            [fields.employees.label, label(options.employees, draft.employees)],
            [fields.industry.label, draft.industry],
          ],
    },
    {
      step: 2,
      rows: foundations
        ? [
            [fields.idea.label, draft.idea],
            [fields.goal12m.labelFoundations, draft.goal12m],
            [fields.bottleneck.labelFoundations, draft.bottleneck],
          ]
        : [
            [fields.revenueRange.label, label(options.revenueRange, draft.revenueRange)],
            [fields.goal12m.label, draft.goal12m],
            [fields.bottleneck.label, draft.bottleneck],
          ],
    },
    {
      step: 3,
      rows: [
        [fields.motivation.label, draft.motivation],
        [fields.contribution.label, draft.contribution],
        [fields.hasChildren.label, label(options.hasChildren, draft.hasChildren)],
        [fields.timeCommitment.label, label(options.timeCommitment, draft.timeCommitment)],
      ],
    },
  ];

  return (
    <div className="grid gap-3">
      <p className="text-base leading-relaxed text-slate-light">{funnel.summary.body}</p>
      {groups.map((group) => (
        <section key={group.step} className="card p-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="label text-white">{stepTitle(group.step, draft.stage)}</h3>
            <button
              type="button"
              onClick={() => onEdit(group.step)}
              className="label underline underline-offset-4 hover:text-white"
            >
              Ändern
            </button>
          </div>
          <dl className="mt-4 grid gap-3">
            {group.rows.map(([term, value]) => (
              <div key={term}>
                <dt className="text-xs text-slate-light">{term}</dt>
                <dd className="mt-0.5 line-clamp-3 text-sm text-white">{value || "–"}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
