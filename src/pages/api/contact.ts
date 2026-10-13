/**
 * POST /api/contact — contact form endpoint (Vercel serverless function).
 *
 * Accepts JSON (from the enhanced form) or application/x-www-form-urlencoded (no-JS fallback).
 * Security: same-origin / allow-listed Origin check (CSRF), CORS limited to allowed origins,
 * per-IP rate limiting, honeypot + timing trap, strict server-side validation, HTML-escaped email.
 * Delivery: Resend's HTTP API when RESEND_API_KEY is set; otherwise a 503 with a direct-email
 * fallback so enquiries are never silently lost.
 */
import type { APIRoute } from 'astro';
import { ALLOWED_ORIGINS, CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL, RESEND_API_KEY } from 'astro:env/server';
import { site } from '@/config/site';
import { renderEmail, validateContact } from '@/lib/contact';
import { clientKey, createRateLimiter, isAllowedOrigin } from '@/lib/rate-limit';

export const prerender = false;

const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });
const MAX_BODY_BYTES = 16 * 1024;

function corsHeaders(origin: string | null): Record<string, string> {
  if (!origin || !isAllowedOrigin(origin, ALLOWED_ORIGINS, site.url)) return { Vary: 'Origin' };
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  };
}

function respond(request: Request, status: number, body: Record<string, unknown>, extra: Record<string, string> = {}): Response {
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json') || (request.headers.get('content-type') ?? '').includes('application/json');
  const headers = { 'Cache-Control': 'no-store', ...corsHeaders(request.headers.get('origin')), ...extra };
  if (!wantsJson) {
    // No-JS form post: send the visitor back to the contact page with a status flag.
    const flag = body.ok ? 'sent=1' : `error=${encodeURIComponent(String(body.code ?? 'invalid'))}`;
    return new Response(null, { status: 303, headers: { ...headers, Location: `/contact?${flag}#enquiry` } });
  }
  return new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8' } });
}

async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  const length = Number(request.headers.get('content-length') ?? 0);
  if (length > MAX_BODY_BYTES) return null;
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return null;
  const type = request.headers.get('content-type') ?? '';
  try {
    if (type.includes('application/json')) {
      const parsed: unknown = JSON.parse(text);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
    }
    if (type.includes('application/x-www-form-urlencoded')) return Object.fromEntries(new URLSearchParams(text));
  } catch {
    return null;
  }
  return null;
}

async function sendEmail(data: ReturnType<typeof validateContact>['data']): Promise<boolean> {
  if (!RESEND_API_KEY) return false;
  const { subject, text, html } = renderEmail(data);
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: CONTACT_FROM_EMAIL ?? `Akrostech Website <website@${new URL(site.url).hostname.replace(/^www\./, '')}>`,
      to: [CONTACT_TO_EMAIL ?? site.email],
      reply_to: data.email,
      subject,
      text,
      html,
    }),
    signal: AbortSignal.timeout(8000),
  });
  return res.ok;
}

export const OPTIONS: APIRoute = ({ request }) => new Response(null, { status: 204, headers: corsHeaders(request.headers.get('origin')) });

export const POST: APIRoute = async ({ request }) => {
  const origin = request.headers.get('origin');
  if (!isAllowedOrigin(origin ?? request.headers.get('referer'), ALLOWED_ORIGINS, site.url)) {
    return respond(request, 403, { ok: false, code: 'origin', message: 'This form can only be submitted from our website.' });
  }

  const wait = limiter.hit(clientKey(request.headers));
  if (wait > 0) {
    return respond(
      request,
      429,
      { ok: false, code: 'rate', message: `Too many messages in a short time. Please try again in ${Math.ceil(wait / 60)} minutes, or email ${site.email}.` },
      { 'Retry-After': String(wait) },
    );
  }

  const raw = await readBody(request);
  if (!raw) return respond(request, 400, { ok: false, code: 'body', message: 'We could not read that submission. Please try again.' });

  const result = validateContact(raw);
  if (result.spam) return respond(request, 200, { ok: true, message: 'Thanks. We will be in touch within one business day.' });
  if (!result.ok) return respond(request, 422, { ok: false, code: 'invalid', message: 'Please check the highlighted fields.', errors: result.errors });

  try {
    const sent = await sendEmail(result.data);
    if (!sent) {
      return respond(request, 503, {
        ok: false,
        code: 'unavailable',
        message: `Our form is offline right now. Please email ${site.email} or call ${site.phone} and we will reply today.`,
      });
    }
  } catch (err) {
    console.error('contact: delivery failed', err instanceof Error ? err.message : err);
    return respond(request, 502, { ok: false, code: 'delivery', message: `Something went wrong sending your message. Please email ${site.email}.` });
  }

  return respond(request, 200, { ok: true, message: 'Thanks. A client partner will reply within one business day.' });
};
