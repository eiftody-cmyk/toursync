import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyGygAuth } from "@/lib/gyg/auth";
import { createGygLogger, logResponse } from "@/lib/gyg/logger";
import type { GygEmptySuccessResponse, GygErrorResponse } from "@/lib/gyg/types";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const ctx = createGygLogger("cancel-reservation", req);

  const authError = verifyGygAuth(req);
  if (authError) {
    logResponse(ctx, 200, { errorCode: "AUTHORIZATION_FAILURE" }, startTime);
    return authError;
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { errorCode: "VALIDATION_FAILURE", errorMessage: "Invalid JSON body" },
      { status: 200 }
    );
  }
  const data = (body as Record<string, unknown>) as { data?: Record<string, unknown> } | undefined;
  const requestData = data?.data;

  if (!requestData?.reservationReference || !requestData?.gygBookingReference) {
    return NextResponse.json(
      { errorCode: "VALIDATION_FAILURE", errorMessage: "Missing required fields: reservationReference, gygBookingReference" },
      { status: 200 }
    );
  }

  const supabase = createServiceClient();

  // Delete the reservation
  const { error } = await supabase
    .from("gyg_reservations")
    .delete()
    .eq("reservation_reference", requestData.reservationReference);

  if (error) {
    console.error("[GYG cancel-reservation] Delete failed:", error.message);
    return NextResponse.json(
      { errorCode: "INTERNAL_SYSTEM_FAILURE", errorMessage: "Failed to cancel reservation" },
      { status: 200 }
    );
  }

  const response: GygEmptySuccessResponse = { data: {} };
  logResponse(ctx, 200, response, startTime);
  return NextResponse.json(response, { status: 200 });
}
