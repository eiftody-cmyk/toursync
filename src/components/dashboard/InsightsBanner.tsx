"use client";

import { useState, useMemo, useEffect } from "react";
import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Booking, Tour, BlockedDate } from "@/types";

type Insight = {
  id: string;
  message: string;
  type: "warning" | "info";
};

const DISMISSED_KEY = "dashboard_dismissed_insights";

function getDismissed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveDismissed(ids: Set<string>) {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids]));
}

export function InsightsBanner({
  bookings,
  tours,
  blocked,
}: {
  bookings: Booking[];
  tours: Tour[];
  blocked: BlockedDate[];
}) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setDismissed(getDismissed());
    setLoaded(true);
  }, []);

  const insights = useMemo(() => {
    const now = new Date();
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const ninetyDaysStr = ninetyDaysAgo.toISOString().split("T")[0];

    const result: Insight[] = [];

    // Check for tours with 0 bookings in 90 days
    for (const tour of tours) {
      const recentBookings = bookings.filter(
        (b) =>
          b.tour_id === tour.id &&
          b.status === "confirmed" &&
          b.date >= ninetyDaysStr
      );
      if (recentBookings.length === 0 && bookings.some((b) => b.tour_id === tour.id)) {
        result.push({
          id: `inactive-${tour.id}`,
          message: `${tour.name} has 0 bookings in 90 days — consider revising listing`,
          type: "warning",
        });
      }
    }

    // Check for GYG test blocks
    const gygBlocks = blocked.filter(
      (bl) => bl.reason?.toLowerCase().includes("gyg") || bl.reason?.toLowerCase().includes("test")
    );
    if (gygBlocks.length > 2) {
      result.push({
        id: "gyg-test-blocks",
        message: `${gygBlocks.length} GYG test blocks detected — check integration`,
        type: "warning",
      });
    }

    // Tomorrow's tours
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    const tomorrowBookings = bookings.filter(
      (b) => b.date === tomorrowStr && b.status === "confirmed"
    );
    if (tomorrowBookings.length > 0) {
      const totalGuests = tomorrowBookings.reduce((s, b) => s + b.guest_count, 0);
      result.push({
        id: "tomorrow-tours",
        message: `${tomorrowBookings.length} tour${tomorrowBookings.length !== 1 ? "s" : ""} tomorrow — ${totalGuests} guest${totalGuests !== 1 ? "s" : ""}`,
        type: "info",
      });
    }

    return result;
  }, [bookings, tours, blocked]);

  const visible = loaded ? insights.filter((i) => !dismissed.has(i.id)) : [];

  if (visible.length === 0) return null;

  function dismiss(id: string) {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    saveDismissed(next);
  }

  function dismissAll() {
    const ids = new Set(visible.map((i) => i.id));
    setDismissed(ids);
    saveDismissed(ids);
  }

  return (
    <div className="space-y-2">
      {visible.map((insight) => (
        <div
          key={insight.id}
          className={`flex items-center justify-between rounded-lg px-4 py-2 text-sm ${
            insight.type === "warning"
              ? "bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-200"
              : "bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {insight.type === "warning" ? (
              <AlertTriangle className="h-4 w-4 shrink-0" />
            ) : (
              <Info className="h-4 w-4 shrink-0" />
            )}
            <span>{insight.message}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 shrink-0"
            onClick={() => dismiss(insight.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
      {visible.length > 1 && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" className="text-xs h-6" onClick={dismissAll}>
            Dismiss all
          </Button>
        </div>
      )}
    </div>
  );
}
