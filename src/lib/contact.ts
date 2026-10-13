/**
 * Contact form validation. Shared by the serverless endpoint (authoritative) and the browser
 * (instant feedback). Pure and dependency-free.
 */

export const SERVICE_OPTIONS = [
  'Virtual assistance',
  'Recruitment process outsourcing',
  'Accounting assistance',
  'Legal process outsourcing',
  'Website development',
  'Not sure yet',
] as const;

export const TEAM_SIZES = ['1 person', '2–5 people', '6–10 people', 'More than 10', 'A fixed-scope project'] as const;

export const LIMITS = {
  name: 100,
  email: 254,
  company: 120,
  phone: 30,
  message: 4000,
  messageMin: 20,
} as const;

export interface ContactInput {
  name: string;
  email: string;
  company: string;
  phone: string;
  service: string;
  teamSize: string;
  message: string;
  consent: boolean;
  /** Honeypot. Real people never see or fill it. */
  website: string;
  /** Milliseconds between render and submit, used to reject instant bot posts. */
  elapsedMs: number;
}

export type ContactField = Exclude<keyof ContactInput, 'website' | 'elapsedMs'>;

export interface ValidationResult {
  ok: boolean;
  data: ContactInput;
  errors: Partial<Record<ContactField, string>>;
  /** True for honeypot / timing traps: respond as success, send nothing. */
  spam: boolean;
}

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;
const PHONE = /^[+()\d\s.-]{7,30}$/;
// Strip control characters except newline and tab.
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const clean = (value: unknown, max: number): string =>
  String(value ?? '')
    .replace(CONTROL, '')
    .replace(/\r\n?/g, '\n')
    .trim()
    .slice(0, max);

const oneLine = (value: unknown, max: number): string => clean(value, max).replace(/\s+/g, ' ');

export function normalise(raw: Record<string, unknown>): ContactInput {
  return {
    name: oneLine(raw.name, LIMITS.name),
    email: oneLine(raw.email, LIMITS.email).toLowerCase(),
    company: oneLine(raw.company, LIMITS.company),
    phone: oneLine(raw.phone, LIMITS.phone),
    service: oneLine(raw.service, 60),
    teamSize: oneLine(raw.teamSize, 60),
    message: clean(raw.message, LIMITS.message),
    consent: raw.consent === true || raw.consent === 'on' || raw.consent === 'true',
    website: oneLine(raw.website, 200),
    elapsedMs: Number(raw.elapsedMs) || 0,
  };
}

export function validateContact(raw: Record<string, unknown>): ValidationResult {
  const data = normalise(raw);
  const errors: ValidationResult['errors'] = {};

  if (data.name.length < 2) errors.name = 'Please tell us your name.';
  if (!EMAIL.test(data.email)) errors.email = 'Please enter a valid work email, like name@company.com.';
  if (data.phone && !PHONE.test(data.phone)) errors.phone = 'Please use digits, spaces and + ( ) - only.';
  if (!(SERVICE_OPTIONS as readonly string[]).includes(data.service)) errors.service = 'Please choose what you need help with.';
  if (data.teamSize && !(TEAM_SIZES as readonly string[]).includes(data.teamSize)) errors.teamSize = 'Please choose a team size from the list.';
  if (data.message.length < LIMITS.messageMin)
    errors.message = `A sentence or two helps us prepare: at least ${LIMITS.messageMin} characters.`;
  if (!data.consent) errors.consent = 'Please confirm we may contact you about this enquiry.';

  const spam = data.website.length > 0 || (data.elapsedMs > 0 && data.elapsedMs < 2500);

  return { ok: Object.keys(errors).length === 0, data, errors, spam };
}

export const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

export function renderEmail(d: ContactInput): { subject: string; text: string; html: string } {
  const subject = `New enquiry: ${d.service} from ${d.name}${d.company ? `, ${d.company}` : ''}`;
  const rows: [string, string][] = [
    ['Name', d.name],
    ['Email', d.email],
    ['Company', d.company || '—'],
    ['Phone', d.phone || '—'],
    ['Service', d.service],
    ['Team size', d.teamSize || '—'],
  ];
  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${d.message}\n`;
  const html = `<table>${rows
    .map(([k, v]) => `<tr><th align="left" style="padding:4px 12px 4px 0">${k}</th><td>${escapeHtml(v)}</td></tr>`)
    .join('')}</table><p style="white-space:pre-wrap">${escapeHtml(d.message)}</p>`;
  return { subject: subject.slice(0, 200), text, html };
}
