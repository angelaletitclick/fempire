"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState, useTransition, type CSSProperties } from "react";
import { checkInviteCode, submitApplication, type ApplicationState, type CodeCheck } from "@/app/bewerbung/actions";
import { OTHER_CITY } from "@/content/cities";
import { funnel } from "@/content/funnel";
import { Arrow } from "@/components/ui/Button";
import { Checkbox, ChoiceGroup, Field, FieldError, Select, TextArea, TextInput } from "@/components/ui/form";
import { Marked } from "@/components/ui/Marked";
import { cx } from "@/lib/cx";
import {
  BOOLEAN_FIELDS,
  circleValues,
  cityOptions,
  emptyDraft,
  HONEYPOT,
  schemaForStep,
  stepsFor,
  stepTitle,
  toFieldErrors,
  usesCompany,
  type ApplicationDraft,
  type FieldErrors,
  type StepId,
} from "@/lib/validation/application";

/** Version im Schlüssel erhöhen, wenn sich die Felder grundlegend ändern */
export const DRAFT_KEY = "fempire-bewerbung-v3";

const { fields, options, nav } = funnel;

type TextKey = { [K in keyof ApplicationDraft]: ApplicationDraft[K] extends string ? K : never }[keyof ApplicationDraft];
type ValidCode = Extract<CodeCheck, { status: "ok" }>;

function loadDraft(): { draft: ApplicationDraft; step: StepId } | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { draft?: Partial<ApplicationDraft>; step?: StepId };
    // Einwilligung und Verbindlichkeit nie aus dem Zwischenstand übernehmen, sie müssen frisch gegeben werden
    return { draft: { ...emptyDraft, ...parsed.draft, privacy: false, commitment: false }, step: parsed.step ?? "kreis" };
  } catch {
    return null;
  }
}

function saveDraft(draft: ApplicationDraft, step: StepId) {
  try {
    const rest: Partial<ApplicationDraft> = { ...draft };
    delete rest.privacy;
    delete rest.commitment;
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ draft: rest, step }));
  } catch {
    // Privater Modus oder Speicher voll: Formular funktioniert trotzdem
  }
}

const tierStyle = (tier: string) => ({ "--tier": `var(--tier-${tier})`, "--tier-ink": `var(--tier-${tier}-ink)` }) as CSSProperties;

export function ApplicationForm({ initialCircle, initialCode }: { initialCircle?: string; initialCode?: string }) {
  const [draft, setDraft] = useState<ApplicationDraft>(emptyDraft);
  const [stepId, setStepId] = useState<StepId>("kreis");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [restored, setRestored] = useState(false);
  const [codeInfo, setCodeInfo] = useState<ValidCode | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [checking, startChecking] = useTransition();
  const [state, formAction, pending] = useActionState<ApplicationState, FormData>(submitApplication, { status: "idle" });
  const startedAt = useRef(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hydrated = useRef(false);
  const [handledState, setHandledState] = useState(state);

  const direct = Boolean(codeInfo?.skipApplication);
  const steps = stepsFor(direct);
  const stepIndex = Math.max(0, steps.indexOf(stepId));
  const isLast = stepIndex === steps.length - 1;
  const circle = draft.circle;

  function applyCode(value: string, keepErrors = false) {
    const code = value.trim();
    if (!code) return;
    startChecking(async () => {
      const result = await checkInviteCode(code);
      if (result.status === "ok") {
        setCodeInfo(result);
        setCodeError(null);
        setCodeInput(result.code);
        setDraft((current) => ({
          ...current,
          code: result.code,
          // Gilt der Code nur für einen Kreis, ist dieser gesetzt
          circle:
            result.tiers.length === 1 ? result.tiers[0]! : result.tiers.length && !result.tiers.includes(current.circle) ? "" : current.circle,
        }));
        if (!keepErrors) setErrors((current) => ({ ...current, code: undefined }));
      } else {
        setCodeInfo(null);
        setCodeError(result.message);
        setDraft((current) => ({ ...current, code: "" }));
      }
    });
  }

  function removeCode() {
    setCodeInfo(null);
    setCodeError(null);
    setCodeInput("");
    setDraft((current) => ({ ...current, code: "" }));
  }

  // Zwischenstand laden, Kreis und Code aus dem Link übernehmen. localStorage gibt es erst im Browser.
  useEffect(() => {
    startedAt.current = Date.now();
    const saved = loadDraft();
    const fromUrlCircle = initialCircle && (circleValues as string[]).includes(initialCircle) ? initialCircle : "";
    const base = saved?.draft ?? emptyDraft;
    const next = { ...base, circle: fromUrlCircle || base.circle };
    /* eslint-disable react-hooks/set-state-in-effect -- einmaliger Abgleich mit localStorage und Link */
    setDraft(next);
    if (saved && !fromUrlCircle) setStepId(saved.step);
    if (saved) setRestored(Object.values(saved.draft).some((value) => value !== "" && value !== false));
    const code = initialCode || base.code;
    if (code) {
      setCodeInput(code);
      applyCode(code, true);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- nur beim ersten Laden
  }, []);

  // Zwischenstand sichern
  useEffect(() => {
    if (hydrated.current) saveDraft(draft, stepId);
  }, [draft, stepId]);

  // Serverfehler: zum betroffenen Schritt springen (Zustand während des Renderns angleichen)
  if (state !== handledState) {
    setHandledState(state);
    if (state.status === "error") {
      if (state.fieldErrors) setErrors(state.fieldErrors);
      if (state.step) setStepId(state.step);
      if (state.step === "kreis" && state.fieldErrors?.code) {
        setCodeInfo(null);
        setCodeError(state.fieldErrors.code);
      }
    }
  }

  function update<K extends keyof ApplicationDraft>(key: K, value: ApplicationDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function goTo(next: StepId) {
    setStepId(next);
    setErrors({});
    window.scrollTo({ top: 0 });
    // Fokus auf die Schritt-Überschrift, damit Screenreader den Wechsel ansagen
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function validateStep(): boolean {
    const result = schemaForStep(stepId, circle, direct).safeParse(draft);
    if (stepId === "kreis" && codeInfo && codeInfo.tiers.length && !codeInfo.tiers.includes(circle)) {
      setErrors({ circle: funnel.code.wrongCircle.replace("{tiers}", codeInfo.tiersLabel) });
      return false;
    }
    if (result.success) return true;
    setErrors(toFieldErrors(result.error));
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
    });
    return false;
  }

  function next() {
    if (validateStep()) goTo(steps[stepIndex + 1]!);
  }

  function submit() {
    if (!validateStep()) return;
    const formData = new FormData();
    for (const [key, value] of Object.entries(draft)) {
      if ((BOOLEAN_FIELDS as readonly string[]).includes(key)) {
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

  const input = (key: TextKey) => ({
    id: key,
    name: key,
    value: draft[key],
    "aria-invalid": errors[key] ? true : undefined,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => update(key, event.target.value),
  });

  const progress = ((stepIndex + 1) / steps.length) * 100;
  const currentTitle = stepTitle(stepId, circle, direct);
  const selected = funnel.circles.find((entry) => entry.tier === circle);
  const company = usesCompany(circle);

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Kopf: Schließen, Schritt-Zähler, Fortschritt */}
      <header className="sticky top-0 z-30 border-b border-line bg-plum/95 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between gap-4 px-[var(--gutter)]">
          <p className="label text-white" aria-live="polite">
            {nav.stepOf(stepIndex + 1, steps.length)}
            <span className="text-slate-light"> · {selected && stepId !== "kreis" ? selected.name : currentTitle}</span>
          </p>
          <Link href={funnel.exit.href} className="-mr-2 flex h-11 w-11 items-center justify-center text-slate-light hover:text-white">
            <span className="sr-only">{funnel.exit.label}</span>
            <svg aria-hidden="true" viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </Link>
        </div>
        <div className="h-0.5 bg-line" role="progressbar" aria-label="Fortschritt" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={stepIndex + 1}>
          <div
            className="h-full transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%`, background: circle ? `var(--tier-${circle})` : "var(--white)" }}
          />
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
          {stepId === "kreis" ? (
            <div className="mb-10">
              <h1 className="headline text-[2.25rem] leading-[1.15] md:text-5xl">
                <Marked text={funnel.intro.headline} />
              </h1>
              <p className="mt-5 text-base leading-relaxed text-slate-light">{funnel.intro.body}</p>
            </div>
          ) : (
            <>
              <h1 className="sr-only">{funnel.meta.title}</h1>
              {selected ? (
                <p className="mb-6 flex flex-wrap items-center gap-3" style={tierStyle(selected.tier)}>
                  <span className="label bg-[var(--tier)] px-2.5 py-1 text-[0.625rem] text-[var(--tier-ink)]">{selected.name}</span>
                  {codeInfo ? <span className="label text-white">Code {codeInfo.code}</span> : null}
                </p>
              ) : null}
            </>
          )}
          {restored ? <p className="card mb-8 px-4 py-3 text-sm text-white">{funnel.restored}</p> : null}

          <h2
            ref={headingRef}
            tabIndex={-1}
            className={cx("headline outline-none", stepId === "kreis" ? "text-xl" : "text-[2rem] leading-[1.1] md:text-4xl")}
          >
            {currentTitle}
          </h2>

          <div className="mt-8 grid gap-7">
            {stepId === "kreis" ? (
              <>
                <fieldset className="grid gap-3" aria-invalid={errors.circle ? true : undefined} aria-describedby={errors.circle ? "circle-error" : undefined}>
                  <legend className="mb-2 text-sm font-medium text-white">{funnel.circleLegend}</legend>
                  {funnel.circles.map((entry) => {
                    const checked = circle === entry.tier;
                    const blocked = Boolean(codeInfo?.tiers.length && !codeInfo.tiers.includes(entry.tier));
                    return (
                      <label
                        key={entry.tier}
                        htmlFor={`circle-${entry.tier}`}
                        style={tierStyle(entry.tier)}
                        className={cx(
                          "relative flex cursor-pointer gap-4 border p-5 transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-pink",
                          checked ? "border-[var(--tier)] bg-surface" : "border-line hover:border-slate",
                          blocked && "pointer-events-none opacity-40",
                        )}
                      >
                        <input
                          id={`circle-${entry.tier}`}
                          type="radio"
                          name="circle"
                          value={entry.tier}
                          checked={checked}
                          disabled={blocked}
                          onChange={() => update("circle", entry.tier)}
                          className="sr-only"
                        />
                        <span aria-hidden="true" className="w-1 shrink-0 self-stretch bg-[var(--tier)]" />
                        <span className="grid flex-1 gap-1.5">
                          <span className="flex items-center justify-between gap-3">
                            <span className="headline text-lg">{entry.name}</span>
                            <span
                              aria-hidden="true"
                              className={cx("h-4 w-4 shrink-0 border", checked ? "border-[var(--tier)] bg-[var(--tier)]" : "border-slate")}
                            />
                          </span>
                          <span className="text-sm leading-relaxed text-slate-light">{entry.for}</span>
                          {checked ? (
                            <span className="mt-2 border-t border-line pt-3 text-sm leading-relaxed text-white">
                              <span className="label mr-2 text-[var(--tier)]">{funnel.circleCommitmentLabel}</span>
                              {entry.commitment}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    );
                  })}
                  {errors.circle ? <FieldError id="circle-error">{errors.circle}</FieldError> : null}
                </fieldset>

                <p className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-light">
                  <span>{funnel.circleHint}</span>
                  <Link href={funnel.trialLink.href} className="text-white underline underline-offset-4 hover:text-slate-light">
                    {funnel.trialLink.label}
                  </Link>
                  <Link href={funnel.circlesLink.href} className="text-white underline underline-offset-4 hover:text-slate-light">
                    {funnel.circlesLink.label}
                  </Link>
                </p>

                {/* Einladungscode */}
                <div className="grid gap-3 border-t border-line pt-7">
                  <label htmlFor="code" className="text-sm font-medium text-white">
                    {funnel.code.label}
                    <span className="label ml-3 text-[0.625rem]">{funnel.optional}</span>
                  </label>
                  {codeInfo ? (
                    <div className="border border-white p-4">
                      <p className="text-sm text-white">
                        <span className="label mr-2">{funnel.code.valid}</span>
                        <span className="font-semibold">{codeInfo.code}</span>
                      </p>
                      <p className="mt-2 text-base text-white">{codeInfo.benefit}</p>
                      <p className="mt-1 text-sm text-slate-light">Gilt für: {codeInfo.tiersLabel}</p>
                      {codeInfo.skipApplication ? <p className="mt-3 text-sm text-white">{funnel.code.skipNote}</p> : null}
                      <button type="button" onClick={removeCode} className="label mt-4 underline underline-offset-4 hover:text-white">
                        {funnel.code.remove}
                      </button>
                    </div>
                  ) : (
                    <>
                      <p id="code-hint" className="text-sm leading-relaxed text-slate-light">
                        {funnel.code.hint}
                      </p>
                      <div className="flex gap-2">
                        <TextInput
                          id="code"
                          name="code"
                          value={codeInput}
                          autoComplete="off"
                          autoCapitalize="characters"
                          aria-describedby={codeError ? "code-hint code-error" : "code-hint"}
                          aria-invalid={codeError ? true : undefined}
                          onChange={(event) => setCodeInput(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              applyCode(codeInput);
                            }
                          }}
                          className="uppercase"
                        />
                        <button
                          type="button"
                          disabled={checking || !codeInput.trim()}
                          onClick={() => applyCode(codeInput)}
                          className="label shrink-0 border border-white px-5 text-white transition-colors hover:bg-white hover:text-plum disabled:opacity-50"
                        >
                          {checking ? funnel.code.checking : funnel.code.apply}
                        </button>
                      </div>
                      {codeError ? <FieldError id="code-error">{codeError}</FieldError> : null}
                    </>
                  )}
                </div>
              </>
            ) : null}

            {stepId === "person" ? (
              <>
                <Field id="name" label={fields.name.label} error={errors.name}>
                  {(describedBy) => <TextInput {...input("name")} autoComplete="name" aria-describedby={describedBy} />}
                </Field>
                <Field id="email" label={fields.email.label} error={errors.email}>
                  {(describedBy) => <TextInput {...input("email")} type="email" inputMode="email" autoComplete="email" aria-describedby={describedBy} />}
                </Field>
                <Field id="phone" label={fields.phone.label} hint={fields.phone.hint} error={errors.phone} optional={funnel.optional}>
                  {(describedBy) => <TextInput {...input("phone")} type="tel" inputMode="tel" autoComplete="tel" aria-describedby={describedBy} />}
                </Field>
                <Field id="city" label={fields.city.label} hint={fields.city.hint} error={errors.city}>
                  {(describedBy) => <Select {...input("city")} options={cityOptions} placeholder="Bitte wählen" aria-describedby={describedBy} />}
                </Field>
                {draft.city === OTHER_CITY ? (
                  <Field id="cityOther" label={fields.cityOther.label} error={errors.cityOther}>
                    {(describedBy) => <TextInput {...input("cityOther")} autoComplete="address-level2" aria-describedby={describedBy} />}
                  </Field>
                ) : null}
                <Field
                  id="profileUrl"
                  label={fields.profileUrl.label}
                  hint={fields.profileUrl.hint}
                  error={errors.profileUrl}
                  optional={direct ? funnel.optional : undefined}
                >
                  {(describedBy) => (
                    <TextInput {...input("profileUrl")} inputMode="url" autoComplete="url" placeholder="linkedin.com/in/…" aria-describedby={describedBy} />
                  )}
                </Field>
              </>
            ) : null}

            {stepId === "situation" && company ? (
              <>
                <ChoiceGroup
                  name="stage"
                  legend={fields.stage.label}
                  error={errors.stage}
                  options={options.stage}
                  value={draft.stage}
                  onChange={(value) => update("stage", value)}
                />
                <Field id="company" label={fields.company.label} error={errors.company}>
                  {(describedBy) => <TextInput {...input("company")} autoComplete="organization" aria-describedby={describedBy} />}
                </Field>
                <Field id="legalForm" label={fields.legalForm.label} error={errors.legalForm}>
                  {(describedBy) => <Select {...input("legalForm")} options={options.legalForm} placeholder="Bitte wählen" aria-describedby={describedBy} />}
                </Field>
                <Field id="role" label={fields.role.label} error={errors.role}>
                  {(describedBy) => <Select {...input("role")} options={options.role} placeholder="Bitte wählen" aria-describedby={describedBy} />}
                </Field>
                <div className="grid gap-7 sm:grid-cols-2">
                  <Field id="foundedYear" label={fields.foundedYear.label} error={errors.foundedYear}>
                    {(describedBy) => (
                      <TextInput {...input("foundedYear")} inputMode="numeric" maxLength={4} placeholder="2019" aria-describedby={describedBy} />
                    )}
                  </Field>
                  <Field id="employees" label={fields.employees.label} error={errors.employees}>
                    {(describedBy) => <Select {...input("employees")} options={options.employees} placeholder="Bitte wählen" aria-describedby={describedBy} />}
                  </Field>
                </div>
                <Field id="industry" label={fields.industry.label} error={errors.industry}>
                  {(describedBy) => <TextInput {...input("industry")} aria-describedby={describedBy} />}
                </Field>
              </>
            ) : null}

            {stepId === "situation" && circle === "founder" ? (
              <>
                <Field id="industry" label={fields.industry.labelFoundations} error={errors.industry}>
                  {(describedBy) => <TextInput {...input("industry")} aria-describedby={describedBy} />}
                </Field>
                <Field id="currentActivity" label={fields.currentActivity.label} hint={fields.currentActivity.hint} error={errors.currentActivity}>
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

            {stepId === "situation" && circle === "community" ? (
              <>
                <Field
                  id="currentActivity"
                  label={fields.currentActivity.labelCommunity}
                  hint={fields.currentActivity.hintCommunity}
                  error={errors.currentActivity}
                >
                  {(describedBy) => <TextArea {...input("currentActivity")} aria-describedby={describedBy} />}
                </Field>
                <Field id="industry" label={fields.industry.labelCommunity} error={errors.industry}>
                  {(describedBy) => <TextInput {...input("industry")} aria-describedby={describedBy} />}
                </Field>
              </>
            ) : null}

            {stepId === "fragen" && company ? (
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
                {circle === "mastermind" ? (
                  <Field id="mastermindFocus" label={fields.mastermindFocus.label} hint={fields.mastermindFocus.hint} error={errors.mastermindFocus}>
                    {(describedBy) => <TextArea {...input("mastermindFocus")} aria-describedby={describedBy} />}
                  </Field>
                ) : null}
                <Field id="bottleneck" label={fields.bottleneck.label} hint={fields.bottleneck.hint} error={errors.bottleneck}>
                  {(describedBy) => <TextArea {...input("bottleneck")} aria-describedby={describedBy} />}
                </Field>
              </>
            ) : null}

            {stepId === "fragen" && circle === "founder" ? (
              <>
                <Field id="idea" label={fields.idea.label} hint={fields.idea.hint} error={errors.idea}>
                  {(describedBy) => <TextArea {...input("idea")} aria-describedby={describedBy} />}
                </Field>
                <Field id="goal12m" label={fields.goal12m.labelFoundations} hint={fields.goal12m.hintFoundations} error={errors.goal12m}>
                  {(describedBy) => <TextArea {...input("goal12m")} aria-describedby={describedBy} />}
                </Field>
                <Field id="bottleneck" label={fields.bottleneck.labelFoundations} error={errors.bottleneck}>
                  {(describedBy) => <TextArea {...input("bottleneck")} aria-describedby={describedBy} />}
                </Field>
              </>
            ) : null}

            {stepId === "fragen" && circle === "community" ? (
              <Field id="expectation" label={fields.expectation.label} hint={fields.expectation.hint} error={errors.expectation}>
                {(describedBy) => <TextArea {...input("expectation")} aria-describedby={describedBy} />}
              </Field>
            ) : null}

            {stepId === "fragen" ? (
              <>
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
                {circle !== "community" ? (
                  <ChoiceGroup
                    name="timeCommitment"
                    legend={fields.timeCommitment.label}
                    error={errors.timeCommitment}
                    options={options.timeCommitment}
                    value={draft.timeCommitment}
                    onChange={(value) => update("timeCommitment", value)}
                  />
                ) : null}
              </>
            ) : null}

            {stepId === "bestaetigung" ? (
              <>
                <Summary draft={draft} direct={direct} codeInfo={codeInfo} onEdit={goTo} />
                {selected ? (
                  <div className="border p-5" style={{ ...tierStyle(selected.tier), borderColor: "var(--tier)" }}>
                    <p className="label text-[var(--tier)]">{funnel.circleCommitmentLabel}</p>
                    <div className="mt-4">
                      <Checkbox id="commitment" checked={draft.commitment} onChange={(checked) => update("commitment", checked)} error={errors.commitment}>
                        {selected.pledge}
                      </Checkbox>
                    </div>
                  </div>
                ) : null}
                <Checkbox id="privacy" checked={draft.privacy} onChange={(checked) => update("privacy", checked)} error={errors.privacy}>
                  {direct ? fields.privacy.labelDirect : fields.privacy.label}{" "}
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
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-plum/95 pb-[env(safe-area-inset-bottom)]">
          {state.status === "error" && !state.fieldErrors ? (
            <p role="alert" className="mx-auto w-full max-w-2xl px-[var(--gutter)] pt-3">
              <span className="flex items-start gap-3 border border-pink px-4 py-3 text-sm text-white">
                <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-pink" />
                {state.message}
              </span>
            </p>
          ) : null}
          <div className="mx-auto flex h-20 w-full max-w-2xl items-center gap-3 px-[var(--gutter)]">
            {stepIndex > 0 ? (
              <button type="button" onClick={() => goTo(steps[stepIndex - 1]!)} className="label flex h-14 items-center px-2 text-white hover:text-slate-light">
                {nav.back}
              </button>
            ) : null}
            <button
              type="submit"
              disabled={pending || checking}
              className={cx(
                "group ml-auto inline-flex h-14 flex-1 items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] transition-colors sm:flex-none sm:px-10",
                isLast ? "bg-pink text-white hover:bg-pink-deep" : "bg-white text-plum hover:bg-pink hover:text-white",
                (pending || checking) && "opacity-60",
              )}
            >
              {pending ? nav.submitting : isLast ? (direct ? nav.submitDirect : nav.submit) : nav.next}
              {!pending ? <Arrow /> : null}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Summary({
  draft,
  direct,
  codeInfo,
  onEdit,
}: {
  draft: ApplicationDraft;
  direct: boolean;
  codeInfo: ValidCode | null;
  onEdit: (step: StepId) => void;
}) {
  const label = (list: ReadonlyArray<{ value: string; label: string }>, value: string) =>
    list.find((option) => option.value === value)?.label ?? value;
  const city = draft.city === OTHER_CITY ? draft.cityOther : label(cityOptions, draft.city);
  const circle = funnel.circles.find((entry) => entry.tier === draft.circle);
  const company = usesCompany(draft.circle);

  const groups: Array<{ step: StepId; rows: Array<[string, string]> }> = [
    {
      step: "kreis",
      rows: [
        ["Kreis", circle?.name ?? "–"],
        ...(codeInfo ? ([[funnel.code.label, `${codeInfo.code}: ${codeInfo.benefit}`]] as Array<[string, string]>) : []),
      ],
    },
    {
      step: "person",
      rows: [
        [fields.name.label, draft.name],
        [fields.email.label, draft.email],
        [fields.phone.label, draft.phone || "–"],
        [fields.city.label, city],
        [fields.profileUrl.label, draft.profileUrl || "–"],
      ],
    },
  ];
  if (!direct) {
    groups.push({
      step: "situation",
      rows: company
        ? [
            [fields.stage.label, label(options.stage, draft.stage)],
            [fields.company.label, draft.company],
            [fields.legalForm.label, label(options.legalForm, draft.legalForm)],
            [fields.role.label, label(options.role, draft.role)],
            [fields.foundedYear.label, draft.foundedYear],
            [fields.employees.label, label(options.employees, draft.employees)],
            [fields.industry.label, draft.industry],
          ]
        : draft.circle === "founder"
          ? [
              [fields.industry.labelFoundations, draft.industry],
              [fields.currentActivity.label, draft.currentActivity],
              [fields.foundingTimeline.label, label(options.foundingTimeline, draft.foundingTimeline)],
            ]
          : [
              [fields.currentActivity.labelCommunity, draft.currentActivity],
              [fields.industry.labelCommunity, draft.industry],
            ],
    });
    const alltag: Array<[string, string]> = [[fields.hasChildren.label, label(options.hasChildren, draft.hasChildren)]];
    if (draft.circle !== "community") alltag.push([fields.timeCommitment.label, label(options.timeCommitment, draft.timeCommitment)]);
    groups.push({
      step: "fragen",
      rows: [
        ...((company
          ? [
              [fields.revenueRange.label, label(options.revenueRange, draft.revenueRange)],
              [fields.goal12m.label, draft.goal12m],
              ...(draft.circle === "mastermind" ? [[fields.mastermindFocus.label, draft.mastermindFocus]] : []),
              [fields.bottleneck.label, draft.bottleneck],
            ]
          : draft.circle === "founder"
            ? [
                [fields.idea.label, draft.idea],
                [fields.goal12m.labelFoundations, draft.goal12m],
                [fields.bottleneck.labelFoundations, draft.bottleneck],
              ]
            : [[fields.expectation.label, draft.expectation]]) as Array<[string, string]>),
        ...alltag,
      ],
    });
  }

  return (
    <div className="grid gap-3">
      <p className="text-base leading-relaxed text-slate-light">{direct ? funnel.summary.bodyDirect : funnel.summary.body}</p>
      {groups.map((group) => (
        <section key={group.step} className="card p-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="label text-white">{stepTitle(group.step, draft.circle, direct)}</h3>
            <button type="button" onClick={() => onEdit(group.step)} className="label underline underline-offset-4 hover:text-white">
              {funnel.summary.edit}
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
