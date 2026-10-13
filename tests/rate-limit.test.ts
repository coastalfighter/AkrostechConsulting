import { describe, expect, it } from 'vitest';
import { clientKey, createRateLimiter, isAllowedOrigin } from '@/lib/rate-limit';

describe('createRateLimiter', () => {
  it('allows up to the limit, then asks the client to wait', () => {
    const rl = createRateLimiter({ limit: 2, windowMs: 60_000 });
    expect(rl.hit('a', 0)).toBe(0);
    expect(rl.hit('a', 1)).toBe(0);
    expect(rl.hit('a', 2)).toBe(60);
    expect(rl.hit('b', 2)).toBe(0);
  });

  it('resets after the window', () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 1000 });
    rl.hit('a', 0);
    expect(rl.hit('a', 500)).toBeGreaterThan(0);
    expect(rl.hit('a', 1001)).toBe(0);
  });

  it('caps memory by evicting old keys', () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 1000, maxKeys: 2 });
    rl.hit('a', 0);
    rl.hit('b', 0);
    expect(() => rl.hit('c', 0)).not.toThrow();
  });
});

describe('request helpers', () => {
  it('reads the client key from proxy headers', () => {
    expect(clientKey(new Headers({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' }))).toBe('203.0.113.9');
    expect(clientKey(new Headers())).toBe('unknown');
  });

  it('checks origins against the site and allow-list', () => {
    const site = 'https://www.akrosstech.com';
    expect(isAllowedOrigin('https://www.akrosstech.com', undefined, site)).toBe(true);
    expect(isAllowedOrigin('https://www.akrosstech.com/contact?x=1', undefined, site)).toBe(true);
    expect(isAllowedOrigin('https://akrosstech.com', 'https://akrosstech.com, https://preview.example', site)).toBe(true);
    expect(isAllowedOrigin('https://evil.example', 'https://akrosstech.com', site)).toBe(false);
    expect(isAllowedOrigin(null, undefined, site)).toBe(false);
    expect(isAllowedOrigin('not a url', undefined, site)).toBe(false);
  });
});
