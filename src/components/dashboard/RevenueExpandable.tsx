"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PerformanceSummary } from "./PerformanceSummary";
import { EarningsByListing } from "./EarningsByListing";
import type { Booking, Tour } from "@/types";

export function RevenueExpandable({
  bookings,
  tours,
  commissionRates,
}: {
  bookings: Booking[];
  tours: Tour[];
  commissionRates: Record<string, number> | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Revenue</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => setOpen(!open)}
          >
            {open ? "Collapse" : "Expand"}
          </Button>
        </div>
      </CardHeader>
      {open && (
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <PerformanceSummary bookings={bookings} tours={tours} commissionRates={commissionRates} />
            <EarningsByListing bookings={bookings} tours={tours} commissionRates={commissionRates} />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
