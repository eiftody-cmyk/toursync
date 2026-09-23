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
import { DashboardKpis } from "@/components/dashboard/DashboardKpis";
import { TourBookings } from "@/components/dashboard/TourBookings";
import { RevenueExpandable } from "@/components/dashboard/RevenueExpandable";
import { UpcomingBlocksLink } from "@/components/dashboard/UpcomingBlocksLink";
import { calcNet } from "@/lib/revenue";

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

  const monthPrefix = today.slice(0, 7);
  const monthBookings = bookings.filter((b) => b.date.startsWith(monthPrefix));
  const monthGuests = monthBookings.reduce((s, b) => s + b.guest_count, 0);
  const ytdGuests = bookings.reduce((s, b) => s + b.guest_count, 0);

  const netThisMonth = monthBookings.reduce((sum, b) => {
    const tour = tours.find((t) => t.id === b.tour_id);
    return sum + calcNet(b.source ?? "direct", tour?.price ?? 0, b.guest_count, commissionRates);
  }, 0);

  const in14 = new Date();
  in14.setDate(in14.getDate() + 14);
  const in14Str = in14.toISOString().slice(0, 10);
  const upcoming14 = bookings.filter(
    (b) => b.date > today && b.date <= in14Str && b.status === "confirmed"
  ).length;

  const headerDate = new Date(
    `${today}T12:00:00+09:00`
  ).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{headerDate}</p>
        </div>
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

      <DashboardKpis
        netThisMonth={netThisMonth}
        monthBookings={monthBookings.length}
        ytdBookings={bookings.length}
        monthGuests={monthGuests}
        ytdGuests={ytdGuests}
        upcoming14={upcoming14}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <TodaySchedule bookings={bookings} tours={tours} blocked={blocked} />
        <UpcomingTours bookings={bookings} tours={tours} blocked={blocked} />
      </div>

      <ConnectionStatus tokens={tokens} tours={tours} />

      <TourBookings bookings={bookings} tours={tours} commissionRates={commissionRates} />

      <RevenueExpandable
        bookings={bookings}
        tours={tours}
        commissionRates={commissionRates}
      />

      <ActivityLog />

      <UpcomingBlocksLink blocked={blocked} />
    </div>
  );
}
