"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Tour, BlockedDate } from "@/types";

export function BlockedDetailDialog({
  open,
  onOpenChange,
  blocked,
  tour,
  onUnblock,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  blocked: BlockedDate | null;
  tour: Tour | undefined;
  onUnblock: (bl: BlockedDate) => void;
}) {
  if (!blocked) return null;

  const tourName = tour?.name ?? "All tours";
  const timeLabel = blocked.start_time && blocked.end_time
    ? `${blocked.start_time} – ${blocked.end_time} JST`
    : blocked.start_time
      ? `${blocked.start_time} JST onward`
      : "All day";
  const reason = blocked.reason || "No reason given";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Blocked — {blocked.date}</DialogTitle>
          <DialogDescription>{tourName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-20">Tour</span>
            <span className="font-medium">{tourName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-20">Duration</span>
            <span>{timeLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-20">Type</span>
            <Badge variant={blocked.is_auto_blocked ? "destructive" : "secondary"}>
              {blocked.is_auto_blocked ? "Auto-blocked (FULL)" : "Manual block"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-20">Reason</span>
            <span>{reason}</span>
          </div>
        </div>

        {blocked.is_auto_blocked && (
          <p className="text-xs text-muted-foreground bg-muted rounded p-2">
            This was auto-created because capacity reached full. To prevent re-blocking, reduce bookings or increase
            capacity.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onUnblock(blocked);
              onOpenChange(false);
            }}
          >
            Unblock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
