"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Booking, BlockedDate, Tour } from "@/types";
import { calcGross, calcNet } from "@/lib/revenue";

const PERIODS = [
  { value: "today", label: "Today" },
  { value: "month", label: "This Month" },
  { value: "ytd", label: "Year to Date" },
  { value: "year", label: "Calendar Year" },
] as const;

type Period = (typeof PERIODS)[number]["value"];

function formatCurrency(amount: number) {
  return `¥${amount.toLocaleString()}`;
}

function filterByPeriod<T extends { date: string }>(
  items: T[],
  period: Period,
  today: string
): T[] {
  if (period === "today") return items.filter((i) => i.date === today);

  const [y, m] = today.split("-").map(Number);

  if (period === "month") {
    return items.filter((i) => {
      const [iy, im] = i.date.split("-").map(Number);
      return iy === y && im === m;
    });
  }

  if (period === "ytd") {
    return items.filter((i) => i.date <= today);
  }

  // year
  return items.filter((i) => i.date.startsWith(String(y)));
}

export function TodaySummary({
  allBookings,
  allBlocked,
  tours,
  commissionRates,
  today,
}: {
  allBookings: Booking[];
  allBlocked: BlockedDate[];
  tours: Tour[];
  commissionRates: Record<string, number> | null;
  today: string;
}) {
  const [period, setPeriod] = useState<Period>("today");

  const filteredBookings = useMemo(
    () => filterByPeriod(allBookings, period, today),
    [allBookings, period, today]
  );

  const filteredBlocked = useMemo(
    () => filterByPeriod(allBlocked, period, today),
    [allBlocked, period, today]
  );

  const gross = filteredBookings.reduce((sum, b) => {
    const tour = tours.find((t) => t.id === b.tour_id);
    return sum + calcGross(tour?.price ?? 0, b.guest_count);
  }, 0);

  const net = filteredBookings.reduce((sum, b) => {
    const tour = tours.find((t) => t.id === b.tour_id);
    return sum + calcNet(b.source ?? "direct", tour?.price ?? 0, b.guest_count, commissionRates);
  }, 0);

  const uniqueTourIds = new Set(filteredBookings.map((b) => b.tour_id));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="w-[160px] h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Tours</p>
            <p className="text-2xl font-bold">{uniqueTourIds.size}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Bookings</p>
            <p className="text-2xl font-bold">{filteredBookings.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Blocks</p>
            <p className="text-2xl font-bold">{filteredBlocked.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(net)}</p>
            {gross > net && (
              <p className="text-[10px] text-muted-foreground">
                ¥{gross.toLocaleString()} gross
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
