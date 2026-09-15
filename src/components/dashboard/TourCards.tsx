"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import type { Booking, Tour } from "@/types";
import { calcGross, calcNet } from "@/lib/revenue";

type FilterMode = "upcoming" | "all";

export function TourCards({
  bookings,
  tours,
  commissionRates,
}: {
  bookings: Booking[];
  tours: Tour[];
  commissionRates: Record<string, number> | null;
}) {
  const [filterMode, setFilterMode] = useState<FilterMode>("upcoming");

  const confirmed = useMemo(
    () => bookings.filter((b) => b.status === "confirmed"),
    [bookings]
  );

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const tourStats = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return tours.map((tour) => {
      const tourBookings = confirmed.filter((b) => b.tour_id === tour.id);
      const gross = tourBookings.reduce(
        (s, b) => s + calcGross(tour.price ?? 0, b.guest_count),
        0
      );
      const net = tourBookings.reduce(
        (s, b) => s + calcNet(b.source ?? "direct", tour.price ?? 0, b.guest_count, commissionRates),
        0
      );
      const recentCount = tourBookings.filter(
        (b) => new Date(b.date) >= sevenDaysAgo
      ).length;
      const channelBreakdown = tourBookings.reduce(
        (acc, b) => {
          const src = b.source ?? "direct";
          acc[src] = (acc[src] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
      const avgGroupSize =
        tourBookings.length > 0
          ? tourBookings.reduce((s, b) => s + b.guest_count, 0) /
            tourBookings.length
          : 0;

      const dates = tourBookings.map((b) => b.date).sort();
      const nextDate = dates.find((d) => d >= todayStr) ?? null;
      const pastDates = dates.filter((d) => d < todayStr);
      const lastDate = pastDates.length > 0 ? pastDates[pastDates.length - 1] : null;

      return {
        tour,
        totalBookings: tourBookings.length,
        gross,
        net,
        recentCount,
        channelBreakdown,
        avgGroupSize,
        nextDate,
        lastDate,
      };
    });
  }, [confirmed, tours, commissionRates, todayStr]);

  const filtered = useMemo(() => {
    const withUpcoming = tourStats.filter((t) => t.nextDate !== null);
    const withoutUpcoming = tourStats.filter((t) => t.nextDate === null);

    if (filterMode === "upcoming") {
      return withUpcoming.sort((a, b) => a.nextDate!.localeCompare(b.nextDate!));
    }

    // "all": upcoming sorted by next date asc, then past-only sorted by last date desc
    withUpcoming.sort((a, b) => a.nextDate!.localeCompare(b.nextDate!));
    withoutUpcoming.sort((a, b) => (b.lastDate ?? "").localeCompare(a.lastDate ?? ""));
    return [...withUpcoming, ...withoutUpcoming];
  }, [tourStats, filterMode]);

  if (tours.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          No tours yet.{" "}
          <Link href="/tours" className="underline text-primary">
            Create your first tour
          </Link>
          .
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Your Tours</h2>
        <Select value={filterMode} onValueChange={(v) => setFilterMode(v as FilterMode)}>
          <SelectTrigger className="w-[160px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upcoming">Upcoming Tours</SelectItem>
            <SelectItem value="all">All Tours</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No upcoming tours.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(({ tour, totalBookings, gross, net, recentCount, channelBreakdown, avgGroupSize, nextDate, lastDate }) => (
            <Card key={tour.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between gap-2">
                  <span className="truncate">{tour.name}</span>
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {tour.capacity} max
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {tour.price ? `¥${tour.price.toLocaleString()} ${tour.currency}` : "Price not set"}
                  </span>
                  <span className="font-medium">
                    {totalBookings} booking{totalBookings !== 1 && "s"}
                  </span>
                </div>
                {nextDate && (
                  <p className="text-xs text-emerald-600">
                    Next: {nextDate}
                  </p>
                )}
                {!nextDate && lastDate && (
                  <p className="text-xs text-muted-foreground">
                    Last: {lastDate}
                  </p>
                )}
                {net > 0 && (
                  <p className="text-xs text-muted-foreground">
                    ¥{net.toLocaleString()} net · ¥{gross.toLocaleString()} gross · avg {avgGroupSize.toFixed(1)} guests
                  </p>
                )}
                {recentCount > 0 && (
                  <p className="text-xs text-emerald-600">
                    +{recentCount} this week
                  </p>
                )}
                {Object.keys(channelBreakdown).length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {Object.entries(channelBreakdown).map(([src, count]) => (
                      <Badge key={src} variant="outline" className="text-[10px]">
                        {src}: {count}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/calendar?tour=${tour.id}`}>Calendar</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/tours">Edit</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
