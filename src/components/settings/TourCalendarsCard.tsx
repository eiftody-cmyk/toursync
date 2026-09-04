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
        <CardTitle className="text-base">Step 2: Per-Tour Calendars</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          Every tour <strong>MUST</strong> have its own calendar for Airbnb sync to work.
          When you block a date, only that tour&apos;s calendar gets a &quot;busy&quot; event — other Airbnb Experiences
          stay live.
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
                    <Badge variant="destructive" className="text-xs">
                      setup required
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
          Create a calendar for each tour using the button above. Then in Airbnb:
          <br />
          Go to your Experience → <strong>Availability</strong> → <strong>Connect your Google Calendar</strong> → select the
          calendar with the matching tour name.
          <br />
          Repeat for each tour 1:1.
        </p>
      </CardContent>
    </Card>
  );
}
