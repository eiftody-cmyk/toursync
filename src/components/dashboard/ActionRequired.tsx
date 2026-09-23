"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Booking, Tour, BlockedDate } from "@/types";

type ActionItem = {
  id: string;
  message: string;
  link: string;
  linkText: string;
};

const OTA_SOURCES = new Set(["viator", "gyg", "travelio", "airbnb"]);

export function ActionRequired({
  bookings,
  tours,
  blocked,
  tokens,
}: {
  bookings: Booking[];
  tours: Tour[];
  blocked: BlockedDate[];
  tokens?: { refresh_token: string | null } | null;
}) {
  const actions = useMemo(() => {
    const items: ActionItem[] = [];
    const todayStr = new Date().toISOString().slice(0, 10);

    const unsyncedBlocks = blocked.filter(
      (b) => b.date >= todayStr && !b.google_calendar_event_id
    );
    if (unsyncedBlocks.length > 0) {
      items.push({
        id: "unsynced-blocks",
        message: `${unsyncedBlocks.length} block${unsyncedBlocks.length !== 1 ? "s" : ""} not synced to Google Calendar`,
        link: "/settings",
        linkText: "Retry sync",
      });
    }

    if (tokens && !tokens.refresh_token) {
      items.push({
        id: "google-disconnected",
        message: "Google Calendar disconnected — bookings won't sync to your calendar",
        link: "/settings",
        linkText: "Reconnect",
      });
    }

    const todayBookings = bookings.filter((b) => b.date === todayStr);
    for (const b of todayBookings) {
      if (!b.start_time) {
        const tour = tours.find((t) => t.id === b.tour_id);
        items.push({
          id: `booking-no-time-${b.id}`,
          message: `${tour?.name ?? "Tour"} booking has no start time`,
          link: `/calendar?tour=${b.tour_id}&date=${b.date}`,
          linkText: "View",
        });
      }
    }

    const toursWithOtaSalesNoListing = tours.filter((t) => {
      const listings = (
        t as Tour & { tour_channel_listings?: Array<{ is_active: boolean }> }
      ).tour_channel_listings;
      const hasActive = (listings ?? []).some((l) => l.is_active);
      if (hasActive) return false;
      return bookings.some(
        (b) => b.tour_id === t.id && OTA_SOURCES.has(b.source ?? "")
      );
    });
    if (toursWithOtaSalesNoListing.length > 0) {
      const n = toursWithOtaSalesNoListing.length;
      items.push({
        id: "no-channels",
        message: `${n} tour${n !== 1 ? "s" : ""} with OTA sales but no active channel connection`,
        link: "/tours",
        linkText: "Manage",
      });
    }

    return items;
  }, [bookings, tours, blocked, tokens]);

  if (actions.length === 0) {
    return (
      <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20">
        <CardContent className="py-3 px-4 text-sm text-emerald-700 dark:text-emerald-400">
          ✓ Nothing requires your attention.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
      <CardContent className="py-3 px-4">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
          ⚠️ {actions.length} thing{actions.length !== 1 ? "s" : ""} need
          {actions.length === 1 ? "s" : ""} attention
        </p>
        <div className="space-y-1.5">
          {actions.map((a) => (
            <div key={a.id} className="flex items-center justify-between text-xs">
              <span className="text-amber-700 dark:text-amber-400">{a.message}</span>
              <Button asChild variant="ghost" size="sm" className="h-6 text-xs px-2 shrink-0 ml-2">
                <Link href={a.link}>{a.linkText}</Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
