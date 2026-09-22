import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { todayJST } from "@/lib/time";
import { startOfYear } from "date-fns";
import { ActionRequired } from "@/components/dashboard/ActionRequired";
import { TodaySchedule } from "@/components/dashboard/TodaySchedule";
import { UpcomingTours } from "@/components/dashboard/UpcomingTours";
import { ConnectionStatus } from "@/components/dashboard/ConnectionStatus";
import { ActivityLog } from "@/components/dashboard/ActivityLog";
import { ValueMetric } from "@/components/dashboard/ValueMetric";
import { PerformanceSummary } from "@/components/dashboard/PerformanceSummary";
import { EarningsByListing } from "@/components/dashboard/EarningsByListing";
import { TourBookings } from "@/components/dashboard/TourBookings";
import { BlockedDatesGrouped } from "@/components/dashboard/BlockedDatesGrouped";
import { RevenueExpandable } from "@/components/dashboard/RevenueExpandable";

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
      supabase
        .from("tours")
        .select("*, tour_channel_listings(channel, is_active)")
        .eq("user_id", user.id)
        .order("created_at"),
      supabase
        .from("bookings")
        .select("*, tours(name, price, currency)")
        .eq("user_id", user.id)
        .eq("status", "confirmed")
        .gte("date", yearStart)
        .order("date", { ascending: true }),
      supabase.from("blocked_dates").select("*").eq("user_id", user.id).order("date", { ascending: true }),
      supabase.from("google_tokens").select("calendar_id, token_expiry, refresh_token").eq("user_id", user.id).maybeSingle(),
      supabase.from("operator_settings").select("commission_rates").eq("user_id", user.id).maybeSingle(),
    ]);

  const tours = toursResult.data ?? [];
  const bookings = bookingsResult.data ?? [];
  const blocked = blockedResult.data ?? [];
  const tokens = tokensResult.data;
  const commissionRates = (settingsResult.data?.commission_rates as Record<string, number>) ?? null;

  return (
    <div className="space-y-4">
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

      <ActionRequired bookings={bookings} tours={tours} blocked={blocked} tokens={tokens} />

      <div className="grid md:grid-cols-2 gap-4">
        <TodaySchedule bookings={bookings} tours={tours} blocked={blocked} />
        <UpcomingTours bookings={bookings} tours={tours} blocked={blocked} />
      </div>

      <ConnectionStatus tokens={tokens} tours={tours} />

      <ActivityLog />

      <ValueMetric bookings={bookings} />

      <RevenueExpandable
        bookings={bookings}
        tours={tours}
        commissionRates={commissionRates}
      />

      <TourBookings bookings={bookings} tours={tours} commissionRates={commissionRates} />

      <BlockedDatesGrouped blocked={blocked} tours={tours} />
    </div>
  );
}
