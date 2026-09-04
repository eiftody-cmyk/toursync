"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Tour } from "@/types";
import { BOOKING_SOURCES } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function BookingModal({
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
  const [tourId, setTourId] = useState<string>(tours[0]?.id ?? "");
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [guestCount, setGuestCount] = useState("2");
  const [source, setSource] = useState<string>("viator");
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [remainingForSlot, setRemainingForSlot] = useState<number | null>(null);

  useEffect(() => {
    if (tours.length > 0 && !tourId) {
      setTourId(tours[0].id);
    }
  }, [tours, tourId]);

  useEffect(() => {
    if (open) {
      setDate(defaultDate);
      setStartTime("");
      setEndTime("");
      setGuestCount("2");
      setSource("viator");
      setCustomerName("");
      setRemainingForSlot(null);
      if (filterTour !== "all" && tours.some((t) => t.id === filterTour)) {
        setTourId(filterTour);
      } else if (tours.length > 0) {
        setTourId(tours[0].id);
      }
    }
  }, [open, defaultDate, filterTour, tours]);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!open || !tourId || !date) {
        setRemainingForSlot(null);
        return;
      }
      const res = await fetch("/api/bookings/auto-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tour_id: tourId, date, start_time: startTime || null }),
      });
      if (!active || !res.ok) return;
      const json = await res.json();
      if (active) setRemainingForSlot(typeof json.remaining === "number" ? json.remaining : null);
    }
    load();
    return () => { active = false; };
  }, [open, tourId, date, startTime]);

  function tourLabel(t: Tour) {
    const price = t.price ? ` · ${t.currency === "JPY" ? "¥" : t.currency + " "}${t.price}` : "";
    return `${t.name} (${t.capacity} max${price})`;
  }

  async function submit() {
    if (!tourId) {
      toast.error("Select a tour");
      return;
    }
    if (!date) {
      toast.error("Date is required");
      return;
    }
    const guests = parseInt(guestCount, 10);
    if (!guests || guests < 1) {
      toast.error("Guest count must be at least 1");
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

    const { error } = await supabase.from("bookings").insert({
      tour_id: tourId,
      user_id: user.id,
      date,
      guest_count: guests,
      source,
      customer_name: customerName.trim() || null,
      start_time: startTime || null,
      end_time: endTime || null,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Check auto-block via API
    try {
      const res = await fetch("/api/bookings/auto-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tour_id: tourId, date, start_time: startTime || null }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.autoBlocked) toast.success("Tour is now FULL — auto-blocked on Google Calendar");
        else toast.success("Booking added");
      } else {
        toast.success("Booking added");
      }
    } catch {
      toast.success("Booking added");
    }

    setLoading(false);
    onOpenChange(false);
    await onSuccess();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Booking (Quick Entry)</DialogTitle>
        </DialogHeader>
        <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Manual entry</strong> — record bookings from any source (phone, email, walk-in, Viator, Airbnb, etc.).
            This does NOT connect to booking platforms.
          </p>
          <p>
            Adjust guest count as needed. When capacity is reached, TourSync auto-blocks the date on Airbnb
            (prevents new bookings, does NOT cancel existing ones).
          </p>
        </div>
        <div className="space-y-3">
          <div>
            <Label>Date (JST)</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Tour</Label>
            {tours.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tours yet — create one at /tours first.</p>
            ) : (
              <Select value={tourId} onValueChange={(v: string | null) => setTourId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tour">
                    {tours.find((t) => t.id === tourId)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {tours.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {tourLabel(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start time (JST)</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <Label>End time (JST)</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Guests</Label>
            <Input
              type="number"
              min={1}
              max={remainingForSlot != null && remainingForSlot > 0 ? remainingForSlot : 20}
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
            />
            {remainingForSlot != null && (
              <p className="mt-1 text-xs text-muted-foreground">
                {remainingForSlot > 0 ? `${remainingForSlot} spot${remainingForSlot === 1 ? "" : "s"} left in this slot` : "This slot is full"}
              </p>
            )}
          </div>
          <div>
            <Label>Source</Label>
            <Select value={source} onValueChange={(v: string | null) => setSource(v ?? "viator")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BOOKING_SOURCES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Customer Name (optional)</Label>
            <Input
              placeholder="Tanaka"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <Button
            onClick={submit}
            disabled={loading || (remainingForSlot != null && remainingForSlot <= 0)}
            className="w-full"
          >
            {loading ? "Adding..." : "Add Booking"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
