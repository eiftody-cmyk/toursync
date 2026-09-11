import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { todayJST } from "@/lib/time";
import { startOfYear } from "date-fns";
import { InsightsBanner } from "@/components/dashboard/InsightsBanner";
import { TodaySummary } from "@/components/dashboard/TodaySummary";
import { PerformanceSummary } from "@/components/dashboard/PerformanceSummary";
import { EarningsByListing } from "@/components/dashboard/EarningsByListing";
import { TourCards } from "@/components/dashboard/TourCards";
import { BookingTable } from "@/components/dashboard/BookingTable";
import { BlockedDatesGrouped } from "@/components/dashboard/BlockedDatesGrouped";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const today = todayJST();
  const yearStart = startOfYear(new Date()).toISOString().split("T")[0];

  const [toursResult, bookingsResult, blockedResult, tokensResult, settingsResult] =
    await Promise.all([
      supabase.from("tours").select("*").eq("user_id", user.id).order("created_at"),
      supabase
        .from("bookings")
        .select("*, tours(name, price, currency)")
        .eq("user_id", user.id)
        .eq("status", "confirmed")
        .gte("date", yearStart)
        .order("date", { ascending: true }),
      supabase.from("blocked_dates").select("*").eq("user_id", user.id).order("date", { ascending: true }),
      supabase.from("google_tokens").select("calendar_id, token_expiry").eq("user_id", user.id).maybeSingle(),
      supabase.from("operator_settings").select("commission_rates").eq("user_id", user.id).maybeSingle(),
    ]);

  const tours = toursResult.data ?? [];
  const bookings = bookingsResult.data ?? [];
  const blocked = blockedResult.data ?? [];
  const tokens = tokensResult.data;
  const commissionRates = (settingsResult.data?.commission_rates as Record<string, number>) ?? null;

  const todayBookings = bookings.filter((b) => b.date === today);
  const todayBlocked = blocked.filter((b) => b.date === today);

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

      <InsightsBanner bookings={bookings} tours={tours} blocked={blocked} />

      <TodaySummary
        bookings={todayBookings}
        blocked={todayBlocked}
        tours={tours}
        commissionRates={commissionRates}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <PerformanceSummary bookings={bookings} tours={tours} commissionRates={commissionRates} />
        <EarningsByListing bookings={bookings} tours={tours} commissionRates={commissionRates} />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Your Tours</h2>
        <TourCards bookings={bookings} tours={tours} commissionRates={commissionRates} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <BookingTable bookings={bookings} tours={tours} />
        <BlockedDatesGrouped blocked={blocked} tours={tours} />
      </div>

      <p className="text-xs text-muted-foreground">
        Today: {today} · Google Calendar: {tokens ? `connected (${tokens.calendar_id})` : "not connected"} ·
        Busy blocks push to Airbnb immediately via Google Calendar.
      </p>
    </div>
  );
}
