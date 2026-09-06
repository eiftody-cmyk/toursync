import { NextRequest } from "next/server";
import type { GygErrorResponse } from "./types";

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
    return new Response(JSON.stringify(error), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "WWW-Authenticate": "Basic realm='GYG Supplier API'",
      },
    });
  }

  const decoded = Buffer.from(authHeader.split(" ")[1], "base64").toString();
  const colonIndex = decoded.indexOf(":");
  const username = colonIndex >= 0 ? decoded.substring(0, colonIndex) : decoded;
  const password = colonIndex >= 0 ? decoded.substring(colonIndex + 1) : "";

  const expectedUser = process.env.GYG_USERNAME;
  const expectedPass = process.env.GYG_PASSWORD;

  if (!expectedUser || !expectedPass) {
    console.error("[GYG auth] GYG_USERNAME or GYG_PASSWORD env var not set");
    const error: GygErrorResponse = {
      errorCode: "INTERNAL_SYSTEM_FAILURE",
      errorMessage: "Server configuration error",
    };
    return new Response(JSON.stringify(error), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Constant-time comparison to prevent timing attacks
  const userMatch = timingSafeEqual(username, expectedUser);
  const passMatch = timingSafeEqual(password, expectedPass);

  if (!userMatch || !passMatch) {
    const error: GygErrorResponse = {
      errorCode: "AUTHORIZATION_FAILURE",
      errorMessage: "Invalid credentials",
    };
    return new Response(JSON.stringify(error), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
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
