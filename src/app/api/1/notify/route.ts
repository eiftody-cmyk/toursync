import { NextRequest } from "next/server";
import { verifyGygAuth } from "@/lib/gyg/auth";
import { gygJson } from "@/lib/gyg/response";

export async function POST(req: NextRequest) {
  const authError = verifyGygAuth(req);
  if (authError) return authError;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return gygJson(
      { errorCode: "VALIDATION_FAILURE", errorMessage: "Invalid JSON body" },
      { status: 200 }
    );
  }

  console.log("[GYG notify] Received notification:", JSON.stringify(body).substring(0, 500));

  return gygJson({ data: {} }, { status: 200 });
}
