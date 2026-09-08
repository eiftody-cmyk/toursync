import { NextRequest } from "next/server";

/**
 * Verify Viator API key authentication.
 * Returns null if valid, or a Response with error if invalid.
 */
export function verifyViatorAuth(req: NextRequest): Response | null {
  const apiKey = req.headers.get("x-api-key");
  const expectedKey = process.env.VIATOR_API_KEY;

  if (!expectedKey) {
    console.error("[Viator auth] VIATOR_API_KEY not configured");
    return Response.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  if (!apiKey) {
    return Response.json(
      { error: "Missing X-Api-Key header" },
      { status: 401 }
    );
  }

  if (!timingSafeEqual(apiKey, expectedKey)) {
    console.error("[Viator auth] Invalid API key");
    return Response.json(
      { error: "Invalid API key" },
      { status: 401 }
    );
  }

  return null; // valid
}

/** Constant-time string comparison */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    let result = a.length ^ b.length;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ (b.charCodeAt(i % b.length) || 0);
    }
    return result === 0;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
