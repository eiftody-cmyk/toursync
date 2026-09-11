"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import type { Booking, Tour } from "@/types";

const SOURCE_COLORS: Record<string, string> = {
  direct: "bg-emerald-100 text-emerald-800",
  gyg: "bg-blue-100 text-blue-800",
  viator: "bg-purple-100 text-purple-800",
  airbnb: "bg-rose-100 text-rose-800",
};

export function BookingTable({
  bookings,
  tours,
}: {
  bookings: Booking[];
  tours: Tour[];
}) {
  const [filterSource, setFilterSource] = useState("all");

  const confirmed = useMemo(
    () => bookings.filter((b) => b.status === "confirmed"),
    [bookings]
  );

  const filtered = useMemo(() => {
    if (filterSource === "all") return confirmed;
    return confirmed.filter((b) => b.source === filterSource);
  }, [confirmed, filterSource]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => a.date.localeCompare(b.date)),
    [filtered]
  );

  const sources = useMemo(() => {
    const set = new Set(confirmed.map((b) => b.source).filter(Boolean));
    return Array.from(set);
  }, [confirmed]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Bookings</CardTitle>
        <Select value={filterSource} onValueChange={(v) => setFilterSource(v ?? "all")}>
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {sources.map((s) => (
              <SelectItem key={s} value={s!}>
                {s!.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">No bookings yet.</p>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Tour</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Customer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((b) => {
                  const tour = tours.find((t) => t.id === b.tour_id);
                  return (
                    <TableRow key={b.id}>
                      <TableCell className="text-xs">{b.date}</TableCell>
                      <TableCell className="text-xs truncate max-w-[150px]">
                        {tour?.name ?? "Unknown"}
                      </TableCell>
                      <TableCell className="text-xs">+{b.guest_count}</TableCell>
                      <TableCell>
                        {b.source && (
                          <Badge
                            variant="secondary"
                            className={`text-[10px] px-1.5 py-0 ${SOURCE_COLORS[b.source] ?? ""}`}
                          >
                            {b.source.toUpperCase()}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {b.customer_name ?? ""}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
