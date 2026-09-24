import { z } from "zod";
import { funnel } from "@/content/funnel";

/** Wandelt die Optionsliste aus content/ in ein zod-Enum der gespeicherten Werte. */
function optionEnum<T extends { value: string }>(options: readonly T[], message: string) {
  const values = options.map((option) => option.value).filter(Boolean) as [string, ...string[]];
  return z.enum(values, { error: message });
}

const required = (label: string, min = 2) =>
  z.string().trim().min(min, { error: `${label} fehlt noch.` });

const text = (label: string, min: number) =>
  z
    .string()
    .trim()
    .min(min, { error: `Bitte etwas ausführlicher (mindestens ${min} Zeichen).` })
    .max(2000, { error: `${label}: maximal 2000 Zeichen.` });

const currentYear = new Date().getFullYear();
const { options } = funnel;

export const stepSchemas = {
  person: z.object({
    name: required("Dein Name").max(120),
    email: z.email({ error: "Bitte eine gültige E-Mail-Adresse angeben." }).max(200),
    phone: z
      .string()
      .trim()
      .max(40)
      .refine((value) => value === "" || /^[+()\d\s/-]{6,}$/.test(value), {
        error: "Bitte eine gültige Telefonnummer angeben oder das Feld leer lassen.",
      }),
    city: required("Die Stadt").max(80),
    profileUrl: required("Ein Link", 3).max(300),
  }),
  unternehmen: z.object({
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
  }),
  zahlen: z.object({
    revenueRange: optionEnum(options.revenueRange, "Bitte eine Spanne wählen."),
    goal12m: text("Ziel", 20),
    bottleneck: text("Engpass", 20),
  }),
  passung: z.object({
    motivation: text("Motivation", 30),
    contribution: text("Beitrag", 30),
    hasChildren: z.enum(["ja", "nein", ""]).default(""),
    timeCommitment: optionEnum(options.timeCommitment, "Bitte eine Option wählen."),
  }),
  bestaetigung: z.object({
    privacy: z.literal(true, { error: "Bitte stimme der Datenschutzerklärung zu." }),
  }),
} as const;

export type StepId = keyof typeof stepSchemas;
export const stepIds = funnel.steps.map((step) => step.id) as StepId[];

export const applicationSchema = stepSchemas.person
  .extend(stepSchemas.unternehmen.shape)
  .extend(stepSchemas.zahlen.shape)
  .extend(stepSchemas.passung.shape)
  .extend(stepSchemas.bestaetigung.shape);

export type Application = z.infer<typeof applicationSchema>;

/** Rohdaten, wie sie im Formular und im localStorage liegen: alles Strings, Checkbox als boolean */
export type ApplicationDraft = {
  [K in keyof Application]: K extends "privacy" ? boolean : string;
};

export const emptyDraft: ApplicationDraft = {
  name: "",
  email: "",
  phone: "",
  city: "",
  profileUrl: "",
  company: "",
  legalForm: "",
  role: "",
  foundedYear: "",
  employees: "",
  industry: "",
  revenueRange: "",
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
