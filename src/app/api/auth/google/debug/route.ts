import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const origin = new URL(request.url).origin;
  return NextResponse.json({
    origin,
    redirect_uri: `${origin}/api/auth/google/callback`,
    client_id: process.env.GOOGLE_CLIENT_ID ?? null,
    env_redirect_uri: process.env.GOOGLE_REDIRECT_URI ?? null,
  });
}