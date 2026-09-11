"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Booking, Tour } from "@/types";
import { calcGross, calcNet, getCommissionRate } from "@/lib/revenue";

export function EarningsByListing({
  bookings,
  tours,
  commissionRates,
}: {
  bookings: Booking[];
  tours: Tour[];
  commissionRates: Record<string, number> | null;
}) {
  const confirmed = useMemo(
    () => bookings.filter((b) => b.status === "confirmed"),
    [bookings]
  );

  const earnings = useMemo(() => {
    const map = new Map<string, { tour: Tour; gross: number; net: number; commission: number; count: number }>();
    for (const tour of tours) {
      map.set(tour.id, { tour, gross: 0, net: 0, commission: 0, count: 0 });
    }
    for (const b of confirmed) {
      const entry = map.get(b.tour_id);
      if (entry) {
        const g = calcGross(entry.tour.price ?? 0, b.guest_count);
        const n = calcNet(b.source ?? "direct", entry.tour.price ?? 0, b.guest_count, commissionRates);
        entry.gross += g;
        entry.net += n;
        entry.commission += g - n;
        entry.count += 1;
      }
    }
    return Array.from(map.values()).sort((a, b) => b.net - a.net);
  }, [confirmed, tours, commissionRates]);

  const totalNet = earnings.reduce((s, e) => s + e.net, 0);

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
            const pct = totalNet > 0 ? (e.net / totalNet) * 100 : 0;
            return (
              <div key={e.tour.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate max-w-[200px] font-medium">
                    {e.tour.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {e.commission > 0 && (
                      <Badge variant="outline" className="text-[10px] text-amber-600">
                        -¥{e.commission.toLocaleString()}
                      </Badge>
                    )}
                    <span className="text-muted-foreground">
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  ¥{e.net.toLocaleString()} net · ¥{e.gross.toLocaleString()} gross · {e.count} booking
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
