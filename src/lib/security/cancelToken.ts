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
