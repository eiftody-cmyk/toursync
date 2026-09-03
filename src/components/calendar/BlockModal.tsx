"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Tour } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { format, addDays, isBefore, parseISO } from "date-fns";

export function BlockModal({
  open,
  onOpenChange,
  tours,
  defaultDate,
  filterTour,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tours: Tour[];
  defaultDate: string;
  filterTour: string;
  onSuccess: () => void;
}) {
  const [date, setDate] = useState(defaultDate);
  const [endDate, setEndDate] = useState("");
  const [isAllDay, setIsAllDay] = useState(true);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setDate(defaultDate);
      setEndDate("");
      setIsAllDay(true);
      setStartTime("");
      setEndTime("");
      setReason("");
    }
  }, [open, defaultDate]);

  /** Generate array of YYYY-MM-DD strings from start to end (inclusive) */
  function dateRange(start: string, end: string): string[] {
    const dates: string[] = [];
    let d = parseISO(start);
    const endD = parseISO(end);
    while (!isBefore(endD, d)) {
      dates.push(format(d, "yyyy-MM-dd"));
      d = addDays(d, 1);
    }
    return dates;
  }

  async function submit() {
    if (!date) {
      toast.error("Date is required");
      return;
    }
    if (!isAllDay && !startTime) {
      toast.error("Start time is required for timed block");
      return;
    }
    if (endDate && isBefore(parseISO(endDate), parseISO(date))) {
      toast.error("End date must be after start date");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      setLoading(false);
      return;
    }

    // Compute dates to block
    const dates = endDate ? dateRange(date, endDate) : [date];

    // Which tours to block — follows calendar filter
    const toursToBlock =
      filterTour === "all"
        ? tours
        : tours.filter((t) => t.id === filterTour);

    let blockedCount = 0;
    let syncedCount = 0;
    let failedCount = 0;
    let lastError = "";
    let googleSkipped = false;

    for (const tour of toursToBlock) {
      for (const d of dates) {
        // Check if already blocked for this tour+date
        // select calendar_id may fail if 003 migration not applied — fall back to simpler select
        let existingBlock: { google_calendar_event_id: string | null; calendar_id: string | null } | null = null;
        {
          const normalizedSlot = isAllDay ? null : startTime || null;
          let query = supabase
            .from("blocked_dates")
            .select("google_calendar_event_id, calendar_id")
            .eq("date", d)
            .eq("user_id", user.id)
            .eq("tour_id", tour.id)
            .not("google_calendar_event_id", "is", null);
          query = normalizedSlot ? query.eq("start_time", normalizedSlot) : query.is("start_time", null);
          const result = await query.maybeSingle();
          if (result.error) {
            let fallback = supabase
              .from("blocked_dates")
              .select("google_calendar_event_id")
              .eq("date", d)
              .eq("user_id", user.id)
              .eq("tour_id", tour.id)
              .not("google_calendar_event_id", "is", null);
            fallback = normalizedSlot ? fallback.eq("start_time", normalizedSlot) : fallback.is("start_time", null);
            const fallbackResult = await fallback.maybeSingle();
            existingBlock = fallbackResult.data
              ? { google_calendar_event_id: fallbackResult.data.google_calendar_event_id, calendar_id: null }
              : null;
          } else {
            existingBlock = result.data;
          }
        }

        let googleEventId: string | null = null;
        let calendarId: string | null = null;

        if (existingBlock?.google_calendar_event_id) {
          // Reuse existing Google event for this tour+date
          googleEventId = existingBlock.google_calendar_event_id;
          calendarId = existingBlock.calendar_id ?? null;
        } else {
          // Create new Google event
          try {
            const summary = `Blocked — ${tour.name}`;
            const res = await fetch("/api/calendar/block", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tour_id: tour.id,
                date: d,
                start_time: isAllDay ? null : startTime || null,
                end_time: isAllDay ? null : endTime || null,
                reason: reason || null,
                summary,
              }),
            });
            if (res.ok) {
              const json = await res.json();
              googleEventId = json.eventId ?? null;
              calendarId = json.calendarId ?? null;
              if (googleEventId) syncedCount++;
              else if (json.warning) googleSkipped = true;
            } else {
              googleSkipped = true;
            }
          } catch {
            googleSkipped = true;
          }
        }

        // Insert blocked_dates row (one per tour per date)
        // Try with calendar_id first; if column missing (003 not applied), retry without it
        let insertResult = await supabase.from("blocked_dates").insert({
          tour_id: tour.id,
          user_id: user.id,
          date: d,
          start_time: isAllDay ? null : startTime || null,
          end_time: isAllDay ? null : endTime || null,
          reason: reason || null,
          google_calendar_event_id: googleEventId,
          calendar_id: calendarId,
          is_auto_blocked: false,
        });

        if (insertResult.error && (insertResult.error.message?.includes("calendar_id") || insertResult.error.code === "42703")) {
          // calendar_id column doesn't exist yet — insert without it
          insertResult = await supabase.from("blocked_dates").insert({
            tour_id: tour.id,
            user_id: user.id,
            date: d,
            start_time: isAllDay ? null : startTime || null,
            end_time: isAllDay ? null : endTime || null,
            reason: reason || null,
            google_calendar_event_id: googleEventId,
            is_auto_blocked: false,
          });
        }

        if (insertResult.error) {
          if (insertResult.error.code === "23505") {
            // Already blocked — skip silently
          } else {
            failedCount++;
            lastError = insertResult.error.message ?? "Unknown error";
          }
        } else {
          blockedCount++;
        }
      }
    }

    setLoading(false);

    const totalExpected = toursToBlock.length * dates.length;
    if (blockedCount === 0 && failedCount === 0) {
      toast.success(`All ${totalExpected} blocks already existed`);
    } else if (failedCount > 0) {
      toast.error(`${failedCount} blocks failed — ${blockedCount} succeeded${lastError ? `: ${lastError}` : ""}`);
    } else {
      const msg = `${blockedCount} date${blockedCount !== 1 ? "s" : ""} blocked`;
      const detail = toursToBlock.length > 1 ? ` across ${toursToBlock.length} tours` : "";
      const sync = syncedCount > 0 ? ` & ${syncedCount} synced to Google` : "";
      toast.success(`${msg}${detail}${sync}`);
      if (googleSkipped) {
        toast.warning("Google Calendar sync skipped — check Settings > Google Calendar connection");
      }
    }

    onOpenChange(false);
    await onSuccess();
  }

  const dateCount = endDate
    ? dateRange(date, endDate).length
    : 1;
  const tourCount = filterTour === "all" ? tours.length : 1;
  const totalBlocks = dateCount * tourCount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Block time</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date (JST)</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label>End date (range)</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Single day if empty"
              />
            </div>
          </div>

          <div>
            <Label>Block time</Label>
            <div className="flex gap-2 mt-1">
              <Button
                type="button"
                variant={isAllDay ? "default" : "outline"}
                size="sm"
                onClick={() => { setIsAllDay(true); setStartTime(""); setEndTime(""); }}
              >
                All day
              </Button>
              <Button
                type="button"
                variant={!isAllDay ? "default" : "outline"}
                size="sm"
                onClick={() => setIsAllDay(false)}
              >
                Select time
              </Button>
            </div>
          </div>

          {!isAllDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Starts</Label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div>
                <Label>Ends</Label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
          )}

          <div>
            <Label>Blocking</Label>
            <div className="mt-1 p-2 rounded border bg-muted text-sm">
              {filterTour === "all"
                ? `All tours (${tours.length})`
                : tours.find((t) => t.id === filterTour)?.name ?? "Selected tour"}
              <span className="text-xs text-muted-foreground ml-2">— set via calendar filter</span>
            </div>
          </div>

          <div>
            <Label>Reason</Label>
            <Input
              placeholder="Typhoon, sick day, personal, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {totalBlocks > 1 && (
            <p className="text-xs text-muted-foreground text-center">
              This will create {totalBlocks} blocks ({tourCount} tour{tourCount !== 1 ? "s" : ""} × {dateCount} day{dateCount !== 1 ? "s" : ""})
            </p>
          )}

          <Button onClick={submit} disabled={loading} className="w-full">
            {loading ? "Blocking..." : "Block Date"}
          </Button>

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p><strong>All day</strong> + <strong>All</strong> → one Busy event per tour calendar each day (e.g. typhoon blocks all experiences).</p>
            <p><strong>All day</strong> + <strong>single tour</strong> → blocks only that tour (e.g. sick day — other tours stay live).</p>
            <p><strong>Select time</strong> → blocks that time window per day per tour.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
