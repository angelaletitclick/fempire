import { z } from "zod";
import { cities, OTHER_CITY } from "@/content/cities";
import type { Tier } from "@/content/club";
import { funnel } from "@/content/funnel";

/** Wandelt die Optionsliste aus content/ in ein zod-Enum der gespeicherten Werte. */
function optionEnum<T extends { value: string }>(options: readonly T[], message: string) {
  const values = options.map((option) => option.value).filter(Boolean) as [string, ...string[]];
  return z.enum(values, { error: message });
}

const required = (label: string, min = 2) => z.string().trim().min(min, { error: `${label} fehlt noch.` });

const text = (label: string, min: number) =>
  z
    .string()
    .trim()
    .min(min, { error: `Bitte etwas ausführlicher (mindestens ${min} Zeichen).` })
    .max(2000, { error: `${label}: maximal 2000 Zeichen.` });

const currentYear = new Date().getFullYear();
const { options } = funnel;

/** Stadt-Auswahl: alle Städte aus content/cities.ts plus "Andere Stadt" */
export const cityOptions = [
  ...cities.map((city) => ({ value: city.slug, label: city.name })),
  { value: OTHER_CITY, label: "Andere Stadt" },
];

export const circleValues = funnel.circles.map((circle) => circle.tier) as [Tier, ...Tier[]];

/** Unternehmens-Fragen (Leader Circle, Masterminds) oder Gründungs-Fragen (Founder Circle) */
export const usesCompany = (circle: string) => circle === "leader" || circle === "mastermind";

// ---------------------------------------------------------------------------
// Bausteine
// ---------------------------------------------------------------------------

const circle = z.enum(circleValues, { error: funnel.circleError });

const personBase = {
  name: required("Dein Name").max(120),
  email: z.email({ error: "Bitte eine gültige E-Mail-Adresse angeben." }).max(200),
  phone: z
    .string()
    .trim()
    .max(40)
    .refine((value) => value === "" || /^[+()\d\s/-]{6,}$/.test(value), {
      error: "Bitte eine gültige Telefonnummer angeben oder das Feld leer lassen.",
    }),
  city: optionEnum(cityOptions, "Bitte eine Stadt wählen."),
  cityOther: z.string().trim().max(80),
};

const otherCity = (data: { city: string; cityOther: string }) => data.city !== OTHER_CITY || data.cityOther.length >= 2;
const otherCityIssue = { path: ["cityOther"], error: "Bitte die Stadt angeben." };

const person = z.object({ ...personBase, profileUrl: required("Ein Link", 3).max(300) }).refine(otherCity, otherCityIssue);
/** Mit Einladungscode ohne Bewerbung ist der Link freiwillig */
const personDirect = z.object({ ...personBase, profileUrl: z.string().trim().max(300) }).refine(otherCity, otherCityIssue);

const companySituation = z.object({
  stage: optionEnum(options.stage, "Bitte wähle, was auf dich zutrifft."),
  company: required("Der Firmenname").max(160),
  legalForm: optionEnum(options.legalForm, "Bitte eine Rechtsform wählen."),
  role: optionEnum(options.role, "Bitte deine Rolle wählen."),
  foundedYear: z.coerce
    .number({ error: "Bitte ein Jahr angeben." })
    .int({ error: "Bitte ein Jahr angeben." })
    .min(1950, { error: "Bitte ein Jahr ab 1950 angeben." })
    .max(currentYear, { error: `Bitte ein Jahr bis ${currentYear} angeben.` }),
  employees: optionEnum(options.employees, "Bitte eine Größe wählen."),
  industry: required("Die Branche").max(120),
});

const founderSituation = z.object({
  industry: required("Die Branche").max(120),
  currentActivity: required("Deine aktuelle Tätigkeit").max(160),
  foundingTimeline: optionEnum(options.foundingTimeline, "Bitte einen Zeitraum wählen."),
});

const communitySituation = z.object({
  currentActivity: text("Tätigkeit", 10),
  industry: required("Die Branche").max(120),
});

const hasChildren = z.enum(["ja", "nein", ""]).default("");
const timeCommitment = optionEnum(options.timeCommitment, "Bitte eine Option wählen.");

const fragen: Record<Tier, z.ZodObject> = {
  community: z.object({ expectation: text("Erwartung", 20), hasChildren }),
  founder: z.object({ idea: text("Vorhaben", 40), goal12m: text("Ziel", 20), bottleneck: text("Hürde", 20), hasChildren, timeCommitment }),
  leader: z.object({
    revenueRange: optionEnum(options.revenueRange, "Bitte eine Spanne wählen."),
    goal12m: text("Ziel", 20),
    bottleneck: text("Engpass", 20),
    hasChildren,
    timeCommitment,
  }),
  mastermind: z.object({
    revenueRange: optionEnum(options.revenueRange, "Bitte eine Spanne wählen."),
    goal12m: text("Ziel", 20),
    mastermindFocus: text("Fokus", 30),
    bottleneck: text("Engpass", 20),
    hasChildren,
    timeCommitment,
  }),
};

const situation: Record<Tier, z.ZodObject> = {
  community: communitySituation,
  founder: founderSituation,
  leader: companySituation,
  mastermind: companySituation,
};

const bestaetigung = z.object({
  commitment: z.literal(true, { error: funnel.fields.commitment.error }),
  privacy: z.literal(true, { error: "Bitte stimme der Datenschutzerklärung zu." }),
});

// ---------------------------------------------------------------------------
// Schritte
// ---------------------------------------------------------------------------

export type StepId = "kreis" | "person" | "situation" | "fragen" | "bestaetigung";

/** Schritte je nach Weg: mit Bewerbung fünf, mit Einladungscode ohne Bewerbung drei */
export function stepsFor(direct: boolean): StepId[] {
  return direct ? ["kreis", "person", "bestaetigung"] : ["kreis", "person", "situation", "fragen", "bestaetigung"];
}

/** Titel eines Schritts für den gewählten Kreis */
export function stepTitle(step: StepId, circleValue: string, direct: boolean): string {
  const tier = (circleValues as string[]).includes(circleValue) ? (circleValue as Tier) : "leader";
  switch (step) {
    case "kreis":
      return funnel.steps.kreis;
    case "person":
      return funnel.steps.person;
    case "situation":
      return funnel.steps.situation[tier];
    case "fragen":
      return funnel.steps.fragen[tier];
    case "bestaetigung":
      return direct ? funnel.steps.bestaetigungDirect : funnel.steps.bestaetigung;
  }
}

/** Schema eines Schritts für den gewählten Kreis */
export function schemaForStep(step: StepId, circleValue: string, direct: boolean): z.ZodType {
  const tier = (circleValues as string[]).includes(circleValue) ? (circleValue as Tier) : null;
  switch (step) {
    case "kreis":
      return z.object({ circle });
    case "person":
      return direct ? personDirect : person;
    case "situation":
      return tier ? situation[tier] : z.object({ circle });
    case "fragen":
      return tier ? fragen[tier] : z.object({ circle });
    case "bestaetigung":
      return bestaetigung;
  }
}

/** In welchem Schritt ein Feld liegt, für Sprünge bei Serverfehlern */
export const fieldStep: Record<string, StepId> = {
  circle: "kreis",
  code: "kreis",
  name: "person",
  email: "person",
  phone: "person",
  city: "person",
  cityOther: "person",
  profileUrl: "person",
  stage: "situation",
  company: "situation",
  legalForm: "situation",
  role: "situation",
  foundedYear: "situation",
  employees: "situation",
  industry: "situation",
  currentActivity: "situation",
  foundingTimeline: "situation",
  revenueRange: "fragen",
  idea: "fragen",
  goal12m: "fragen",
  bottleneck: "fragen",
  expectation: "fragen",
  mastermindFocus: "fragen",
  hasChildren: "fragen",
  timeCommitment: "fragen",
  commitment: "bestaetigung",
  privacy: "bestaetigung",
};

// ---------------------------------------------------------------------------
// Gesamte Bewerbung
// ---------------------------------------------------------------------------

/** Geprüfte Bewerbung: Pflichtfelder je Kreis, alle übrigen Felder als leere Strings */
export type Application = ApplicationDraft & { circle: Tier; foundedYear: string };

/**
 * Prüft eine komplette Bewerbung gegen die Fragen des gewählten Kreises.
 * `direct`: Aufnahme über Einladungscode ohne Bewerbung, nur Kreis, Person und Bestätigung.
 */
export function parseApplication(raw: ApplicationDraft, direct: boolean) {
  const circleResult = circle.safeParse(raw.circle);
  if (!circleResult.success) {
    return { success: false as const, error: new z.ZodError([{ ...circleResult.error.issues[0]!, path: ["circle"] }]) };
  }
  const issues: z.core.$ZodIssue[] = [];
  for (const step of stepsFor(direct)) {
    const result = schemaForStep(step, circleResult.data, direct).safeParse(raw);
    if (!result.success) issues.push(...result.error.issues);
  }
  if (issues.length) return { success: false as const, error: new z.ZodError(issues) };

  // Nur die Felder des eigenen Kreises behalten, alles andere leeren
  const keep = new Set<string>(["circle", "code", "commitment", "privacy"]);
  for (const step of stepsFor(direct)) {
    const schema = schemaForStep(step, circleResult.data, direct);
    const shape = shapeOf(schema);
    for (const key of Object.keys(shape)) keep.add(key);
  }
  const clean = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, keep.has(key) ? (typeof value === "string" ? value.trim() : value) : typeof value === "boolean" ? value : ""]),
  ) as ApplicationDraft;
  return { success: true as const, data: { ...clean, circle: circleResult.data } as Application };
}

/** Felder eines Objekt-Schemas, auch wenn es mit refine umhüllt ist */
function shapeOf(schema: z.ZodType): Record<string, unknown> {
  if (schema instanceof z.ZodObject) return schema.shape;
  const inner = (schema as unknown as { _zod?: { def?: { schema?: z.ZodType; in?: z.ZodType } } })._zod?.def;
  if (inner?.schema) return shapeOf(inner.schema);
  if (inner?.in) return shapeOf(inner.in);
  return {};
}

// ---------------------------------------------------------------------------
// Formularzustand
// ---------------------------------------------------------------------------

/** Rohdaten, wie sie im Formular und im localStorage liegen: alles Strings, Checkboxen als boolean */
export type ApplicationDraft = {
  circle: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  cityOther: string;
  profileUrl: string;
  stage: string;
  company: string;
  legalForm: string;
  role: string;
  foundedYear: string;
  employees: string;
  industry: string;
  currentActivity: string;
  foundingTimeline: string;
  revenueRange: string;
  idea: string;
  goal12m: string;
  bottleneck: string;
  expectation: string;
  mastermindFocus: string;
  hasChildren: string;
  timeCommitment: string;
  commitment: boolean;
  privacy: boolean;
};

export const emptyDraft: ApplicationDraft = {
  circle: "",
  code: "",
  name: "",
  email: "",
  phone: "",
  city: "",
  cityOther: "",
  profileUrl: "",
  stage: "",
  company: "",
  legalForm: "",
  role: "",
  foundedYear: "",
  employees: "",
  industry: "",
  currentActivity: "",
  foundingTimeline: "",
  revenueRange: "",
  idea: "",
  goal12m: "",
  bottleneck: "",
  expectation: "",
  mastermindFocus: "",
  hasChildren: "",
  timeCommitment: "",
  commitment: false,
  privacy: false,
};

/** Felder, die als Checkbox (boolean) übertragen werden */
export const BOOLEAN_FIELDS = ["commitment", "privacy"] as const;

export type FieldErrors = Partial<Record<keyof ApplicationDraft, string>>;

/** Erste Fehlermeldung pro Feld, für die Anzeige unter dem Feld */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const result: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof ApplicationDraft | undefined;
    if (key && !result[key]) result[key] = issue.message;
  }
  return result;
}

/** Name des Honeypot-Felds. Für Menschen unsichtbar, Bots füllen es aus. */
export const HONEYPOT = "firmenwebsite";

/** Gespeicherter Kreis einer Bewerbung als Mitgliedschaft (ältere Bewerbungen: "foundations") */
export const circleFromStored = (value: string | null | undefined): Tier =>
  value === "foundations" ? "founder" : (circleValues as string[]).includes(value ?? "") ? (value as Tier) : "leader";

/** Datensatz aus der Tabelle applications als Bewerbung, z. B. für die Anzeige im Backend */
export function applicationFromRow(row: Record<string, unknown>): Application {
  const s = (value: unknown) => (value === null || value === undefined ? "" : String(value));
  return {
    ...emptyDraft,
    circle: circleFromStored(s(row.suggested_circle)),
    code: s(row.invite_code),
    name: s(row.name),
    email: s(row.email),
    phone: s(row.phone),
    city: s(row.city_slug),
    cityOther: s(row.city),
    profileUrl: s(row.profile_url),
    stage: s(row.stage) === "vor_gruendung" ? "" : s(row.stage),
    company: s(row.company),
    legalForm: s(row.legal_form),
    role: s(row.role),
    foundedYear: s(row.founded_year),
    employees: s(row.employees),
    industry: s(row.industry),
    currentActivity: s(row.current_activity),
    foundingTimeline: s(row.founding_timeline),
    revenueRange: s(row.revenue_range),
    idea: s(row.idea),
    goal12m: s(row.goal_12m),
    bottleneck: s(row.bottleneck),
    expectation: s(row.expectation),
    mastermindFocus: s(row.mastermind_focus),
    hasChildren: s(row.has_children),
    timeCommitment: s(row.time_commitment),
    commitment: Boolean(row.commitment_accepted_at),
    privacy: true,
  };
}
