"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Booking, Tour, BlockedDate } from "@/types";

const SOURCE_COLORS: Record<string, string> = {
  direct: "bg-emerald-100 text-emerald-800",
  gyg: "bg-blue-100 text-blue-800",
  viator: "bg-purple-100 text-purple-800",
  airbnb: "bg-rose-100 text-rose-800",
};

export function TodaySchedule({
  bookings,
  tours,
  blocked,
}: {
  bookings: Booking[];
  tours: Tour[];
  blocked: BlockedDate[];
}) {
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const todayBookings = useMemo(
    () =>
      bookings
        .filter((b) => b.date === todayStr && b.status === "confirmed")
        .sort((a, b) => (a.start_time ?? "00:00").localeCompare(b.start_time ?? "00:00")),
    [bookings, todayStr]
  );

  const todayBlocked = useMemo(
    () =>
      blocked
        .filter((b) => b.date === todayStr)
        .sort((a, b) => (a.start_time ?? "00:00").localeCompare(b.start_time ?? "00:00")),
    [blocked, todayStr]
  );

  const items = useMemo(() => {
    const result: Array<{
      type: "booking" | "block";
      time: string | null;
      tour: Tour | null;
      tourId: string | null;
      booking?: Booking;
      block?: BlockedDate;
    }> = [];

    for (const b of todayBookings) {
      result.push({
        type: "booking",
        time: b.start_time,
        tour: tours.find((t) => t.id === b.tour_id) ?? null,
        tourId: b.tour_id,
        booking: b,
      });
    }

    for (const bl of todayBlocked) {
      result.push({
        type: "block",
        time: bl.start_time,
        tour: tours.find((t) => t.id === bl.tour_id) ?? null,
        tourId: bl.tour_id,
        block: bl,
      });
    }

    result.sort((a, b) => (a.time ?? "00:00").localeCompare(b.time ?? "00:00"));
    return result;
  }, [todayBookings, todayBlocked, tours]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Today</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing scheduled today.</p>
        ) : (
          <div className="space-y-2">
            {items.map((item, i) => {
              if (item.type === "booking" && item.booking) {
                const b = item.booking;
                return (
                  <Link
                    key={b.id}
                    href={`/calendar?tour=${b.tour_id}&date=${b.date}`}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-xs text-muted-foreground w-12 shrink-0">
                        {item.time ? item.time.slice(0, 5) : "—"}
                      </span>
                      <span className="truncate">{item.tour?.name ?? "Tour"}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {b.guest_count} guest{b.guest_count !== 1 ? "s" : ""}
                      </span>
                      {b.source && (
                        <Badge
                          variant="secondary"
                          className={`text-[10px] px-1.5 py-0 ${SOURCE_COLORS[b.source] ?? ""}`}
                        >
                          {b.source.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  </Link>
                );
              }

              if (item.type === "block" && item.block) {
                const bl = item.block;
                return (
                  <div
                    key={bl.id}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/30 text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-xs text-muted-foreground w-12 shrink-0">
                        {item.time ? item.time.slice(0, 5) : "—"}
                      </span>
                      <span className="truncate text-muted-foreground">
                        {item.tour?.name ?? "All tours"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="outline" className="text-[10px]">
                        🔒 Blocked
                      </Badge>
                      {bl.reason && (
                        <span className="text-[10px] text-muted-foreground">{bl.reason}</span>
                      )}
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
