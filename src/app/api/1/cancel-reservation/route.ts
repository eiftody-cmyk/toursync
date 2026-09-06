import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyGygAuth } from "@/lib/gyg/auth";
import type { GygEmptySuccessResponse, GygErrorResponse } from "@/lib/gyg/types";

export async function POST(req: NextRequest) {
  const authError = verifyGygAuth(req);
  if (authError) return authError;

  const body = await req.json();
  const data = body?.data;

  if (!data?.reservationReference || !data?.gygBookingReference) {
    return NextResponse.json(
      { errorCode: "VALIDATION_FAILURE", errorMessage: "Missing required fields: reservationReference, gygBookingReference" },
      { status: 200 }
    );
  }

  const supabase = await createClient();

  // Delete the reservation
  const { error } = await supabase
    .from("gyg_reservations")
    .delete()
    .eq("reservation_reference", data.reservationReference);

  if (error) {
    console.error("[GYG cancel-reservation] Delete failed:", error.message);
    return NextResponse.json(
      { errorCode: "INTERNAL_SYSTEM_FAILURE", errorMessage: "Failed to cancel reservation" },
      { status: 200 }
    );
  }

  const response: GygEmptySuccessResponse = { data: {} };
  return NextResponse.json(response, { status: 200 });
}
