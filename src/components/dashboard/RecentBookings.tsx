"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Booking, Tour } from "@/types";

type SortMode = "date" | "created_at";

export function RecentBookings({
  bookings,
  tours,
}: {
  bookings: Booking[];
  tours: Tour[];
}) {
  const [sortBy, setSortBy] = useState<SortMode>("date");

  const sorted = [...bookings].sort((a, b) => {
    if (sortBy === "date") {
      return a.date.localeCompare(b.date);
    }
    return b.created_at.localeCompare(a.created_at);
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Recent Bookings</CardTitle>
        <Select value={sortBy} onValueChange={(v) => setSortBy((v as SortMode) ?? "date")}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">By Date</SelectItem>
            <SelectItem value="created_at">By Entry Date</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="text-sm">
        {sorted.length === 0 ? (
          <p className="text-muted-foreground">
            No bookings yet. Add one from the calendar.
          </p>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            <ul className="space-y-2">
              {sorted.map((b) => {
                const tour = tours.find((t) => t.id === b.tour_id);
                return (
                  <li
                    key={b.id}
                    className="flex justify-between border-b pb-1 last:border-0"
                  >
                    <span>
                      {b.date} · {tour?.name ?? "Unknown tour"} · +{b.guest_count} guest
                      {b.guest_count !== 1 && "s"}
                      {b.source && ` (${b.source})`}
                    </span>
                    <span className="text-muted-foreground">
                      {b.customer_name ?? ""}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
