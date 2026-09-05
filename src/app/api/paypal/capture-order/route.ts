import { NextRequest, NextResponse } from "next/server";
import { captureOrder } from "@/lib/paypal/client";

export async function POST(req: NextRequest) {
  const { orderId } = await req.json();

  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await captureOrder(orderId);

    // Extract custom_id from the captured order to get booking details
    const customId =
      result?.purchase_units?.[0]?.custom_id ?? null;

    let bookingDetails = null;
    if (customId) {
      const parts = customId.split("|");
      if (parts.length >= 4) {
        const [tourId, date, startTime, guestCountStr] = parts;
        bookingDetails = {
          tourId,
          date,
          startTime: startTime || null,
          guestCount: parseInt(guestCountStr, 10),
        };
      }
    }

    return NextResponse.json({
      status: result.status,
      payer: result.payer,
      bookingDetails,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[PayPal] capture order failed:", msg);
    return NextResponse.json({ error: "Failed to capture order" }, { status: 500 });
  }
}
