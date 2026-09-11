"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { Booking, Tour } from "@/types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatCurrency(amount: number) {
  if (amount >= 1000) return `¥${(amount / 1000).toFixed(1)}K`;
  return `¥${amount.toLocaleString()}`;
}

export function PerformanceSummary({
  bookings,
  tours,
}: {
  bookings: Booking[];
  tours: Tour[];
}) {
  const confirmed = useMemo(
    () => bookings.filter((b) => b.status === "confirmed"),
    [bookings]
  );

  const monthlyData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    return MONTHS.map((label, i) => {
      const monthBookings = confirmed.filter((b) => {
        const d = new Date(b.date);
        return d.getFullYear() === year && d.getMonth() === i;
      });
      const revenue = monthBookings.reduce((sum, b) => {
        const tour = tours.find((t) => t.id === b.tour_id);
        return sum + (tour?.price ?? 0) * b.guest_count;
      }, 0);
      return { name: label, revenue, month: i };
    });
  }, [confirmed, tours]);

  const currentMonth = new Date().getMonth();
  const currentMonthData = monthlyData[currentMonth];
  const totalYear = monthlyData.reduce((s, m) => s + m.revenue, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Performance Summary</CardTitle>
          <span className="text-xs text-muted-foreground">
            {new Date().getFullYear()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatCurrency}
                width={50}
              />
              <Tooltip
                formatter={(value) => [`¥${Number(value).toLocaleString()}`, "Revenue"]}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar
                dataKey="revenue"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between text-sm border-t pt-3">
          <div>
            <p className="text-muted-foreground">
              {MONTHS[currentMonth]} {new Date().getFullYear()}
            </p>
            <p className="font-semibold">
              ¥{currentMonthData.revenue.toLocaleString()} JPY
            </p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Total ({new Date().getFullYear()})</p>
            <p className="font-semibold">¥{totalYear.toLocaleString()} JPY</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
