import { z } from "zod";
import { cities, OTHER_CITY } from "@/content/cities";
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

// ---------------------------------------------------------------------------
// Pfade
// ---------------------------------------------------------------------------

export type Path = "leader" | "foundations";

/** Die Situation aus Schritt 2 bestimmt den Pfad. Das ist ein interner Vorschlag, keine Wahl der Bewerberin. */
export function pathForStage(stage: string): Path {
  return stage === "vor_gruendung" ? "foundations" : "leader";
}

// ---------------------------------------------------------------------------
// Bausteine
// ---------------------------------------------------------------------------

const person = z
  .object({
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
    profileUrl: required("Ein Link", 3).max(300),
  })
  .refine((data) => data.city !== OTHER_CITY || data.cityOther.length >= 2, {
    path: ["cityOther"],
    error: "Bitte die Stadt angeben.",
  });

const stage = optionEnum(options.stage, "Bitte wähle, was auf dich zutrifft.");

const leaderSituation = z.object({
  stage: z.enum(["unternehmen", "fuehrung"]),
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

const foundationsSituation = z.object({
  stage: z.literal("vor_gruendung"),
  industry: required("Die Branche").max(120),
  currentActivity: required("Deine aktuelle Tätigkeit").max(160),
  foundingTimeline: optionEnum(options.foundingTimeline, "Bitte einen Zeitraum wählen."),
});

const leaderPlan = z.object({
  revenueRange: optionEnum(options.revenueRange, "Bitte eine Spanne wählen."),
  goal12m: text("Ziel", 20),
  bottleneck: text("Engpass", 20),
});

const foundationsPlan = z.object({
  idea: text("Vorhaben", 40),
  goal12m: text("Ziel", 20),
  bottleneck: text("Hürde", 20),
});

const passung = z.object({
  motivation: text("Motivation", 30),
  contribution: text("Beitrag", 30),
  hasChildren: z.enum(["ja", "nein", ""]).default(""),
  timeCommitment: optionEnum(options.timeCommitment, "Bitte eine Option wählen."),
});

const bestaetigung = z.object({
  privacy: z.literal(true, { error: "Bitte stimme der Datenschutzerklärung zu." }),
});

// ---------------------------------------------------------------------------
// Schritte und Gesamtschema
// ---------------------------------------------------------------------------

export const stepIds = funnel.steps.map((step) => step.id) as StepId[];
export type StepId = "person" | "situation" | "plan" | "passung" | "bestaetigung";

/** Schema eines Schritts, abhängig von der gewählten Situation */
export function schemaForStep(step: StepId, stageValue: string): z.ZodType {
  const path = pathForStage(stageValue);
  switch (step) {
    case "person":
      return person;
    case "situation":
      if (!stageValue) return z.object({ stage });
      return path === "foundations" ? foundationsSituation : leaderSituation;
    case "plan":
      return path === "foundations" ? foundationsPlan : leaderPlan;
    case "passung":
      return passung;
    case "bestaetigung":
      return bestaetigung;
  }
}

/** In welchem Schritt ein Feld liegt, für Sprünge bei Serverfehlern */
export const fieldStep: Record<string, StepId> = {
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
  revenueRange: "plan",
  idea: "plan",
  goal12m: "plan",
  bottleneck: "plan",
  motivation: "passung",
  contribution: "passung",
  hasChildren: "passung",
  timeCommitment: "passung",
  privacy: "bestaetigung",
};

const leaderSchema = person.and(leaderSituation).and(leaderPlan).and(passung).and(bestaetigung);
const foundationsSchema = person.and(foundationsSituation).and(foundationsPlan).and(passung).and(bestaetigung);

export type LeaderApplication = z.infer<typeof leaderSchema>;
export type FoundationsApplication = z.infer<typeof foundationsSchema>;
export type Application = LeaderApplication | FoundationsApplication;

/** Prüft eine komplette Bewerbung gegen den Pfad, der zu ihrer Situation gehört. */
export function parseApplication(raw: Record<string, unknown>) {
  const stageResult = stage.safeParse(raw.stage);
  if (!stageResult.success) {
    return { success: false as const, error: new z.ZodError([{ ...stageResult.error.issues[0]!, path: ["stage"] }]) };
  }
  const schema = pathForStage(stageResult.data) === "foundations" ? foundationsSchema : leaderSchema;
  return schema.safeParse(raw) as z.ZodSafeParseResult<Application>;
}

export function isFoundations(application: Application): application is FoundationsApplication {
  return application.stage === "vor_gruendung";
}

// ---------------------------------------------------------------------------
// Formularzustand
// ---------------------------------------------------------------------------

/** Rohdaten, wie sie im Formular und im localStorage liegen: alles Strings, Checkbox als boolean */
export type ApplicationDraft = {
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
  motivation: string;
  contribution: string;
  hasChildren: string;
  timeCommitment: string;
  privacy: boolean;
};

export const emptyDraft: ApplicationDraft = {
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
  motivation: "",
  contribution: "",
  hasChildren: "",
  timeCommitment: "",
  privacy: false,
};

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
