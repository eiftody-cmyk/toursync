"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Tour, BlockedDate } from "@/types";

export function BlockedList({
  tours,
  blocked,
  filterTour,
  onUnblock,
}: {
  tours: Tour[];
  blocked: BlockedDate[];
  filterTour: string;
  onUnblock: (bl: BlockedDate) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const filtered = filterTour === "all"
    ? blocked
    : blocked.filter((bl) => !bl.tour_id || bl.tour_id === filterTour);

  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  const visible = expanded ? sorted : sorted.slice(0, 10);

  if (sorted.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Blocked Dates ({sorted.length})</span>
          {sorted.length > 10 && (
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? "Show less" : `Show all ${sorted.length}`}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {visible.map((bl) => {
            const tour = tours.find((t) => t.id === bl.tour_id);
            const timeLabel = bl.start_time && bl.end_time
              ? `${bl.start_time}–${bl.end_time}`
              : bl.start_time
                ? `${bl.start_time}+`
                : "all day";
            return (
              <div key={bl.id} className="flex items-center justify-between gap-2 py-1 border-b last:border-0 text-sm">
                <div className="min-w-0">
                  <span className="font-medium">{bl.date}</span>
                  <span className="ml-2 text-muted-foreground">{tour?.name ?? "All tours"}</span>
                  {bl.reason && <span className="ml-2 text-muted-foreground">— {bl.reason}</span>}
                  <span className="ml-2 text-xs text-muted-foreground">{timeLabel}</span>
                  {bl.is_auto_blocked && (
                    <Badge variant="destructive" className="ml-2 text-[10px]">auto</Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-xs"
                  onClick={() => onUnblock(bl)}
                >
                  Unblock
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
