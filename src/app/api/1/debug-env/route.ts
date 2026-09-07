import { NextResponse } from "next/server";

export async function GET() {
  const username = process.env.GYG_USERNAME;
  const password = process.env.GYG_PASSWORD;

  // Show first/last chars only to verify without leaking
  return NextResponse.json({
    username: username ?? "NOT SET",
    passwordSet: !!password,
    passwordPreview: password ? `${password.substring(0, 4)}...${password.substring(password.length - 4)}` : "NOT SET",
    passwordLength: password?.length ?? 0,
  });
}
