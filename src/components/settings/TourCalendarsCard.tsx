"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { Tour } from "@/types";
import { toast } from "sonner";

export function TourCalendarsCard() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  async function loadTours() {
    const supabase = createClient();
    const { data } = await supabase.from("tours").select("*").order("name");
    if (data) setTours(data as Tour[]);
  }

  useEffect(() => {
    loadTours();
  }, []);

  async function createCalendar(tourId: string) {
    setLoading(tourId);
    try {
      const res = await fetch("/api/calendar/create-tour-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tour_id: tourId }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to create calendar");
      } else {
        toast.success(json.already_exists ? "Calendar already exists" : `Calendar created: ${json.summary}`);
        loadTours();
      }
    } catch {
      toast.error("Network error");
    }
    setLoading(null);
  }

  async function deleteCalendar(tourId: string, tourName: string) {
    if (!confirm(`Delete Google Calendar for "${tourName}"? Blocks on this calendar will be orphaned.`)) return;
    setLoading(tourId);
    try {
      const res = await fetch("/api/calendar/delete-tour-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tour_id: tourId }),
      });
      const json = await res.json();
      if (!res.ok && !json.ok) {
        toast.error(json.error ?? "Failed to delete calendar");
      } else {
        toast.success("Calendar removed from tour");
        loadTours();
      }
    } catch {
      toast.error("Network error");
    }
    setLoading(null);
  }

  if (tours.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tour Calendars</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          Each tour can have its own Google Calendar. When you block a date, only that tour&apos;s calendar gets a
          &quot;busy&quot; event — other Airbnb Experiences stay live.
        </p>
        <div className="space-y-2">
          {tours.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-2 p-2 rounded border">
              <div className="min-w-0">
                <span className="font-medium">{t.name}</span>
                <span className="ml-2 text-muted-foreground">
                  {t.google_calendar_id ? (
                    <Badge variant="outline" className="text-xs">
                      calendar connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      no calendar
                    </Badge>
                  )}
                </span>
              </div>
              <div className="flex gap-1 shrink-0">
                {t.google_calendar_id ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteCalendar(t.id, t.name)}
                    disabled={loading === t.id}
                  >
                    {loading === t.id ? "..." : "Remove"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => createCalendar(t.id)}
                    disabled={loading === t.id}
                  >
                    {loading === t.id ? "..." : "Create calendar"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Each tour needs its own calendar for per-tour blocking. For each tour:
          <br />
          <strong>Google Calendar</strong> → Settings → left sidebar → click <code>TourSync — [Tour]</code> → scroll to{" "}
          <strong>Integrate calendar</strong> → copy <strong>Secret address in iCal format</strong> (starts with{" "}
          <code>https://calendar.google.com/calendar/ical/...</code>).
          <br />
          <strong>Airbnb</strong> → that Experience → Availability → Sync calendars → Import calendar → paste the secret
          URL.
          <br />
          Repeat for each tour 1:1. Do <em>not</em> use Google Calendar&apos;s &quot;Add calendar from URL&quot; — that
          imports the opposite direction (Airbnb → Google).
        </p>
        <div className="p-2 rounded bg-muted text-[11px] text-muted-foreground border">
          <strong>Why Secret?</strong> Google&apos;s warning &quot;don&apos;t give to other people&quot; means don&apos;t
          share the link with humans. Pasting into Airbnb as an &quot;other application&quot; is the intended use — Airbnb
          stores it server-side and polls privately. Calendar stays private. You can reset the URL anytime: same Settings →{" "}
          <strong>Integrate calendar</strong> → <strong>Reset secret address</strong>. &quot;Public address&quot; works too
          but requires making the calendar world-readable — not recommended.
        </div>
      </CardContent>
    </Card>
  );
}
