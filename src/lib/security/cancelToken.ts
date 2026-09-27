import { createHmac, timingSafeEqual } from "crypto";

const SECRET =
  process.env.BOOKING_TOKEN_SECRET ||
  process.env.CRON_SECRET ||
  process.env.GOOGLE_TOKEN_ENCRYPTION_KEY ||
  "";

function sign(bookingId: string, expiry: number): string {
  return createHmac("sha256", SECRET).update(`${bookingId}:${expiry}`).digest("hex");
}

/** Token that authorizes viewing/cancelling one booking for 48 hours. */
export function createCancelToken(bookingId: string): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + 48 * 60 * 60 * 1000;
  const sig = sign(bookingId, expiresAt);
  return { token: `${expiresAt}.${sig}`, expiresAt };
}

export function verifyCancelToken(bookingId: string, token: string): boolean {
  if (!SECRET || !token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const expiresAt = Number(token.slice(0, dot));
  const sig = token.slice(dot + 1);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
  const expected = sign(bookingId, expiresAt);
  if (sig.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

// ---------------------------------------------------------------------------
// Email-lookup tokens (anti-enumeration for /book/manage)
// ---------------------------------------------------------------------------
// A bot must POST through /api/bookings/lookup (rate-limited + Turnstile) to
// obtain this signature; the GET page only lists bookings when the signature
// matches the email. Fails closed when no secret is configured.

const LOOKUP_TTL_MS = 30 * 60 * 1000;

export function lookupSecretConfigured(): boolean {
  return !!SECRET;
}

export function createLookupToken(email: string): { sig: string; expiresAt: number } {
  const expiresAt = Date.now() + LOOKUP_TTL_MS;
  return { sig: `${expiresAt}.${sign(email, expiresAt)}`, expiresAt };
}

export function verifyLookupToken(
  email: string,
  sig: string | null | undefined
): boolean {
  if (!SECRET || !email || !sig) return false;
  const dot = sig.indexOf(".");
  if (dot <= 0) return false;
  const expiresAt = Number(sig.slice(0, dot));
  const provided = sig.slice(dot + 1);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
  const expected = sign(email, expiresAt);
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}
