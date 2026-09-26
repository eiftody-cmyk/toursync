import { createServiceClient } from "@/lib/supabase/service";
import { formatTime } from "@/lib/time";
import { verifyCancelToken } from "@/lib/security/cancelToken";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Your Booking — Osaka Castle Walks with Edward",
  other: {
    referrer: "no-referrer",
  },
};

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function canCancelByDate(date: string, startTime: string | null): boolean {
  const start = (startTime ?? "00:00").slice(0, 5);
  const startAbs = Date.parse(`${date}T${start}:00+09:00`);
  if (Number.isNaN(startAbs)) return false;
  return startAbs - Date.now() > 24 * 60 * 60 * 1000;
}

function manageHref(opts: {
  id?: string;
  email?: string;
  token?: string | null;
  action?: string;
}): string {
  const qs = new URLSearchParams();
  if (opts.id) qs.set("id", opts.id);
  if (opts.email) qs.set("email", opts.email);
  if (opts.token) qs.set("token", opts.token);
  if (opts.action) qs.set("action", opts.action);
  const s = qs.toString();
  return s ? `/book/manage?${s}` : "/book/manage";
}

export default async function BookingManagePage({
  searchParams,
}: {
  searchParams: Promise<{
    id?: string;
    email?: string;
    token?: string;
    action?: string;
    cancelled?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = createServiceClient();
  const token = params.token?.trim() || null;

  // Single booking view
  if (params.id) {
    const { data: booking } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", params.id)
      .single();

    if (!booking) {
      return (
        <div className="min-h-screen bg-muted/20 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center space-y-4">
              <p className="text-sm text-muted-foreground">Booking not found.</p>
              <Button asChild size="sm">
                <Link href="/book/manage">Look up a booking</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    const tokenOk = token ? verifyCancelToken(booking.id, token) : false;
    const emailOk =
      !!params.email &&
      !!booking.customer_email &&
      params.email.trim().toLowerCase() === booking.customer_email.trim().toLowerCase();
    const authorized = tokenOk || emailOk;

    const { data: tour } = await supabase
      .from("tours")
      .select("name, price, currency")
      .eq("id", booking.tour_id)
      .single();

    const cancelable =
      booking.status === "confirmed" && canCancelByDate(booking.date, booking.start_time);

    const detailHref = manageHref({ id: booking.id, email: params.email, token });
    const cancelHref = manageHref({ id: booking.id, email: params.email, token, action: "cancel" });

    return (
      <div className="min-h-screen bg-muted/20">
        <header className="border-b bg-card/50">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <Link href="/" className="font-bold text-lg">ExperienceRelay</Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          {params.action === "cancel" && booking.status === "confirmed" && authorized ? (
            <Card className="border-amber-300">
              <CardHeader>
                <CardTitle className="text-base">Cancel Booking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  Are you sure you want to cancel this booking?
                </p>
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <p><strong>{tour?.name}</strong></p>
                  <p className="text-muted-foreground">
                    {formatDate(booking.date)}
                    {booking.start_time && ` at ${formatTime(booking.start_time)}`}
                    {" · "}{booking.guest_count} guest{booking.guest_count !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form
                    action="/api/bookings/cancel"
                    method="POST"
                  >
                    <input type="hidden" name="booking_id" value={booking.id} />
                    {token && tokenOk ? (
                      <input type="hidden" name="token" value={token} />
                    ) : booking.customer_email ? (
                      <input type="hidden" name="email" value={booking.customer_email} />
                    ) : null}
                    <Button variant="destructive" size="sm" type="submit">
                      Yes, Cancel
                    </Button>
                  </form>
                  <Button asChild size="sm" variant="outline">
                    <Link href={detailHref}>Keep Booking</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : params.action === "cancel" && booking.status === "confirmed" && !authorized ? (
            <Card className="border-amber-300">
              <CardHeader>
                <CardTitle className="text-base">Confirm It&apos;s You</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  Open the manage link from your confirmation email (with its access token),
                  or look up this booking with the email you booked with.
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link href="/book/manage">Look up by email</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  Booking Details
                  <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                    {booking.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {params.cancelled === "true" && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                    Your booking has been cancelled. A confirmation email has been sent to {booking.customer_email}.
                  </div>
                )}
                {params.error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                    {params.error === "too_late" && "This booking cannot be cancelled (less than 24 hours until tour start)."}
                    {params.error === "already_cancelled" && "This booking is already cancelled."}
                    {params.error === "cancel_failed" && "Failed to cancel booking. Please try again."}
                    {params.error === "not_found" && "Booking not found."}
                    {params.error === "unauthorized" && "We couldn't verify this booking. Use the link from your email or look it up by email."}
                  </div>
                )}
                <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                  <p><strong>{tour?.name}</strong></p>
                  <p className="text-muted-foreground">
                    {formatDate(booking.date)}
                    {booking.start_time && ` at ${formatTime(booking.start_time)}`}
                  </p>
                  <p className="text-muted-foreground">
                    {booking.guest_count} guest{booking.guest_count !== 1 ? "s" : ""}
                  </p>
                  {tour?.price && (
                    <p className="text-muted-foreground">
                      Total: {tour.currency === "JPY" ? "¥" : tour.currency + " "}
                      {(tour.price * booking.guest_count).toLocaleString()}
                    </p>
                  )}
                </div>

                {booking.status === "confirmed" && cancelable && authorized && (
                  <Button asChild size="sm" variant="destructive">
                    <Link href={cancelHref}>Cancel Booking</Link>
                  </Button>
                )}

                {booking.status === "confirmed" && cancelable && !authorized && (
                  <div className="space-y-2">
                    <Button asChild size="sm" variant="destructive">
                      <Link href={cancelHref}>Cancel Booking</Link>
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      You&apos;ll need the link from your confirmation email or your booking email to confirm.
                    </p>
                  </div>
                )}

                {booking.status === "confirmed" && !cancelable && (
                  <p className="text-xs text-muted-foreground">
                    This booking cannot be cancelled (less than 24 hours until tour start).
                  </p>
                )}

                <Button asChild size="sm" variant="outline">
                  <Link href="/book/manage">Look Up Another Booking</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    );
  }

  // Email lookup view
  if (params.email) {
    const email = params.email.trim();
    const { data: bookings } = await supabase
      .from("bookings")
      .select("*")
      .eq("customer_email", email)
      .order("date", { ascending: true });

    const tourIds = [...new Set((bookings ?? []).map((b) => b.tour_id))];
    const { data: tours } = tourIds.length > 0
      ? await supabase.from("tours").select("id, name, price, currency").in("id", tourIds)
      : { data: [] };
    const tourMap = new Map((tours ?? []).map((t) => [t.id, t]));

    return (
      <div className="min-h-screen bg-muted/20">
        <header className="border-b bg-card/50">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <Link href="/" className="font-bold text-lg">ExperienceRelay</Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <h1 className="text-2xl font-bold">Your Bookings</h1>
          <p className="text-sm text-muted-foreground">
            Bookings for: {email}
          </p>

          {!bookings || bookings.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                No bookings found for this email.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => {
                const tour = tourMap.get(b.tour_id);
                return (
                  <Card key={b.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{tour?.name ?? "Tour"}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(b.date)}
                            {b.start_time && ` at ${formatTime(b.start_time)}`}
                            {" · "}{b.guest_count} guest{b.guest_count !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <Badge variant={b.status === "confirmed" ? "default" : "secondary"}>
                          {b.status}
                        </Badge>
                      </div>
                      <div className="mt-3">
                        <Button asChild size="sm" variant="outline">
                          <Link href={manageHref({ id: b.id, email })}>View Details</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    );
  }

  // Default: email entry form
  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-base">Manage Your Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action="/book/manage"
            method="GET"
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium">Email address used for booking</label>
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>
            <Button type="submit" className="w-full" size="sm">
              Find My Bookings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
