"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Booking, Tour } from "@/types";

export function EarningsByListing({
  bookings,
  tours,
}: {
  bookings: Booking[];
  tours: Tour[];
}) {
  const confirmed = useMemo(
    () => bookings.filter((b) => b.status === "confirmed"),
    [bookings]
  );

  const earnings = useMemo(() => {
    const map = new Map<string, { tour: Tour; revenue: number; count: number }>();
    for (const tour of tours) {
      map.set(tour.id, { tour, revenue: 0, count: 0 });
    }
    for (const b of confirmed) {
      const entry = map.get(b.tour_id);
      if (entry) {
        entry.revenue += (entry.tour.price ?? 0) * b.guest_count;
        entry.count += 1;
      }
    }
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [confirmed, tours]);

  const totalRevenue = earnings.reduce((s, e) => s + e.revenue, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Earnings by Listing</CardTitle>
          <span className="text-xs text-muted-foreground">
            {new Date().getFullYear()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {earnings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tours yet.</p>
        ) : (
          earnings.map((e) => {
            const pct = totalRevenue > 0 ? (e.revenue / totalRevenue) * 100 : 0;
            return (
              <div key={e.tour.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate max-w-[200px] font-medium">
                    {e.tour.name}
                  </span>
                  <span className="text-muted-foreground">
                    {pct.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  ¥{e.revenue.toLocaleString()} JPY · {e.count} booking
                  {e.count !== 1 && "s"}
                </p>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
