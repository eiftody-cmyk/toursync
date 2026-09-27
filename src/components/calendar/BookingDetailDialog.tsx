"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/time";
import { createClient } from "@/lib/supabase/client";
import { fetchGuestBookings, isMatchableName, type GuestBooking } from "@/lib/crm/guest-history";
import type { Tour, Booking } from "@/types";

/** Machine notes (GYG JSON / PayPal order refs) are not human-readable — summarize. */
function refSummary(notes: string | null): string | null {
  if (!notes) return null;
  try {
    const parsed = JSON.parse(notes);
    if (parsed && typeof parsed === "object") return "Channel sync data";
  } catch {
    // plain text (e.g. "PayPal order: 31X…") — show as-is
  }
  return notes;
}

export function BookingDetailDialog({
  open,
  onOpenChange,
  booking,
  tour,
  onDelete,
  onSaveNotes,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  booking: Booking | null;
  tour: Tour | undefined;
  onDelete: (b: Booking) => void;
  onSaveNotes: (id: string, guestNotes: string) => Promise<void>;
}) {
  const [guestNotes, setGuestNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<GuestBooking[] | null>(null);

  const bookingId = booking?.id ?? null;
  const customerName = booking?.customer_name ?? null;

  useEffect(() => {
    if (!open || !bookingId) return;
    setGuestNotes(booking?.guest_notes ?? "");
    setSaving(false);
    setHistory(null);
    let active = true;
    (async () => {
      const supabase = createClient();
      const rows = await fetchGuestBookings(supabase, customerName, { excludeId: bookingId });
      if (active) setHistory(rows);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, bookingId, customerName]);

  if (!booking) return null;

  const tourName = tour?.name ?? "Unknown tour";
  const timeLabel = booking.start_time && booking.end_time
    ? `${formatTime(booking.start_time)} – ${formatTime(booking.end_time)} JST`
    : booking.start_time
      ? `${formatTime(booking.start_time)} JST`
      : "All day";
  const ref = refSummary(booking.notes);
  const dirty = guestNotes !== (booking.guest_notes ?? "");

  async function saveNotes() {
    if (!booking || !dirty) return;
    setSaving(true);
    await onSaveNotes(booking.id, guestNotes.trim());
    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Booking — {booking.date}</DialogTitle>
          <DialogDescription>{tourName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-20">Tour</span>
            <span className="font-medium">{tourName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-20">Date</span>
            <span>{booking.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-20">Time</span>
            <span>{timeLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-20">Guests</span>
            <Badge variant="outline">+{booking.guest_count}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-20">Source</span>
            <Badge variant="secondary">{booking.source ?? "—"}</Badge>
          </div>
          {booking.customer_name && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground w-20">Customer</span>
              <span>{booking.customer_name}</span>
              {booking.customer_country && (
                <Badge variant="outline" className="text-[10px]">{booking.customer_country}</Badge>
              )}
            </div>
          )}
          {ref && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground w-20">Ref</span>
              <span className="truncate">{ref}</span>
            </div>
          )}
        </div>

        <div className="space-y-2 border-t pt-3">
          <label htmlFor="guest-notes" className="text-sm font-medium">
            Guest note
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              Shown in your reminder when this guest returns
            </span>
          </label>
          <textarea
            id="guest-notes"
            value={guestNotes}
            onChange={(e) => setGuestNotes(e.target.value)}
            rows={3}
            placeholder="e.g. Laura tipped ¥10,000 — wanted the kokeshi shop recommendation"
            className="w-full border rounded-md px-3 py-2 text-sm bg-background"
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={saveNotes} disabled={!dirty || saving}>
              {saving ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </div>

        <div className="border-t pt-3 space-y-2">
          <p className="text-sm font-medium">Guest History</p>
          {!isMatchableName(customerName) ? (
            <p className="text-xs text-muted-foreground">
              Add a full guest name (two words) to this booking to match past tours.
            </p>
          ) : history === null ? (
            <p className="text-xs text-muted-foreground">Loading guest history…</p>
          ) : history.length === 0 ? (
            <p className="text-xs text-muted-foreground">No other tours found for this guest.</p>
          ) : (
            <ul className="space-y-1.5">
              {history.map((h) => (
                <li key={h.id} className="text-xs border rounded-md px-2.5 py-1.5">
                  <span className="font-medium">{h.tourName}</span>
                  <span className="text-muted-foreground"> — {h.date}</span>
                  {h.customer_country && (
                    <span className="text-muted-foreground"> · {h.customer_country}</span>
                  )}
                  {h.guest_notes && (
                    <p className="mt-0.5 italic text-muted-foreground">{h.guest_notes}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onDelete(booking);
              onOpenChange(false);
            }}
          >
            Delete Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
