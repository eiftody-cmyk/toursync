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
import { ReferralPayouts } from "@/components/dashboard/ReferralPayouts";
import { UpcomingBlocksLink } from "@/components/dashboard/UpcomingBlocksLink";
import { calcNet, type RateMap } from "@/lib/revenue";
import { REFERRAL_PARTNERS } from "@/config/referral-partners";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const today = todayJST();
  const yearStart = startOfYear(new Date()).toISOString().split("T")[0];

  const [
    toursResult,
    bookingsResult,
    blockedResult,
    tokensResult,
    settingsResult,
    staffResult,
    partnerRatesResult,
  ] = await Promise.all([
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
    // Tolerant: 033 not applied yet → error + null data, degrade to [].
    supabase
      .from("referral_staff")
      .select("partner, slug, display_name, contact")
      .order("created_at"),
    // Tolerant: 035/036 not applied yet → error + null data, degrade to []
    // and revenue.ts falls back to the 10% percent-per-partner default.
    supabase.from("referral_partners").select("slug, payout_type, payout_rate"),
  ]);

  const tours = toursResult.data ?? [];
  const bookings = bookingsResult.data ?? [];
  const blocked = blockedResult.data ?? [];
  const tokens = tokensResult.data;
  const commissionRates = (settingsResult.data?.commission_rates as Record<string, number>) ?? null;
  const staffRows = (staffResult.data ?? []) as {
    partner: string;
    slug: string;
    display_name: string;
    contact: string | null;
  }[];
  // "partner:slug" → display name for "via …" labels in TourBookings.
  const staffDisplay = Object.fromEntries(
    staffRows.map((s) => [`${s.partner}:${s.slug}`, s.display_name])
  );

  // /ref/join partner payout rates live in referral_partners (035/036): each
  // row is either percent of booking value or flat ¥/guest. Strip any stale
  // partner keys from commission_rates so the table is the only authority on
  // partner rates; OTA/channel keys pass through untouched as numbers.
  const partnerSlugs = new Set(REFERRAL_PARTNERS.map((p) => p.slug));
  const baseRates: Record<string, number> = {};
  for (const [key, value] of Object.entries(commissionRates ?? {})) {
    if (!partnerSlugs.has(key)) baseRates[key] = value;
  }
  const partnerRates: RateMap = Object.fromEntries(
    ((partnerRatesResult.data ?? []) as {
      slug: string;
      payout_type: string;
      payout_rate: number;
    }[]).map((r) => [
      r.slug,
      r.payout_type === "flat_per_guest"
        ? ({ type: "flat_per_guest", value: Number(r.payout_rate) } as const)
        : Number(r.payout_rate),
    ])
  );
  const calcRates: RateMap = { ...baseRates, ...partnerRates };

  const monthPrefix = today.slice(0, 7);
  const monthBookings = bookings.filter((b) => b.date.startsWith(monthPrefix));
  const monthGuests = monthBookings.reduce((s, b) => s + b.guest_count, 0);
  const ytdGuests = bookings.reduce((s, b) => s + b.guest_count, 0);

  const netThisMonth = monthBookings.reduce((sum, b) => {
    const tour = tours.find((t) => t.id === b.tour_id);
    return sum + calcNet(b.source ?? "direct", tour?.price ?? 0, b.guest_count, calcRates);
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

      <TourBookings
        bookings={bookings}
        tours={tours}
        commissionRates={calcRates}
        staffDisplay={staffDisplay}
      />

      <RevenueExpandable
        bookings={bookings}
        tours={tours}
        commissionRates={calcRates}
      />

      <ReferralPayouts bookings={bookings} staff={staffRows} tours={tours} rates={calcRates} />

      <ActivityLog />

      <UpcomingBlocksLink blocked={blocked} />
    </div>
  );
}
