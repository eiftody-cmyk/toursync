"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { Booking, Tour, BlockedDate } from "@/types";

const SOURCE_COLORS: Record<string, string> = {
  direct: "bg-emerald-100 text-emerald-800",
  gyg: "bg-blue-100 text-blue-800",
  viator: "bg-purple-100 text-purple-800",
  airbnb: "bg-rose-100 text-rose-800",
};

export function UpcomingTours({
  bookings,
  tours,
  blocked,
}: {
  bookings: Booking[];
  tours: Tour[];
  blocked: BlockedDate[];
}) {
  const items = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const weekLater = new Date();
    weekLater.setDate(weekLater.getDate() + 7);
    const weekLaterStr = weekLater.toISOString().slice(0, 10);

    const upcomingBookings = bookings
      .filter((b) => b.date > todayStr && b.date <= weekLaterStr && b.status === "confirmed")
      .sort((a, b) => a.date.localeCompare(b.date) || (a.start_time ?? "00:00").localeCompare(b.start_time ?? "00:00"));

    const upcomingBlocked = blocked
      .filter((b) => b.date > todayStr && b.date <= weekLaterStr)
      .sort((a, b) => a.date.localeCompare(b.date) || (a.start_time ?? "00:00").localeCompare(b.start_time ?? "00:00"));

    const result: Array<{
      date: string;
      type: "booking" | "block";
      time: string | null;
      tour: Tour | null;
      tourId: string | null;
      booking?: Booking;
      block?: BlockedDate;
    }> = [];

    for (const b of upcomingBookings) {
      result.push({
        date: b.date,
        type: "booking",
        time: b.start_time,
        tour: tours.find((t) => t.id === b.tour_id) ?? null,
        tourId: b.tour_id,
        booking: b,
      });
    }

    for (const bl of upcomingBlocked) {
      result.push({
        date: bl.date,
        type: "block",
        time: bl.start_time,
        tour: tours.find((t) => t.id === bl.tour_id) ?? null,
        tourId: bl.tour_id,
        block: bl,
      });
    }

    result.sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? "00:00").localeCompare(b.time ?? "00:00"));
    return result;
  }, [bookings, tours, blocked]);

  if (items.length === 0) {
    return null;
  }

  const grouped = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const item of items) {
      const list = map.get(item.date) ?? [];
      list.push(item);
      map.set(item.date, list);
    }
    return Array.from(map.entries());
  }, [items]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T12:00:00");
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateStr === today.toISOString().slice(0, 10)) return "Today";
    if (dateStr === tomorrow.toISOString().slice(0, 10)) return "Tomorrow";

    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Upcoming</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {grouped.map(([date, dayItems]) => (
            <div key={date}>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                {formatDate(date)}
              </p>
              <div className="space-y-1">
                {dayItems.map((item, i) => {
                  if (item.type === "booking" && item.booking) {
                    const b = item.booking;
                    return (
                      <Link
                        key={b.id}
                        href={`/calendar?tour=${b.tour_id}&date=${b.date}`}
                        className="flex items-center justify-between p-1.5 rounded hover:bg-muted/50 text-sm"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-xs text-muted-foreground w-12 shrink-0">
                            {item.time ? item.time.slice(0, 5) : "—"}
                          </span>
                          <span className="truncate">{item.tour?.name ?? "Tour"}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-muted-foreground">
                            {b.guest_count}/{item.tour?.capacity ?? "?"}
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
                        className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-sm"
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
