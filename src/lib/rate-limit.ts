/**
 * Fixed-window rate limiter keyed by client identifier.
 *
 * In-memory, so it limits per serverless instance: enough to blunt scripted floods against the
 * contact form. For strict global limits, back this interface with Redis or Vercel KV.
 */
export interface RateLimiter {
  /** Returns how many seconds to wait, or 0 when the request is allowed. */
  hit(key: string, now?: number): number;
}

export function createRateLimiter({ limit, windowMs, maxKeys = 5000 }: { limit: number; windowMs: number; maxKeys?: number }): RateLimiter {
  const buckets = new Map<string, { count: number; reset: number }>();
  return {
    hit(key, now = Date.now()) {
      const bucket = buckets.get(key);
      if (!bucket || bucket.reset <= now) {
        if (buckets.size >= maxKeys) {
          for (const [k, b] of buckets) if (b.reset <= now) buckets.delete(k);
          if (buckets.size >= maxKeys) buckets.delete(buckets.keys().next().value as string);
        }
        buckets.set(key, { count: 1, reset: now + windowMs });
        return 0;
      }
      bucket.count += 1;
      return bucket.count > limit ? Math.ceil((bucket.reset - now) / 1000) : 0;
    },
  };
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for / x-real-ip). */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || headers.get('x-real-ip') || 'unknown';
}

/** Parses a comma-separated allow-list and checks an Origin header against it. */
export function isAllowedOrigin(origin: string | null, allowList: string | undefined, siteUrl: string): boolean {
  if (!origin) return false;
  const allowed = new Set(
    [siteUrl, ...(allowList ?? '').split(',')]
      .map((o) => o.trim().replace(/\/$/, ''))
      .filter(Boolean),
  );
  try {
    const normalised = new URL(origin).origin;
    if (allowed.has(normalised)) return true;
    // Local development and Vercel preview deployments of this project.
    const host = new URL(normalised).hostname;
    return host === 'localhost' || host === '127.0.0.1';
  } catch {
    return false;
  }
}
