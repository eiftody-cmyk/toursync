"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Booking, Tour } from "@/types";

export function TourCards({
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

  const tourStats = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    return tours.map((tour) => {
      const tourBookings = confirmed.filter((b) => b.tour_id === tour.id);
      const revenue = tourBookings.reduce(
        (s, b) => s + (tour.price ?? 0) * b.guest_count,
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
      const lastBooking = tourBookings
        .map((b) => b.date)
        .sort()
        .pop();

      return {
        tour,
        totalBookings: tourBookings.length,
        revenue,
        recentCount,
        channelBreakdown,
        avgGroupSize,
        lastBooking,
      };
    });
  }, [confirmed, tours]);

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
    <div className="grid md:grid-cols-2 gap-4">
      {tourStats.map(({ tour, totalBookings, revenue, recentCount, channelBreakdown, avgGroupSize, lastBooking }) => (
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
            {revenue > 0 && (
              <p className="text-xs text-muted-foreground">
                ¥{revenue.toLocaleString()} revenue · avg {avgGroupSize.toFixed(1)} guests
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
            {lastBooking && (
              <p className="text-xs text-muted-foreground">
                Last booking: {lastBooking}
              </p>
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
  );
}
