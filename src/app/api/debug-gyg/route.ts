import { NextResponse } from "next/server";

export async function GET() {
  const u = process.env.GYG_INBOUND_USERNAME;
  const p = process.env.GYG_INBOUND_PASSWORD;
  return NextResponse.json({
    usernameSet: !!u,
    usernameLength: u?.length,
    passwordSet: !!p,
    passwordLength: p?.length,
  });
}
