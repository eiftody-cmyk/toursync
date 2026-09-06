import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ManageBooking {
  id: string;
  tour_name: string;
  date: string;
  start_time: string | null;
  guest_count: number;
  status: string;
  currency: string;
  price: number | null;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BookingManagePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; email?: string; action?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // Single booking view
  if (params.id) {
    const { data: booking } = await supabase
      .from("bookings")
      .select("*, tours(name, price, currency)")
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

    const tour = booking.tours;
    const canCancel =
      booking.status === "confirmed" &&
      (() => {
        const [y, m, d] = booking.date.split("-").map(Number);
        const startTime = booking.start_time || "00:00";
        const [h, min] = startTime.split(":").map(Number);
        const tourStart = new Date(y, m - 1, d, h, min);
        const now = new Date();
        return tourStart.getTime() - now.getTime() > 24 * 60 * 60 * 1000;
      })();

    return (
      <div className="min-h-screen bg-muted/20">
        <header className="border-b bg-card/50">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <Link href="/" className="font-bold text-lg">ExperienceRelay</Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          {params.action === "cancel" && booking.status === "confirmed" ? (
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
                    {booking.start_time && ` at ${booking.start_time}`}
                    {" · "}{booking.guest_count} guest{booking.guest_count !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form
                    action="/api/bookings/cancel"
                    method="POST"
                  >
                    <input type="hidden" name="booking_id" value={booking.id} />
                    <Button variant="destructive" size="sm" type="submit">
                      Yes, Cancel
                    </Button>
                  </form>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/book/manage?id=${booking.id}`}>Keep Booking</Link>
                  </Button>
                </div>
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
                <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                  <p><strong>{tour?.name}</strong></p>
                  <p className="text-muted-foreground">
                    {formatDate(booking.date)}
                    {booking.start_time && ` at ${booking.start_time}`}
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

                {booking.status === "confirmed" && canCancel && (
                  <Button asChild size="sm" variant="destructive">
                    <Link href={`/book/manage?id=${booking.id}&action=cancel`}>
                      Cancel Booking
                    </Link>
                  </Button>
                )}

                {booking.status === "confirmed" && !canCancel && (
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
    const { data: bookings } = await supabase
      .from("bookings")
      .select("*, tours(name, price, currency)")
      .eq("customer_email", params.email)
      .order("date", { ascending: true });

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
            Bookings for: {params.email}
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
                const tour = b.tours;
                return (
                  <Card key={b.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{tour?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(b.date)}
                            {b.start_time && ` at ${b.start_time}`}
                            {" · "}{b.guest_count} guest{b.guest_count !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <Badge variant={b.status === "confirmed" ? "default" : "secondary"}>
                          {b.status}
                        </Badge>
                      </div>
                      <div className="mt-3">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/book/manage?id=${b.id}`}>View Details</Link>
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
