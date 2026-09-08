import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyGygAuth } from "@/lib/gyg/auth";
import { createGygLogger, logResponse } from "@/lib/gyg/logger";
import { gygJson } from "@/lib/gyg/response";
import type { GygEmptySuccessResponse, GygErrorResponse } from "@/lib/gyg/types";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const ctx = createGygLogger("cancel-reservation", req);

  try {
    return await POST_inner(req, startTime, ctx);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[GYG cancel-reservation] Unhandled error:", msg);
    const err = { errorCode: "INTERNAL_SYSTEM_FAILURE" as const, errorMessage: "Internal system failure" };
    logResponse(ctx, 200, err, startTime);
    return gygJson(err, { status: 200 });
  }
}

async function POST_inner(req: NextRequest, startTime: number, ctx: ReturnType<typeof createGygLogger>) {
  const authError = verifyGygAuth(req);
  if (authError) {
    logResponse(ctx, 200, { errorCode: "AUTHORIZATION_FAILURE" }, startTime);
    return authError;
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return gygJson(
      { errorCode: "VALIDATION_FAILURE", errorMessage: "Invalid JSON body" },
      { status: 200 }
    );
  }
  const bodyObj = (body ?? {}) as Record<string, unknown>;
  const data = bodyObj.data && typeof bodyObj.data === "object" ? bodyObj.data as Record<string, unknown> : bodyObj;
  const requestData = data;

  if (!requestData?.reservationReference || !requestData?.gygBookingReference) {
    return gygJson(
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
    return gygJson(
      { errorCode: "INTERNAL_SYSTEM_FAILURE", errorMessage: "Failed to cancel reservation" },
      { status: 200 }
    );
  }

  const response: GygEmptySuccessResponse = { data: {} };
  logResponse(ctx, 200, response, startTime);
  return gygJson(response, { status: 200 });
}
