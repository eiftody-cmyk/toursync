import { NextResponse } from "next/server";

const GYG_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "X-RateLimit-Limit": "1000",
  "X-RateLimit-Remaining": "999",
};

export function gygJson(body: unknown, init?: ResponseInit): NextResponse {
  return NextResponse.json(body, {
    ...init,
    headers: { ...GYG_HEADERS, ...init?.headers },
  });
}
