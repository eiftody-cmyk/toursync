"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { BlockedDate, Tour } from "@/types";

export function BlockedDatesGrouped({
  blocked,
  tours,
}: {
  blocked: BlockedDate[];
  tours: Tour[];
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, BlockedDate[]>();
    const sorted = [...blocked].sort((a, b) => a.date.localeCompare(b.date));
    for (const bl of sorted) {
      const list = map.get(bl.date) ?? [];
      list.push(bl);
      map.set(bl.date, list);
    }
    return Array.from(map.entries());
  }, [blocked]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Blocked Dates</CardTitle>
      </CardHeader>
      <CardContent>
        {grouped.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No blocks. Click a date on the calendar to block it.
          </p>
        ) : (
          <div className="max-h-[300px] overflow-y-auto space-y-3">
            {grouped.map(([date, blocks]) => (
              <div key={date}>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  {date}
                </p>
                <div className="space-y-1 pl-2">
                  {blocks.map((bl) => {
                    const tour = tours.find((t) => t.id === bl.tour_id);
                    const reason = bl.reason ?? "";
                    const isGyg = reason.toLowerCase().includes("gyg");
                    const isAuto = bl.is_auto_blocked;
                    return (
                      <div
                        key={bl.id}
                        className="flex items-center justify-between text-xs"
                      >
                        <Link
                          href={`/calendar?tour=${bl.tour_id ?? ""}`}
                          className="hover:underline truncate max-w-[180px]"
                        >
                          {tour?.name ?? "All tours"}
                          {bl.start_time ? ` ${String(bl.start_time).slice(0, 5)}` : ""}
                        </Link>
                        <div className="flex gap-1 shrink-0">
                          {isAuto && (
                            <Badge variant="destructive" className="text-[10px] px-1 py-0">
                              auto
                            </Badge>
                          )}
                          {isGyg && !isAuto && (
                            <Badge variant="secondary" className="text-[10px] px-1 py-0">
                              GYG
                            </Badge>
                          )}
                          {!isAuto && !isGyg && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0">
                              manual
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
