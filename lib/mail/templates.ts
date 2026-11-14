import "server-only";
import { funnel } from "@/content/funnel";
import { mails } from "@/content/mails";
import { tierLabel } from "@/content/club";
import { usesCompany, type Application } from "@/lib/validation/application";
import { siteUrl } from "@/lib/site-url";
import type { Mail } from "./index";

// Mail-Clients kennen keine CSS-Variablen, daher die CI-Werte hier als Konstanten.
const PLUM = "#2a1430";
const PINK = "#cb1570";
const WHITE = "#ffffff";
const SLATE = "#e8c9d9";
const LINE = "#e8c9d9";

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
<html lang="de"><body style="margin:0;padding:0;background:${PLUM};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PLUM};">
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
  const body = t.body.map((line) => fill(line, { circle: tierLabel(application.circle) }));
  return {
    to: application.email,
    subject: t.subject,
    html: layout(paragraphs([greeting, ...body])),
    text: textBlock([greeting, ...body]),
  };
}

/** Anzeigewert einer Auswahl (label statt gespeichertem value) */
function optionLabel(list: ReadonlyArray<{ value: string; label: string }>, value: string): string {
  return list.find((option) => option.value === value)?.label ?? value;
}

/** Antworten einer Bewerbung als Zeilen, je nach Kreis */
export function applicationRows(application: Application): Array<[string, string]> {
  const { fields, options } = funnel;
  const rows: Array<[string, string]> = [];
  const add = (label: string, value: string) => {
    if (value) rows.push([label, value]);
  };
  if (usesCompany(application.circle)) {
    add(fields.stage.label, optionLabel(options.stage, application.stage));
    add(fields.company.label, application.company);
    add(fields.legalForm.label, optionLabel(options.legalForm, application.legalForm));
    add(fields.role.label, optionLabel(options.role, application.role));
    add(fields.foundedYear.label, application.foundedYear);
    add(fields.employees.label, optionLabel(options.employees, application.employees));
    add(fields.industry.label, application.industry);
    add(fields.revenueRange.label, optionLabel(options.revenueRange, application.revenueRange));
    add(fields.goal12m.label, application.goal12m);
    add(fields.mastermindFocus.label, application.mastermindFocus);
    add(fields.bottleneck.label, application.bottleneck);
  } else if (application.circle === "founder") {
    add(fields.industry.labelFoundations, application.industry);
    add(fields.currentActivity.label, application.currentActivity);
    add(fields.foundingTimeline.label, optionLabel(options.foundingTimeline, application.foundingTimeline));
    add(fields.idea.label, application.idea);
    add(fields.goal12m.labelFoundations, application.goal12m);
    add(fields.bottleneck.labelFoundations, application.bottleneck);
  } else {
    add(fields.currentActivity.labelCommunity, application.currentActivity);
    add(fields.industry.labelCommunity, application.industry);
    add(fields.expectation.label, application.expectation);
  }
  add(fields.hasChildren.label, application.hasChildren ? optionLabel(options.hasChildren, application.hasChildren) : "");
  add(fields.timeCommitment.label, application.timeCommitment ? optionLabel(options.timeCommitment, application.timeCommitment) : "");
  return rows;
}

export function applicationNotification(
  application: Application,
  meta: { id: string; score: number; cityName: string },
  to: string[],
): Mail {
  const t = mails.applicationNotification;
  const { fields } = funnel;
  const circle = tierLabel(application.circle);
  const rows: Array<[string, string]> = [
    [t.circleLabel, circle],
    ...(application.code ? ([[t.codeLabel, application.code]] as Array<[string, string]>) : []),
    ["Score (intern)", String(meta.score)],
    [fields.name.label, application.name],
    [fields.email.label, application.email],
    [fields.phone.label, application.phone || "–"],
    [fields.city.label, meta.cityName],
    [fields.profileUrl.label, application.profileUrl || "–"],
    ...applicationRows(application),
    ["Datensatz-ID", meta.id],
  ];
  return {
    to,
    replyTo: application.email,
    subject: fill(t.subject, { name: application.name, circle, score: meta.score }),
    html: layout(`<p style="margin:0 0 24px;font-size:14px;color:${SLATE};">${escapeHtml(t.intro)}</p>${detailRows(rows)}`),
    text: [t.intro, "", ...rows.map(([label, value]) => `${label}: ${value}`)].join("\n"),
  };
}

/** An das Team: Aufnahme über Einladungscode ohne Bewerbung */
export function directJoinNotification(input: {
  to: string[];
  name: string;
  email: string;
  circle: string;
  code: string;
  benefit: string;
  status: string;
  rows: Array<[string, string]>;
}): Mail {
  const t = mails.directJoinNotification;
  const rows: Array<[string, string]> = [
    ["Mitgliedschaft", input.circle],
    ["Code", `${input.code} (${input.benefit})`],
    ["Status", input.status],
    ["Name", input.name],
    ["E-Mail", input.email],
    ...input.rows,
  ];
  return {
    to: input.to,
    replyTo: input.email,
    subject: fill(t.subject, { code: input.code, name: input.name, circle: input.circle }),
    html: layout(`<p style="margin:0 0 24px;font-size:14px;color:${SLATE};">${escapeHtml(t.intro)}</p>${detailRows(rows)}`),
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
  const button = `<p style="margin:24px 0;"><a href="${escapeHtml(input.confirmUrl)}" style="display:inline-block;padding:16px 28px;background:${WHITE};color:${PLUM};font-weight:700;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;">${escapeHtml(t.button)}</a></p>`;
  const unsubscribe = `<p style="margin:0;font-size:13px;"><a href="${escapeHtml(input.unsubscribeUrl)}" style="color:${SLATE};">${escapeHtml(t.unsubscribe)}</a></p>`;
  return {
    to: input.email,
    subject: fill(t.subject, { city: input.city }),
    html: layout(paragraphs([t.greeting, ...body]) + button + unsubscribe),
    text: textBlock([t.greeting, ...body, `${t.button}: ${input.confirmUrl}`, `${t.unsubscribe}: ${input.unsubscribeUrl}`]),
  };
}

function button(label: string, url: string): string {
  return `<p style="margin:24px 0;"><a href="${escapeHtml(url)}" style="display:inline-block;padding:16px 28px;background:${WHITE};color:${PLUM};font-weight:700;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;">${escapeHtml(label)}</a></p>`;
}

function detailRows(rows: Array<[string, string]>): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid ${LINE};vertical-align:top;">
<div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${SLATE};">${escapeHtml(label)}</div>
<div style="margin-top:4px;font-size:15px;line-height:1.5;color:${WHITE};white-space:pre-wrap;">${escapeHtml(value)}</div></td></tr>`,
    )
    .join("")}</table>`;
}

export function welcomeMail(input: { to: string; name: string; tier: string; loginUrl: string; extra?: string[] }): Mail {
  const t = mails.welcome;
  const greeting = fill(t.greeting, { name: input.name });
  const [first, ...rest] = t.body.map((line) => fill(line, { tier: input.tier }));
  const body = [first ?? "", ...(input.extra ?? []), ...rest];
  return {
    to: input.to,
    subject: t.subject,
    html: layout(paragraphs([greeting, ...body]) + button(t.button, input.loginUrl)),
    text: textBlock([greeting, ...body, `${t.button}: ${input.loginUrl}`]),
  };
}

/** Zusage nach der Bewerbung mit Bitte um den ersten Beitrag */
export function acceptedMail(input: {
  to: string;
  name: string;
  tier: string;
  price: string;
  period: string;
  vat: string;
  /** z. B. " Mit deinem Code FEMPIRE24: 50 % Rabatt auf den Monatsbeitrag." */
  codeNote?: string;
}): Mail {
  const t = mails.accepted;
  const greeting = fill(t.greeting, { name: input.name });
  const body = t.body.map((line) =>
    fill(line, { tier: input.tier, price: input.price, period: input.period, vat: input.vat, codeNote: input.codeNote ?? "" }),
  );
  return {
    to: input.to,
    subject: t.subject,
    html: layout(paragraphs([greeting, ...body])),
    text: textBlock([greeting, ...body]),
  };
}

export function rejectionMail(input: { to: string; name: string }): Mail {
  const t = mails.rejection;
  const greeting = fill(t.greeting, { name: input.name });
  return {
    to: input.to,
    subject: t.subject,
    html: layout(paragraphs([greeting, ...t.body])),
    text: textBlock([greeting, ...t.body]),
  };
}

export function trialConfirmation(input: { to: string; name: string; date: string }): Mail {
  const t = mails.trialConfirmation;
  const greeting = fill(t.greeting, { name: input.name });
  const body = t.body.map((line) => fill(line, { date: input.date }));
  return {
    to: input.to,
    subject: t.subject,
    html: layout(paragraphs([greeting, ...body])),
    text: textBlock([greeting, ...body]),
  };
}

export function trialNotification(input: {
  to: string[];
  name: string;
  email: string;
  date: string;
  rows: Array<[string, string]>;
}): Mail {
  const t = mails.trialNotification;
  return {
    to: input.to,
    replyTo: input.email,
    subject: fill(t.subject, { name: input.name, date: input.date }),
    html: layout(`<p style="margin:0 0 24px;font-size:14px;color:${SLATE};">${escapeHtml(t.intro)}</p>${detailRows(input.rows)}`),
    text: [t.intro, "", ...input.rows.map(([label, value]) => `${label}: ${value}`)].join("\n"),
  };
}

export function forumPendingNotification(input: { to: string[]; author: string; title: string; adminUrl?: string }): Mail {
  const t = mails.forumPending;
  const body = fill(t.body, { author: input.author, title: input.title });
  const url = input.adminUrl ?? `${siteUrl}/club/admin/forum`;
  return {
    to: input.to,
    subject: t.subject,
    html: layout(paragraphs([body]) + button(t.button, url)),
    text: textBlock([body, `${t.button}: ${url}`]),
  };
}

export function newMessageMail(input: { to: string; name: string; sender: string; url: string }): Mail {
  const t = mails.newMessage;
  const greeting = fill(t.greeting, { name: input.name });
  const body = t.body.map((line) => fill(line, { sender: input.sender }));
  const note = `<p style="margin:0;font-size:13px;color:${SLATE};">${escapeHtml(t.note)}</p>`;
  return {
    to: input.to,
    subject: fill(t.subject, { sender: input.sender }),
    html: layout(paragraphs([greeting, ...body]) + button(t.button, input.url) + note),
    text: textBlock([greeting, ...body, `${t.button}: ${input.url}`, t.note]),
  };
}
