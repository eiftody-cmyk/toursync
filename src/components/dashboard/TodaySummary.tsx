"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { Booking, BlockedDate, Tour } from "@/types";
import { calcGross, calcNet } from "@/lib/revenue";

function formatCurrency(amount: number) {
  return `¥${amount.toLocaleString()}`;
}

export function TodaySummary({
  bookings,
  blocked,
  tours,
  commissionRates,
}: {
  bookings: Booking[];
  blocked: BlockedDate[];
  tours: Tour[];
  commissionRates: Record<string, number> | null;
}) {
  const confirmed = useMemo(
    () => bookings.filter((b) => b.status === "confirmed"),
    [bookings]
  );
  const todayBlocks = blocked;
  const gross = confirmed.reduce((sum, b) => {
    const tour = tours.find((t) => t.id === b.tour_id);
    return sum + calcGross(tour?.price ?? 0, b.guest_count);
  }, 0);
  const net = confirmed.reduce((sum, b) => {
    const tour = tours.find((t) => t.id === b.tour_id);
    return sum + calcNet(b.source ?? "direct", tour?.price ?? 0, b.guest_count, commissionRates);
  }, 0);
  const uniqueTourIds = new Set(confirmed.map((b) => b.tour_id));

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card>
        <CardContent className="pt-4 pb-3">
          <p className="text-xs text-muted-foreground">Tours Today</p>
          <p className="text-2xl font-bold">{uniqueTourIds.size}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 pb-3">
          <p className="text-xs text-muted-foreground">Bookings Today</p>
          <p className="text-2xl font-bold">{confirmed.length}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 pb-3">
          <p className="text-xs text-muted-foreground">Blocks Today</p>
          <p className="text-2xl font-bold">{todayBlocks.length}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 pb-3">
          <p className="text-xs text-muted-foreground">Revenue Today</p>
          <p className="text-2xl font-bold">{formatCurrency(net)}</p>
          {gross > net && (
            <p className="text-[10px] text-muted-foreground">
              ¥{gross.toLocaleString()} gross
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
