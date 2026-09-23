import { Card, CardContent } from "@/components/ui/card";

function formatYen(n: number) {
  return `¥${n.toLocaleString()}`;
}

export function DashboardKpis({
  netThisMonth,
  monthBookings,
  ytdBookings,
  monthGuests,
  ytdGuests,
  upcoming14,
}: {
  netThisMonth: number;
  monthBookings: number;
  ytdBookings: number;
  monthGuests: number;
  ytdGuests: number;
  upcoming14: number;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-4 pb-3">
          <p className="text-xs text-muted-foreground">This month</p>
          <p className="text-2xl font-bold">{formatYen(netThisMonth)} net*</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            *After estimated platform commission
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 pb-3">
          <p className="text-xs text-muted-foreground">Bookings</p>
          <p className="text-2xl font-bold">{monthBookings}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            this month · {ytdBookings} YTD
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 pb-3">
          <p className="text-xs text-muted-foreground">Guests</p>
          <p className="text-2xl font-bold">{monthGuests}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            this month · {ytdGuests} YTD
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 pb-3">
          <p className="text-xs text-muted-foreground">Upcoming</p>
          <p className="text-2xl font-bold">{upcoming14}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            next 14 days
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
