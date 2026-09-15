"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export function ValueMetric({
  bookings,
}: {
  bookings: Array<{ tour_id: string; date: string; guest_count: number }>;
}) {
  const [syncCount, setSyncCount] = useState<number | null>(null);

  const stats = useMemo(() => {
    const uniqueTours = new Set(bookings.map((b) => b.tour_id));
    const totalGuests = bookings.reduce((s, b) => s + b.guest_count, 0);
    return {
      bookingCount: bookings.length,
      tourCount: uniqueTours.size,
      guestCount: totalGuests,
    };
  }, [bookings]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const { count } = await supabase
        .from("blocked_dates")
        .select("id", { count: "exact", head: true })
        .gte("created_at", oneMonthAgo.toISOString());

      setSyncCount(count ?? 0);
    }
    load();
  }, []);

  return (
    <Card>
      <CardContent className="py-3 px-4">
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            {syncCount !== null && (
              <span>
                <span className="font-medium text-foreground">{syncCount}</span> availability updates synchronized
              </span>
            )}
          </div>
          <div className="text-muted-foreground text-xs">
            {stats.bookingCount} booking{stats.bookingCount !== 1 ? "s" : ""} · {stats.tourCount} tour{stats.tourCount !== 1 ? "s" : ""} · {stats.guestCount} guest{stats.guestCount !== 1 ? "s" : ""}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
