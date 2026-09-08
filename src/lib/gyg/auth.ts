import { NextRequest } from "next/server";
import type { GygErrorResponse } from "./types";
import { gygJson } from "./response";

/**
 * Verify GYG Basic Auth credentials.
 * Returns null if valid, or a GYG-format error response if invalid.
 * GYG requires HTTP 200 even for auth errors — error goes in JSON body.
 */
export function verifyGygAuth(
  req: NextRequest
): Response | null {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    const error: GygErrorResponse = {
      errorCode: "AUTHORIZATION_FAILURE",
      errorMessage: "Missing or invalid Authorization header",
    };
    return gygJson(error, {
      status: 200,
      headers: { "WWW-Authenticate": "Basic realm='GYG Supplier API'" },
    });
  }

  const decoded = atob(authHeader.split(" ")[1]);
  const colonIndex = decoded.indexOf(":");
  const username = colonIndex >= 0 ? decoded.substring(0, colonIndex) : decoded;
  const password = colonIndex >= 0 ? decoded.substring(colonIndex + 1) : "";

  const testUser = process.env.GYG_INBOUND_USERNAME || "";
  const testPass = process.env.GYG_INBOUND_PASSWORD || "";
  const prodUser = process.env.GYG_PROD_USERNAME || "";
  const prodPass = process.env.GYG_PROD_PASSWORD || "";

  if ((!testUser && !prodUser) || (!testPass && !prodPass)) {
    console.error("[GYG auth] No GYG credentials configured");
    const error: GygErrorResponse = {
      errorCode: "INTERNAL_SYSTEM_FAILURE",
      errorMessage: "Server configuration error",
    };
    return gygJson(error, { status: 200 });
  }

  // Accept test OR production credentials
  const testMatch = testUser && testPass && timingSafeEqual(username, testUser) && timingSafeEqual(password, testPass);
  const prodMatch = prodUser && prodPass && timingSafeEqual(username, prodUser) && timingSafeEqual(password, prodPass);

  if (!testMatch && !prodMatch) {
    console.error("[GYG auth] Invalid credentials");
    const error: GygErrorResponse = {
      errorCode: "AUTHORIZATION_FAILURE",
      errorMessage: "Invalid credentials",
    };
    return gygJson(error, { status: 200 });
  }

  return null; // valid
}

/** Constant-time string comparison */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still iterate to avoid length-based timing leak
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
