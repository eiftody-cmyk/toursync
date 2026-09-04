import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { todayJST } from "@/lib/time";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [toursResult, bookingsResult, blockedResult, tokensResult] =
    await Promise.all([
      supabase.from("tours").select("*").eq("user_id", user.id).order("created_at"),
      supabase.from("bookings").select("*").eq("user_id", user.id).order("date", { ascending: true }).limit(20),
      supabase.from("blocked_dates").select("*").eq("user_id", user.id).order("date", { ascending: true }).limit(200),
      supabase.from("google_tokens").select("calendar_id, token_expiry").eq("user_id", user.id).maybeSingle(),
    ]);

  const tours = toursResult.data;
  const bookings = bookingsResult.data;
  const blocked = blockedResult.data;
  const tokens = tokensResult.data;

  const today = todayJST();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/tours">Manage Tours</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/calendar">Open Calendar</Link>
          </Button>
        </div>
      </div>

      {!tokens && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6 text-sm">
            <strong>Connect Google Calendar</strong> to sync blocks to Airbnb.
            <Button asChild size="sm" className="ml-3">
              <a href="/api/auth/google">Connect</a>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Tours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{tours?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Active tours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{bookings?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Recent bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Blocked Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{blocked?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Total blocks (incl. auto)</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Your Tours</h2>
        {!tours || tours.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              No tours yet.{" "}
              <Link href="/tours" className="underline text-primary">
                Create your first tour
              </Link>{" "}
              (e.g. &quot;Warrior Monks, a Peasant, and a Shogun&quot; — capacity 6).
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {tours.map((tour) => {
              const tourBookings =
                bookings?.filter((b) => b.tour_id === tour.id) ?? [];
              // quick capacity for next date example
              return (
                <Card key={tour.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      {tour.name}
                      <Badge variant="secondary">{tour.capacity} max</Badge>
                    </CardTitle>
                    {tour.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {tour.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p className="text-muted-foreground">
                      {tour.price ? `${tour.price} ${tour.currency}` : "Price not set"} ·{" "}
                      {tourBookings.length} booking{tourBookings.length !== 1 && "s"} recorded
                    </p>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/calendar?tour=${tour.id}`}>View Calendar</Link>
                      </Button>
                      <Button asChild size="sm">
                        <Link href="/tours">Edit</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {!bookings || bookings.length === 0 ? (
              <p className="text-muted-foreground">No bookings yet. Add one from the calendar.</p>
            ) : (
              <ul className="space-y-2">
                {bookings.slice(0, 8).map((b) => (
                  <li key={b.id} className="flex justify-between border-b pb-1 last:border-0">
                    <span>
                      {b.date} · +{b.guest_count} guest{b.guest_count !== 1 && "s"}
                      {b.source && ` (${b.source})`}
                    </span>
                    <span className="text-muted-foreground">{b.customer_name ?? ""}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Blocked Dates</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {!blocked || blocked.length === 0 ? (
              <p className="text-muted-foreground">No blocks. Click a date on the calendar to block it.</p>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                <ul className="space-y-2">
                  {blocked.map((bl) => {
                    const tour = tours?.find((t) => t.id === bl.tour_id);
                    return (
                      <li key={bl.id} className="flex justify-between border-b pb-1 last:border-0">
                        <Link href={`/calendar?tour=${bl.tour_id ?? ""}`} className="hover:underline">
                          {bl.date} · {tour?.name ?? "All tours"}
                          {bl.reason ? ` — ${bl.reason}` : ""}
                        </Link>
                        {bl.is_auto_blocked && <Badge variant="destructive">auto</Badge>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Today: {today} · Google Calendar: {tokens ? `connected (${tokens.calendar_id})` : "not connected"} ·
        Busy blocks push to Airbnb immediately via Google Calendar.
      </p>
    </div>
  );
}
