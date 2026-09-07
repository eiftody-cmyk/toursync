import { NextResponse } from "next/server";

const RATE_LIMIT_HEADERS: Record<string, string> = {
  "X-RateLimit-Limit": "1000",
  "X-RateLimit-Remaining": "999",
};

export function gygJson(body: unknown, init?: ResponseInit): NextResponse {
  return NextResponse.json(body, {
    ...init,
    headers: { ...RATE_LIMIT_HEADERS, ...init?.headers },
  });
}
