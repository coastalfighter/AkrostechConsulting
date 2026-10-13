import { describe, expect, it } from 'vitest';
import { escapeHtml, renderEmail, validateContact } from '@/lib/contact';

const valid = {
  name: 'Dana Whitfield',
  email: 'Dana@Example.com',
  company: 'Northwind',
  phone: '+1 (302) 555-0142',
  service: 'Accounting assistance',
  teamSize: '1 person',
  message: 'We need help closing the books each month across two entities.',
  consent: 'on',
  website: '',
  elapsedMs: 12000,
};

describe('validateContact', () => {
  it('accepts a complete enquiry and normalises it', () => {
    const r = validateContact(valid);
    expect(r.ok).toBe(true);
    expect(r.spam).toBe(false);
    expect(r.data.email).toBe('dana@example.com');
    expect(r.data.consent).toBe(true);
  });

  it('reports each invalid field with a helpful message', () => {
    const r = validateContact({ ...valid, name: 'D', email: 'nope', service: 'Hacking', message: 'hi', consent: false, phone: 'call me' });
    expect(r.ok).toBe(false);
    expect(Object.keys(r.errors).sort()).toEqual(['consent', 'email', 'message', 'name', 'phone', 'service']);
  });

  it('allows optional fields to be empty', () => {
    const r = validateContact({ ...valid, company: '', phone: '', teamSize: '' });
    expect(r.ok).toBe(true);
  });

  it('flags honeypot and too-fast submissions as spam', () => {
    expect(validateContact({ ...valid, website: 'http://spam.example' }).spam).toBe(true);
    expect(validateContact({ ...valid, elapsedMs: 300 }).spam).toBe(true);
  });

  it('strips control characters and truncates oversized input', () => {
    const r = validateContact({ ...valid, name: `Dana\u0000 Whit\u0007field${'x'.repeat(500)}`, message: 'y'.repeat(10_000) });
    expect(r.data.name).not.toMatch(/[\u0000\u0007]/);
    expect(r.data.name.length).toBeLessThanOrEqual(100);
    expect(r.data.message.length).toBe(4000);
  });
});

describe('email rendering', () => {
  it('escapes HTML in user content', () => {
    expect(escapeHtml('<img src=x onerror=alert(1)>')).toBe('&lt;img src=x onerror=alert(1)&gt;');
    const { html, subject } = renderEmail(validateContact({ ...valid, message: '<script>alert(1)</script> and more text here' }).data);
    expect(html).not.toContain('<script>');
    expect(subject).toContain('Accounting assistance');
  });
});
