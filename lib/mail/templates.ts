import "server-only";
import { funnel } from "@/content/funnel";
import { mails } from "@/content/mails";
import { isFoundations, type Application } from "@/lib/validation/application";
import type { Mail } from "./index";

// Mail-Clients kennen keine CSS-Variablen, daher die CI-Werte hier als Konstanten.
const ONYX = "#0d0d0d";
const PINK = "#ff1493";
const WHITE = "#ffffff";
const SLATE = "#b4b4b8";
const LINE = "#2a2a2a";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

function paragraphs(lines: string[]): string {
  return lines
    .map((line) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${WHITE};">${escapeHtml(line)}</p>`)
    .join("");
}

function layout(content: string): string {
  const signature = escapeHtml(mails.signature).replace(/\n/g, "<br>");
  return `<!doctype html>
<html lang="de"><body style="margin:0;padding:0;background:${ONYX};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${ONYX};">
<tr><td align="center" style="padding:40px 20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;font-family:Helvetica,Arial,sans-serif;">
<tr><td style="padding-bottom:24px;border-bottom:1px solid ${LINE};font-weight:800;letter-spacing:2px;font-size:13px;color:${WHITE};">
FEMPIRE <span style="color:${SLATE};">CLUB</span><span style="display:inline-block;width:32px;height:2px;background:${PINK};margin-left:12px;vertical-align:middle;"></span>
</td></tr>
<tr><td style="padding:32px 0;">${content}</td></tr>
<tr><td style="padding-top:24px;border-top:1px solid ${LINE};font-size:13px;line-height:1.6;color:${SLATE};">${signature}</td></tr>
</table></td></tr></table></body></html>`;
}

function textBlock(lines: string[]): string {
  return `${lines.join("\n\n")}\n\n--\n${mails.signature}`;
}

// ---------------------------------------------------------------------------

export function applicationConfirmation(application: Application): Mail {
  const t = mails.applicationConfirmation;
  const greeting = fill(t.greeting, { name: application.name });
  return {
    to: application.email,
    subject: t.subject,
    html: layout(paragraphs([greeting, ...t.body])),
    text: textBlock([greeting, ...t.body]),
  };
}

/** Anzeigewert einer Auswahl (label statt gespeichertem value) */
function optionLabel(list: ReadonlyArray<{ value: string; label: string }>, value: string): string {
  return list.find((option) => option.value === value)?.label ?? value;
}

export function applicationNotification(
  application: Application,
  meta: { id: string; score: number; cityName: string },
  to: string[],
): Mail {
  const t = mails.applicationNotification;
  const { fields, options } = funnel;
  const foundations = isFoundations(application);
  const pathRows: Array<[string, string]> = foundations
    ? [
        [fields.industry.labelFoundations, application.industry],
        [fields.currentActivity.label, application.currentActivity],
        [fields.foundingTimeline.label, optionLabel(options.foundingTimeline, application.foundingTimeline)],
        [fields.idea.label, application.idea],
        [fields.goal12m.labelFoundations, application.goal12m],
        [fields.bottleneck.labelFoundations, application.bottleneck],
      ]
    : [
        [fields.company.label, application.company],
        [fields.legalForm.label, optionLabel(options.legalForm, application.legalForm)],
        [fields.role.label, optionLabel(options.role, application.role)],
        [fields.foundedYear.label, String(application.foundedYear)],
        [fields.employees.label, optionLabel(options.employees, application.employees)],
        [fields.industry.label, application.industry],
        [fields.revenueRange.label, optionLabel(options.revenueRange, application.revenueRange)],
        [fields.goal12m.label, application.goal12m],
        [fields.bottleneck.label, application.bottleneck],
      ];
  const rows: Array<[string, string]> = [
    [t.circleLabel, foundations ? t.circleFoundations : t.circleLeader],
    ["Score (intern)", String(meta.score)],
    [fields.name.label, application.name],
    [fields.email.label, application.email],
    [fields.phone.label, application.phone || "–"],
    [fields.city.label, meta.cityName],
    [fields.profileUrl.label, application.profileUrl],
    [fields.stage.label, optionLabel(options.stage, application.stage)],
    ...pathRows,
    [fields.motivation.label, application.motivation],
    [fields.contribution.label, application.contribution],
    [fields.hasChildren.label, optionLabel(options.hasChildren, application.hasChildren)],
    [fields.timeCommitment.label, optionLabel(options.timeCommitment, application.timeCommitment)],
    ["Datensatz-ID", meta.id],
  ];

  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid ${LINE};vertical-align:top;">
<div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${SLATE};">${escapeHtml(label)}</div>
<div style="margin-top:4px;font-size:15px;line-height:1.5;color:${WHITE};white-space:pre-wrap;">${escapeHtml(value)}</div></td></tr>`,
    )
    .join("");

  return {
    to,
    replyTo: application.email,
    subject: fill(t.subject, {
      name: application.name,
      circle: foundations ? t.circleFoundations : t.circleLeader,
      score: meta.score,
    }),
    html: layout(
      `<p style="margin:0 0 24px;font-size:14px;color:${SLATE};">${escapeHtml(t.intro)}</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${htmlRows}</table>`,
    ),
    text: [t.intro, "", ...rows.map(([label, value]) => `${label}: ${value}`)].join("\n"),
  };
}

export function waitlistConfirm(input: {
  email: string;
  city: string;
  confirmUrl: string;
  unsubscribeUrl: string;
}): Mail {
  const t = mails.waitlistConfirm;
  const body = t.body.map((line) => fill(line, { city: input.city }));
  const button = `<p style="margin:24px 0;"><a href="${escapeHtml(input.confirmUrl)}" style="display:inline-block;padding:16px 28px;background:${WHITE};color:${ONYX};font-weight:700;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;">${escapeHtml(t.button)}</a></p>`;
  const unsubscribe = `<p style="margin:0;font-size:13px;"><a href="${escapeHtml(input.unsubscribeUrl)}" style="color:${SLATE};">${escapeHtml(t.unsubscribe)}</a></p>`;
  return {
    to: input.email,
    subject: fill(t.subject, { city: input.city }),
    html: layout(paragraphs([t.greeting, ...body]) + button + unsubscribe),
    text: textBlock([t.greeting, ...body, `${t.button}: ${input.confirmUrl}`, `${t.unsubscribe}: ${input.unsubscribeUrl}`]),
  };
}
