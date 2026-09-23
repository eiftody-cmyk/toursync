"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
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

const SOURCE_COLORS: Record<string, string> = {
  direct: "bg-emerald-100 text-emerald-800",
  gyg: "bg-blue-100 text-blue-800",
  viator: "bg-purple-100 text-purple-800",
  airbnb: "bg-rose-100 text-rose-800",
};

export function TourBookings({
  bookings,
  tours,
  commissionRates,
}: {
  bookings: Booking[];
  tours: Tour[];
  commissionRates: Record<string, number> | null;
}) {
  const [filterMode, setFilterMode] = useState<FilterMode>("upcoming");
  const [filterSource, setFilterSource] = useState("all");

  const confirmed = useMemo(
    () => bookings.filter((b) => b.status === "confirmed"),
    [bookings]
  );

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const sources = useMemo(() => {
    const set = new Set(confirmed.map((b) => b.source).filter(Boolean));
    return Array.from(set);
  }, [confirmed]);

  const tourData = useMemo(() => {
    const sevenDaysAgo = new Date();
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

      const dates = tourBookings.map((b) => b.date).sort();
      const nextDate = dates.find((d) => d >= todayStr) ?? null;
      const pastDates = dates.filter((d) => d < todayStr);
      const lastDate = pastDates.length > 0 ? pastDates[pastDates.length - 1] : null;

      return {
        tour,
        gross,
        net,
        recentCount,
        channelBreakdown,
        nextDate,
        lastDate,
        bookings: [...tourBookings].sort((a, b) => b.date.localeCompare(a.date)),
      };
    });
  }, [confirmed, tours, commissionRates, todayStr]);

  const filteredTours = useMemo(() => {
    let list = tourData;

    if (filterMode === "upcoming") {
      list = list.filter((t) => t.nextDate !== null);
      list.sort((a, b) => b.nextDate!.localeCompare(a.nextDate!));
    } else {
      const withUpcoming = list.filter((t) => t.nextDate !== null);
      const withoutUpcoming = list.filter((t) => t.nextDate === null);
      withUpcoming.sort((a, b) => b.nextDate!.localeCompare(a.nextDate!));
      withoutUpcoming.sort((a, b) => (b.lastDate ?? "").localeCompare(a.lastDate ?? ""));
      list = [...withUpcoming, ...withoutUpcoming];
    }

    if (filterSource !== "all") {
      list = list.map((t) => ({
        ...t,
        bookings: t.bookings.filter((b) => b.source === filterSource),
      }));
    }

    return list;
  }, [tourData, filterMode, filterSource]);

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Your Tours</CardTitle>
        <div className="flex gap-2">
          <Select value={filterMode} onValueChange={(v) => setFilterMode(v as FilterMode)}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming Tours</SelectItem>
              <SelectItem value="all">All Tours</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterSource} onValueChange={(v) => setFilterSource(v ?? "all")}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {sources.map((s) => (
                <SelectItem key={s} value={s!}>
                  {s!.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTours.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {filterMode === "upcoming" ? "No upcoming tours." : "No bookings yet."}
          </p>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableBody>
                {filteredTours.map((td) => (
                  <TourGroup key={td.tour.id} data={td} todayStr={todayStr} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TourGroup({
  data,
  todayStr,
}: {
  data: {
    tour: Tour;
    gross: number;
    net: number;
    recentCount: number;
    channelBreakdown: Record<string, number>;
    nextDate: string | null;
    lastDate: string | null;
    bookings: Booking[];
  };
  todayStr: string;
}) {
  const { tour, net, recentCount, channelBreakdown, nextDate, lastDate, bookings } = data;
  const hasUpcoming = nextDate !== null;

  return (
    <>
      <TableRow
        className={
          hasUpcoming
            ? "border-l-2 border-l-emerald-500 bg-emerald-50/60 hover:bg-emerald-50/80 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30"
            : "bg-muted/30 hover:bg-muted/40"
        }
      >
        <TableCell colSpan={5} className="py-2 px-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-sm truncate">{tour.name}</span>
              <Badge variant="secondary" className="shrink-0 text-[10px]">
                {tour.capacity} max
              </Badge>
              {recentCount > 0 && (
                <Badge variant="outline" className="shrink-0 text-[10px] text-emerald-600 border-emerald-300">
                  +{recentCount} this week
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
              {tour.price && (
                <span>¥{tour.price.toLocaleString()} {tour.currency}</span>
              )}
              {nextDate && (
                <span className="text-emerald-600">Next: {nextDate}</span>
              )}
              {!nextDate && lastDate && (
                <span>Last: {lastDate}</span>
              )}
              {net > 0 && (
                <span>¥{net.toLocaleString()} net</span>
              )}
              {Object.keys(channelBreakdown).length > 0 && (
                <div className="flex gap-1">
                  {Object.entries(channelBreakdown).map(([src, count]) => (
                    <Badge key={src} variant="outline" className="text-[10px] px-1 py-0">
                      {src}: {count}
                    </Badge>
                  ))}
                </div>
              )}
              <Button asChild variant="ghost" size="sm" className="h-6 text-xs px-2">
                <Link href={`/calendar?tour=${tour.id}`}>Calendar</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="h-6 text-xs px-2">
                <Link href="/tours">Edit</Link>
              </Button>
            </div>
          </div>
        </TableCell>
      </TableRow>
      {bookings.length === 0 ? (
        <TableRow>
          <TableCell colSpan={5} className="py-2 px-3 text-xs text-muted-foreground italic">
            No bookings for this tour.
          </TableCell>
        </TableRow>
      ) : (
        bookings.map((b) => {
          const isFuture = b.date >= todayStr;
          return (
            <Link
              key={b.id}
              href={`/calendar?tour=${b.tour_id}&date=${b.date}`}
              className="contents"
            >
              <TableRow
                className={
                  isFuture
                    ? "cursor-pointer bg-emerald-50/50 hover:bg-emerald-50/80 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30"
                    : "cursor-pointer hover:bg-muted/50"
                }
              >
                <TableCell className="py-1.5 px-3 text-xs">
                  {isFuture ? (
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">{b.date}</span>
                  ) : (
                    b.date
                  )}
                </TableCell>
                <TableCell className="py-1.5 px-3 text-xs">+{b.guest_count}</TableCell>
                <TableCell className="py-1.5 px-3">
                  {b.source && (
                    <Badge
                      variant="secondary"
                      className={`text-[10px] px-1.5 py-0 ${SOURCE_COLORS[b.source] ?? ""}`}
                    >
                      {b.source.toUpperCase()}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="py-1.5 px-3 text-xs text-muted-foreground">
                  {b.customer_name ?? ""}
                </TableCell>
                <TableCell className="py-1.5 px-3" />
              </TableRow>
            </Link>
          );
        })
      )}
    </>
  );
}
