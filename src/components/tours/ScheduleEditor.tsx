"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { TourSchedule } from "@/types";

const DAY_ABBREVS = ["S", "M", "T", "W", "T", "F", "S"] as const;
const DAY_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const DEFAULT_TIME = "10:00";
const DEFAULT_DURATION = 150;

export function ScheduleEditor({ tourId }: { tourId: string }) {
  const [schedules, setSchedules] = useState<TourSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [savingDay, setSavingDay] = useState<number | null>(null);

  // Group schedules by day_of_week
  const byDay: Record<number, TourSchedule[]> = {};
  for (const s of schedules) {
    if (!byDay[s.day_of_week]) byDay[s.day_of_week] = [];
    byDay[s.day_of_week].push(s);
  }
  // Sort each day's slots by start_time
  for (const day of Object.keys(byDay)) {
    byDay[Number(day)].sort((a, b) => a.start_time.localeCompare(b.start_time));
  }

  // Days that have any schedule
  const activeDays = new Set(schedules.map((s) => s.day_of_week));

  const fetchSchedules = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("tour_schedules")
      .select("*")
      .eq("tour_id", tourId)
      .order("day_of_week");
    if (data) {
      setSchedules(data as TourSchedule[]);
      // Set start_date from first schedule if available
      if (data.length > 0) {
        setStartDate((data as TourSchedule[])[0].start_date);
      }
    }
    setLoading(false);
  }, [tourId]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  async function addTimeSlot(dayOfWeek: number) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      return;
    }

    setSavingDay(dayOfWeek);

    // Find an unused time for this day
    const existingTimes = (byDay[dayOfWeek] ?? []).map((s) => s.start_time);
    let newTime = DEFAULT_TIME;
    if (existingTimes.includes(newTime)) {
      // Try 14:00, then 09:00, then any hour not taken
      const candidates = ["14:00", "09:00", "11:00", "13:00", "15:00", "16:00"];
      newTime = candidates.find((t) => !existingTimes.includes(t)) ?? "12:00";
    }

    const { error } = await supabase.from("tour_schedules").insert({
      tour_id: tourId,
      user_id: user.id,
      day_of_week: dayOfWeek,
      start_time: newTime,
      duration_minutes: DEFAULT_DURATION,
      start_date: startDate,
      is_active: true,
    });

    setSavingDay(null);
    if (error) {
      if (error.code === "23505") {
        toast.error("This time slot already exists");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success(`${DAY_FULL[dayOfWeek]} ${newTime} added`);
      fetchSchedules();
    }
  }

  async function toggleDay(dayOfWeek: number) {
    if (activeDays.has(dayOfWeek)) {
      // Turn off — remove all slots for this day
      const slots = byDay[dayOfWeek] ?? [];
      if (slots.length > 0) {
        const confirmed = confirm(
          `Remove all ${DAY_FULL[dayOfWeek]} time slots? (${slots.length} slot${slots.length > 1 ? "s" : ""})`
        );
        if (!confirmed) return;
      }
      const supabase = createClient();
      for (const slot of slots) {
        await supabase.from("tour_schedules").delete().eq("id", slot.id);
      }
      toast.success(`${DAY_FULL[dayOfWeek]} removed`);
      fetchSchedules();
    } else {
      // Turn on — add default time slot
      await addTimeSlot(dayOfWeek);
    }
  }

  async function removeSlot(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("tour_schedules").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Time slot removed");
      fetchSchedules();
    }
  }

  async function updateSlotTime(schedule: TourSchedule, newTime: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("tour_schedules")
      .update({ start_time: newTime })
      .eq("id", schedule.id);
    if (error) {
      if (error.code === "23505") {
        toast.error("This time slot already exists");
      } else {
        toast.error(error.message);
      }
    } else {
      fetchSchedules();
    }
  }

  async function updateSlotDuration(schedule: TourSchedule, newDuration: string) {
    const mins = parseInt(newDuration, 10);
    if (!mins || mins < 15) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("tour_schedules")
      .update({ duration_minutes: mins })
      .eq("id", schedule.id);
    if (error) toast.error(error.message);
    else fetchSchedules();
  }

  async function updateStartDate(newDate: string) {
    setStartDate(newDate);
    // Update all schedules' start_date
    const supabase = createClient();
    for (const s of schedules) {
      await supabase
        .from("tour_schedules")
        .update({ start_date: newDate })
        .eq("id", s.id);
    }
    fetchSchedules();
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading schedules...</p>;
  }

  // Days with active schedules, sorted
  const activeDayNumbers = Object.keys(byDay)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="space-y-4">
      {/* Day buttons */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Days this tour runs
        </Label>
        <div className="flex gap-1.5">
          {DAY_ABBREVS.map((abbr, i) => {
            const isActive = activeDays.has(i);
            return (
              <Button
                key={i}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={`h-9 w-9 p-0 text-sm font-medium ${
                  isActive ? "" : "text-muted-foreground"
                }`}
                disabled={savingDay === i}
                onClick={() => toggleDay(i)}
              >
                {abbr}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Time slots per day */}
      {activeDayNumbers.length > 0 ? (
        <div className="space-y-4">
          {activeDayNumbers.map((dayNum) => (
            <div key={dayNum} className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                {DAY_FULL[dayNum]}
              </p>
              {(byDay[dayNum] ?? []).map((s) => (
                <div key={s.id} className="flex items-center gap-2 text-sm">
                  <Input
                    type="time"
                    className="h-7 w-28 text-xs font-mono"
                    value={s.start_time}
                    onChange={(e) => updateSlotTime(s, e.target.value)}
                  />
                  <Input
                    type="number"
                    className="h-7 w-20 text-xs"
                    min={15}
                    value={s.duration_minutes}
                    onChange={(e) => updateSlotDuration(s, e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground">min</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive ml-auto"
                    onClick={() => removeSlot(s.id)}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
                onClick={() => addTimeSlot(dayNum)}
                disabled={savingDay === dayNum}
              >
                + Add time
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">
          Click a day above to add time slots
        </p>
      )}

      {/* Start date */}
      {schedules.length > 0 && (
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Schedule starts:</Label>
          <Input
            type="date"
            className="h-7 w-36 text-xs"
            value={startDate}
            onChange={(e) => updateStartDate(e.target.value)}
          />
          <span className="text-xs text-muted-foreground">runs indefinitely</span>
        </div>
      )}
    </div>
  );
}
