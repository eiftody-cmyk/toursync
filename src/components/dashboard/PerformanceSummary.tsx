"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { Booking, Tour } from "@/types";
import { calcGross, calcNet } from "@/lib/revenue";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatCurrency(amount: number) {
  if (amount >= 1000) return `¥${(amount / 1000).toFixed(1)}K`;
  return `¥${amount.toLocaleString()}`;
}

export function PerformanceSummary({
  bookings,
  tours,
  commissionRates,
}: {
  bookings: Booking[];
  tours: Tour[];
  commissionRates: Record<string, number> | null;
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
      const gross = monthBookings.reduce((sum, b) => {
        const tour = tours.find((t) => t.id === b.tour_id);
        return sum + calcGross(tour?.price ?? 0, b.guest_count);
      }, 0);
      const net = monthBookings.reduce((sum, b) => {
        const tour = tours.find((t) => t.id === b.tour_id);
        return sum + calcNet(b.source ?? "direct", tour?.price ?? 0, b.guest_count, commissionRates);
      }, 0);
      return { name: label, gross, net, month: i };
    });
  }, [confirmed, tours, commissionRates]);

  const currentMonth = new Date().getMonth();
  const currentMonthData = monthlyData[currentMonth];
  const totalYearGross = monthlyData.reduce((s, m) => s + m.gross, 0);
  const totalYearNet = monthlyData.reduce((s, m) => s + m.net, 0);
  const totalCommission = totalYearGross - totalYearNet;

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
                formatter={(value, name) => [`¥${Number(value).toLocaleString()}`, name === "gross" ? "Gross" : "Net"]}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar
                dataKey="gross"
                fill="#94a3b8"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
                name="gross"
              />
              <Bar
                dataKey="net"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
                name="net"
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
              ¥{currentMonthData.net.toLocaleString()} <span className="text-muted-foreground font-normal">net</span>
            </p>
            <p className="text-xs text-muted-foreground">
              ¥{currentMonthData.gross.toLocaleString()} gross
            </p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Total ({new Date().getFullYear()})</p>
            <p className="font-semibold">¥{totalYearNet.toLocaleString()} <span className="text-muted-foreground font-normal">net</span></p>
            <p className="text-xs text-muted-foreground">
              -¥{totalCommission.toLocaleString()} commission
            </p>
          </div>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground border-t pt-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" /> Gross
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Net
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
