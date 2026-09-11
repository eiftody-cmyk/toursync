"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { Booking, BlockedDate, Tour } from "@/types";

function formatCurrency(amount: number, currency: string = "JPY") {
  if (currency === "JPY") return `¥${amount.toLocaleString()}`;
  return `${currency} ${amount.toLocaleString()}`;
}

export function TodaySummary({
  bookings,
  blocked,
  tours,
}: {
  bookings: Booking[];
  blocked: BlockedDate[];
  tours: Tour[];
}) {
  const todayBookings = bookings.filter((b) => b.status === "confirmed");
  const todayBlocks = blocked;
  const revenue = todayBookings.reduce((sum, b) => {
    const tour = tours.find((t) => t.id === b.tour_id);
    return sum + (tour?.price ?? 0) * b.guest_count;
  }, 0);
  const uniqueTourIds = new Set(todayBookings.map((b) => b.tour_id));

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
          <p className="text-2xl font-bold">{todayBookings.length}</p>
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
          <p className="text-2xl font-bold">{formatCurrency(revenue)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
