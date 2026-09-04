"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { TourSchedule, ScheduleException } from "@/types";
import { DAY_NAMES } from "@/types";

export function ScheduleEditor({ tourId }: { tourId: string }) {
  const [schedules, setSchedules] = useState<TourSchedule[]>([]);
  const [exceptions, setExceptions] = useState<ScheduleException[]>([]);
  const [loading, setLoading] = useState(true);

  // New schedule form
  const [newDay, setNewDay] = useState<string>("6"); // Saturday
  const [newTime, setNewTime] = useState("10:00");
  const [newDuration, setNewDuration] = useState("150");
  const [newStartDate, setNewStartDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [newEndDate, setNewEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  // New exception form
  const [exceptionDate, setExceptionDate] = useState("");
  const [exceptionReason, setExceptionReason] = useState("");
  const [addingException, setAddingException] = useState(false);

  const fetchSchedules = useCallback(async () => {
    const supabase = createClient();
    const { data: sData } = await supabase
      .from("tour_schedules")
      .select("*")
      .eq("tour_id", tourId)
      .order("day_of_week");
    if (sData) setSchedules(sData as TourSchedule[]);

    const { data: eData } = await supabase
      .from("schedule_exceptions")
      .select("*")
      .eq("tour_id", tourId)
      .order("date");
    if (eData) setExceptions(eData as ScheduleException[]);
    setLoading(false);
  }, [tourId]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  async function addSchedule() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("tour_schedules").insert({
      tour_id: tourId,
      user_id: user.id,
      day_of_week: parseInt(newDay, 10),
      start_time: newTime,
      duration_minutes: parseInt(newDuration, 10) || 150,
      start_date: newStartDate,
      end_date: newEndDate || null,
      is_active: true,
    });

    setSaving(false);
    if (error) {
      if (error.code === "23505") {
        toast.error("This day/time combination already exists");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Schedule added");
      fetchSchedules();
    }
  }

  async function removeSchedule(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("tour_schedules").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Schedule removed");
      fetchSchedules();
    }
  }

  async function toggleScheduleActive(schedule: TourSchedule) {
    const supabase = createClient();
    const { error } = await supabase
      .from("tour_schedules")
      .update({ is_active: !schedule.is_active })
      .eq("id", schedule.id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Schedule ${schedule.is_active ? "deactivated" : "activated"}`);
      fetchSchedules();
    }
  }

  async function addException() {
    if (!exceptionDate) {
      toast.error("Date is required");
      return;
    }
    setAddingException(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      setAddingException(false);
      return;
    }

    const { error } = await supabase.from("schedule_exceptions").insert({
      tour_id: tourId,
      user_id: user.id,
      date: exceptionDate,
      reason: exceptionReason.trim() || null,
    });

    setAddingException(false);
    if (error) {
      if (error.code === "23505") {
        toast.error("This date already has an exception");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Exception added");
      setExceptionDate("");
      setExceptionReason("");
      fetchSchedules();
    }
  }

  async function removeException(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("schedule_exceptions").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Exception removed");
      fetchSchedules();
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading schedules...</p>;
  }

  return (
    <div className="space-y-4">
      {/* Existing schedules */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Tour Schedule
        </Label>
        {schedules.length > 0 ? (
          <div className="space-y-1">
            {schedules.map((s) => (
              <div key={s.id} className="flex items-center gap-2 text-sm">
                <span className="font-medium w-24">{DAY_NAMES[s.day_of_week]}</span>
                <span className="text-muted-foreground">{s.start_time}</span>
                <span className="text-muted-foreground text-xs">({s.duration_minutes} min)</span>
                {s.end_date && (
                  <span className="text-muted-foreground text-xs">until {s.end_date}</span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => toggleScheduleActive(s)}
                >
                  {s.is_active ? "Active" : "Paused"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeSchedule(s.id)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">No schedules set — all dates are available</p>
        )}
      </div>

      {/* Add schedule form */}
      <div className="grid grid-cols-2 gap-2 items-end">
        <div>
          <Label className="text-xs">Day</Label>
          <Select value={newDay} onValueChange={(v: string | null) => { if (v) setNewDay(v); }}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAY_NAMES.map((name, i) => (
                <SelectItem key={i} value={String(i)}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Time (JST)</Label>
          <Input
            type="time"
            className="h-8 text-xs"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs">Duration (min)</Label>
          <Input
            type="number"
            className="h-8 text-xs"
            min={30}
            value={newDuration}
            onChange={(e) => setNewDuration(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs">Start Date</Label>
          <Input
            type="date"
            className="h-8 text-xs"
            value={newStartDate}
            onChange={(e) => setNewStartDate(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs">End Date (optional)</Label>
          <Input
            type="date"
            className="h-8 text-xs"
            value={newEndDate}
            onChange={(e) => setNewEndDate(e.target.value)}
          />
        </div>
        <div>
          <Button
            size="sm"
            className="h-8"
            onClick={addSchedule}
            disabled={saving}
          >
            {saving ? "..." : "+ Add"}
          </Button>
        </div>
      </div>

      {/* Exceptions */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Exceptions (dates to skip)
        </Label>
        {exceptions.length > 0 ? (
          <div className="space-y-1">
            {exceptions.map((e) => (
              <div key={e.id} className="flex items-center gap-2 text-sm">
                <span className="font-mono text-xs">{e.date}</span>
                {e.reason && (
                  <span className="text-muted-foreground text-xs">{e.reason}</span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeException(e.id)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">No exceptions</p>
        )}
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Label className="text-xs">Date</Label>
            <Input
              type="date"
              className="h-8 text-xs"
              value={exceptionDate}
              onChange={(e) => setExceptionDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Label className="text-xs">Reason (optional)</Label>
            <Input
              className="h-8 text-xs"
              placeholder="Christmas"
              value={exceptionReason}
              onChange={(e) => setExceptionReason(e.target.value)}
            />
          </div>
          <Button
            size="sm"
            className="h-8"
            onClick={addException}
            disabled={addingException}
          >
            {addingException ? "..." : "Add"}
          </Button>
        </div>
      </div>
    </div>
  );
}
