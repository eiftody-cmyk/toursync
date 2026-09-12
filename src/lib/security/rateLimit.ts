// Lightweight in-memory rate limiter.
// Runs in a single Worker isolate (module scope), which is acceptable per-isolate
// protection for the PayPal/auth/webhook surfaces. Resets on isolate restart.

const windowMs = 60 * 1000;
const buckets = new Map<string, { count: number; resetAt: number }>();

export function clientIp(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown"
  );
}

export function rateLimit(
  key: string,
  max: number,
  now = Date.now()
): { ok: boolean; remaining: number; retryAfterSeconds: number } {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }

  if (bucket.count >= max) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  buckets.set(key, bucket);
  return { ok: true, remaining: max - bucket.count, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
}