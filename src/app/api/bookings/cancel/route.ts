import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const bookingId = formData.get("booking_id") as string;

  if (!bookingId) {
    return NextResponse.json({ error: "booking_id required" }, { status: 400 });
  }

  const supabase = await createClient();

  // Get the booking
  const { data: booking } = await supabase
    .from("bookings")
    .select("*, tours(capacity, google_calendar_id)")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    return NextResponse.redirect(new URL("/book/manage?error=not_found", req.url));
  }

  if (booking.status !== "confirmed") {
    return NextResponse.redirect(new URL(`/book/manage?id=${bookingId}&error=already_cancelled`, req.url));
  }

  // Check 24-hour cancellation policy
  const [y, m, d] = booking.date.split("-").map(Number);
  const startTime = booking.start_time || "00:00";
  const [h, min] = startTime.split(":").map(Number);
  const tourStart = new Date(y, m - 1, d, h, min);
  const now = new Date();

  if (tourStart.getTime() - now.getTime() <= 24 * 60 * 60 * 1000) {
    return NextResponse.redirect(
      new URL(`/book/manage?id=${bookingId}&error=too_late`, req.url)
    );
  }

  // Cancel the booking
  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId);

  if (error) {
    console.error("[Booking cancel] Failed:", error.message);
    return NextResponse.redirect(new URL(`/book/manage?id=${bookingId}&error=cancel_failed`, req.url));
  }

  // Check if we should un-auto-block
  // If the date/time is now below capacity, remove the auto-block
  const { data: tour } = await supabase
    .from("tours")
    .select("capacity")
    .eq("id", booking.tour_id)
    .single();

  const { data: remainingBookings } = await supabase
    .from("bookings")
    .select("guest_count")
    .eq("tour_id", booking.tour_id)
    .eq("date", booking.date)
    .eq("start_time", booking.start_time || null)
    .eq("status", "confirmed");

  const totalBooked = (remainingBookings ?? []).reduce(
    (sum, b) => sum + (b.guest_count ?? 0),
    0
  );

  if (tour && totalBooked < tour.capacity) {
    // Find and remove the auto-block if it exists
    const { data: autoBlock } = await supabase
      .from("blocked_dates")
      .select("id, google_calendar_event_id, calendar_id")
      .eq("tour_id", booking.tour_id)
      .eq("date", booking.date)
      .eq("start_time", booking.start_time || null)
      .eq("is_auto_blocked", true)
      .maybeSingle();

    if (autoBlock) {
      // Delete from Google Calendar if connected
      if (autoBlock.google_calendar_event_id && autoBlock.calendar_id) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://toursync1.vercel.app";
          await fetch(`${baseUrl}/api/calendar/unblock`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tour_id: booking.tour_id,
              date: booking.date,
              start_time: booking.start_time || null,
            }),
          });
        } catch (e) {
          console.error("[Booking cancel] Un-auto-block calendar failed:", e);
        }
      }
    }
  }

  return NextResponse.redirect(
    new URL(`/book/manage?id=${bookingId}&cancelled=true`, req.url)
  );
}
