"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Tour, Booking } from "@/types";

export function BookingDetailDialog({
  open,
  onOpenChange,
  booking,
  tour,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  booking: Booking | null;
  tour: Tour | undefined;
  onDelete: (b: Booking) => void;
}) {
  if (!booking) return null;

  const tourName = tour?.name ?? "Unknown tour";
  const timeLabel = booking.start_time && booking.end_time
    ? `${booking.start_time} – ${booking.end_time} JST`
    : booking.start_time
      ? `${booking.start_time} JST`
      : "All day";

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
            </div>
          )}
          {booking.notes && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground w-20">Notes</span>
              <span>{booking.notes}</span>
            </div>
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
