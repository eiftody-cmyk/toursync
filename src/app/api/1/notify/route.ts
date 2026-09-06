import { NextRequest, NextResponse } from "next/server";
import { verifyGygAuth } from "@/lib/gyg/auth";

export async function POST(req: NextRequest) {
  const authError = verifyGygAuth(req);
  if (authError) return authError;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { errorCode: "VALIDATION_FAILURE", errorMessage: "Invalid JSON body" },
      { status: 200 }
    );
  }

  console.log("[GYG notify] Received notification:", JSON.stringify(body).substring(0, 500));

  return NextResponse.json({ data: {} }, { status: 200 });
}
