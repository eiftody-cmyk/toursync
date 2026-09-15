"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

type ActivityEvent = {
  id: string;
  type: string;
  message: string;
  tour_name: string | null;
  detail: string | null;
  created_at: string;
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;

  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

const EVENT_ICONS: Record<string, string> = {
  booking_created: "📅",
  booking_cancelled: "❌",
  block_created: "🔒",
  block_removed: "🔓",
  availability_synced: "🔄",
};

export function ActivityLog() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { data: bookings } = await supabase
        .from("bookings")
        .select("id, tour_id, date, source, status, created_at, tours(name)")
        .gte("created_at", oneDayAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(20);

      const { data: blocks } = await supabase
        .from("blocked_dates")
        .select("id, tour_id, date, reason, is_auto_blocked, created_at, tours(name)")
        .gte("created_at", oneDayAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(20);

      const allEvents: ActivityEvent[] = [];

      for (const b of bookings ?? []) {
        const tourData = b.tours as unknown as { name: string } | null;
        const tourName = tourData?.name ?? null;
        if (b.status === "cancelled") {
          allEvents.push({
            id: `cancel-${b.id}`,
            type: "booking_cancelled",
            message: "Booking cancelled",
            tour_name: tourName,
            detail: `${b.date}${b.source ? ` · ${b.source}` : ""}`,
            created_at: b.created_at,
          });
        } else {
          allEvents.push({
            id: `book-${b.id}`,
            type: "booking_created",
            message: "New booking",
            tour_name: tourName,
            detail: `${b.date}${b.source ? ` · ${b.source}` : ""}`,
            created_at: b.created_at,
          });
        }
      }

      for (const bl of blocks ?? []) {
        const tourData = bl.tours as unknown as { name: string } | null;
        const tourName = tourData?.name ?? null;
        allEvents.push({
          id: `block-${bl.id}`,
          type: bl.is_auto_blocked ? "availability_synced" : "block_created",
          message: bl.is_auto_blocked ? "Availability synced" : "Block created",
          tour_name: tourName,
          detail: `${bl.date}${bl.reason ? ` · ${bl.reason}` : ""}`,
          created_at: bl.created_at,
        });
      }

      allEvents.sort((a, b) => b.created_at.localeCompare(a.created_at));
      setEvents(allEvents.slice(0, 10));
      setLoading(false);
    }

    load();
  }, []);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity.</p>
        ) : (
          <div className="space-y-2">
            {events.map((e) => (
              <div key={e.id} className="flex items-start gap-2 text-sm">
                <span className="text-xs shrink-0 mt-0.5">
                  {EVENT_ICONS[e.type] ?? "•"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-xs">{e.message}</span>
                    {e.tour_name && (
                      <span className="text-xs text-muted-foreground truncate">
                        · {e.tour_name}
                      </span>
                    )}
                  </div>
                  {e.detail && (
                    <p className="text-xs text-muted-foreground">{e.detail}</p>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                  {timeAgo(e.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
