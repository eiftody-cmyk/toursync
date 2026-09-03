"use client";

import { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Tour, Booking, BlockedDate } from "@/types";
import { BlockModal } from "./BlockModal";
import { BookingModal } from "@/components/bookings/BookingModal";
import { BlockedDetailDialog } from "./BlockedDetailDialog";
import { BookingDetailDialog } from "./BookingDetailDialog";
import { BlockedList } from "./BlockedList";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { capacityColor } from "@/lib/capacity";
import { toJSTStartOfDay } from "@/lib/time";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type CalEvent = {
  title: string;
  start: Date;
  end: Date;
  resource: { type: "booking" | "blocked"; id: string; tourId?: string; data: Booking | BlockedDate };
};

export function CalendarClient({
  tours,
  initialBookings,
  initialBlocked,
  initialFilterTour = "all",
}: {
  tours: Tour[];
  initialBookings: Booking[];
  initialBlocked: BlockedDate[];
  initialFilterTour?: string;
}) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [blocked, setBlocked] = useState<BlockedDate[]>(initialBlocked);
  const [filterTour, setFilterTour] = useState<string>(initialFilterTour);
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [blockOpen, setBlockOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedBlocked, setSelectedBlocked] = useState<BlockedDate | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  async function refresh() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data: b, error: bErr } = await supabase.from("bookings").select("*").eq("user_id", user.id);
    const { data: bl, error: blErr } = await supabase.from("blocked_dates").select("*").eq("user_id", user.id);
    if (bErr) toast.error(bErr.message);
    if (blErr) toast.error(blErr.message);
    if (b) setBookings(b as Booking[]);
    if (bl) setBlocked(bl as BlockedDate[]);
  }

  const events: CalEvent[] = useMemo(() => {
    const filteredBookings =
      filterTour === "all" ? bookings : bookings.filter((b) => b.tour_id === filterTour);
    const filteredBlocked =
      filterTour === "all" ? blocked : blocked.filter((bl) => !bl.tour_id || bl.tour_id === filterTour);

    const evs: CalEvent[] = [];

    for (const b of filteredBookings) {
      const d = toJSTStartOfDay(b.date);
      const tour = tours.find((t) => t.id === b.tour_id);
      const timeLabel = b.start_time ? ` ${b.start_time}` : "";
      evs.push({
        title: `+${b.guest_count} ${tour?.name ?? "Booking"}${timeLabel}${b.source ? ` (${b.source})` : ""}`,
        start: d,
        end: d,
        resource: { type: "booking", id: b.id, tourId: b.tour_id, data: b },
      });
    }

    for (const bl of filteredBlocked) {
      const d = toJSTStartOfDay(bl.date);
      const tour = tours.find((t) => t.id === bl.tour_id);
      const tourLabel = tour?.name ?? "All tours";
      const reasonLabel = bl.reason ? ` — ${bl.reason}` : "";
      evs.push({
        title: bl.is_auto_blocked
          ? `FULL — ${tourLabel}${reasonLabel}`
          : `Blocked — ${tourLabel}${reasonLabel}`,
        start: d,
        end: d,
        resource: { type: "blocked", id: bl.id, tourId: bl.tour_id ?? undefined, data: bl },
      });
    }

    return evs;
  }, [bookings, blocked, filterTour, tours]);

  function handleSelectSlot(slotInfo: { start: Date; end: Date }) {
    const iso = format(slotInfo.start, "yyyy-MM-dd");
    setSelectedDate(iso);
    setBlockOpen(true);
  }

  function handleSelectEvent(event: CalEvent) {
    if (event.resource.type === "blocked") {
      setSelectedBlocked(event.resource.data as BlockedDate);
    } else {
      setSelectedBooking(event.resource.data as Booking);
    }
  }

  async function handleUnblock(bl: BlockedDate) {
    setBlocked((prev) => prev.filter((row) => row.id !== bl.id));
    try {
      const res = await fetch("/api/calendar/unblock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockedId: bl.id }),
      });
      if (res.ok) {
        toast.success("Unblocked");
        await refresh();
        return;
      }
    } catch {
      // API failed — fall through to client-side DB delete only
    }
    const supabase = createClient();
    const { error } = await supabase.from("blocked_dates").delete().eq("id", bl.id);
    if (error) {
      toast.error(error.message);
      await refresh();
    } else {
      toast.success("Unblocked (Google event may remain — check manually)");
      await refresh();
    }
  }

  async function handleDeleteBooking(b: Booking) {
    setBookings((prev) => prev.filter((row) => row.id !== b.id));
    const supabase = createClient();
    const { error } = await supabase.from("bookings").delete().eq("id", b.id);
    if (error) {
      toast.error(error.message);
      await refresh();
      return;
    }
    toast.success("Booking deleted");
    try {
      const res = await fetch("/api/bookings/auto-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tour_id: b.tour_id, date: b.date, start_time: b.start_time }),
      });
      const json = await res.json();
      if (json?.autoUnblocked) toast.success("Auto-block removed — slot has capacity again");
    } catch {
      // best-effort
    }
    await refresh();
  }

  function eventPropGetter(event: CalEvent) {
    const isBooking = event.resource.type === "booking";
    if (isBooking) {
      const b = event.resource.data as Booking;
      const tour = tours.find((t) => t.id === b.tour_id);
      if (tour) {
        const totalForSlot = bookings
          .filter((x) => x.tour_id === b.tour_id && x.date === b.date && (x.start_time || null) === (b.start_time || null))
          .reduce((s, x) => s + x.guest_count, 0);
        const remaining = tour.capacity - totalForSlot;
        const isFull = remaining <= 0;
        const isAlmost = !isFull && (remaining <= 2 || totalForSlot / tour.capacity >= 0.66);
        return {
          style: {
            backgroundColor: isFull ? "#ef4444" : isAlmost ? "#f59e0b" : "#10b981",
            color: isAlmost ? "#000" : "#fff",
            border: "none",
            fontSize: "0.75rem",
          },
        };
      }
      return { style: { backgroundColor: "#10b981", color: "#fff", fontSize: "0.75rem" } };
    } else {
      const bl = event.resource.data as BlockedDate;
      return {
        style: {
          backgroundColor: bl.is_auto_blocked ? "#dc2626" : "#6b7280",
          color: "#fff",
          fontSize: "0.75rem",
        },
      };
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2 items-center">
            <Select value={filterTour} onValueChange={(v) => setFilterTour(v ?? "all")}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Filter by tour">
                {filterTour === "all" ? "All tours" : tours.find((t) => t.id === filterTour)?.name ?? "—"}
              </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tours</SelectItem>
                {tours.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline">
              {events.length} event{events.length !== 1 && "s"}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!selectedDate) toast.error("Click a date on the calendar first");
                else setBlockOpen(true);
              }}
            >
              + Block Date
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (!selectedDate) toast.error("Click a date on the calendar first");
                else setBookingOpen(true);
              }}
            >
              + Add Booking
            </Button>
          </div>
        </CardContent>
      </Card>

      {tours.length === 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-4 text-sm">
            Create a tour first in <a href="/tours" className="underline">Tours</a> to use the calendar.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-4">
          <div className="h-[600px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              selectable
              eventPropGetter={eventPropGetter}
              popup
            />
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardContent className="pt-4 text-sm space-y-2">
            <p>
              Selected date: <strong>{selectedDate}</strong>
            </p>
            <div className="flex gap-2 flex-wrap">
              {tours.map((t) => {
                const slots = Array.from(
                  new Set(
                    bookings
                      .filter((b) => b.tour_id === t.id && b.date === selectedDate)
                      .map((b) => (b.start_time ? String(b.start_time) : "all-day"))
                  )
                );
                if (slots.length === 0) slots.push("all-day");
                return slots.map((slot) => {
                  const total = bookings
                    .filter(
                      (b) =>
                        b.tour_id === t.id &&
                        b.date === selectedDate &&
                        (slot === "all-day" ? !b.start_time : String(b.start_time) === slot)
                    )
                    .reduce((s, b) => s + b.guest_count, 0);
                  const remaining = t.capacity - total;
                  const isBlocked = blocked.some(
                    (bl) =>
                      bl.date === selectedDate &&
                      (bl.tour_id === t.id || !bl.tour_id) &&
                      (slot === "all-day" ? !bl.start_time : String(bl.start_time) === slot)
                  );
                  const status =
                    isBlocked ? "blocked" : remaining <= 0 ? "full" : remaining <= 2 ? "almost-full" : "available";
                  const label = slot === "all-day" ? "All day" : `${slot}`;
                  return (
                    <span key={`${t.id}-${slot}`} className={`px-2 py-1 rounded text-xs ${capacityColor(status)}`}>
                      {t.name} {label}: {total}/{t.capacity} {status}
                    </span>
                  );
                });
              })}
            </div>
            {blocked.filter((bl) => bl.date === selectedDate).length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium">Blocks:</p>
                {blocked
                  .filter((bl) => bl.date === selectedDate)
                  .map((bl) => {
                    const bt = tours.find((t) => t.id === bl.tour_id);
                    return (
                      <p key={bl.id} className="text-xs text-muted-foreground pl-2">
                        {bt?.name ?? "All tours"}
                        {bl.reason ? ` — ${bl.reason}` : ""}
                        {bl.is_auto_blocked && <span className="text-red-500 ml-1">(auto)</span>}
                      </p>
                    );
                  })}
              </div>
            )}
            <p className="text-muted-foreground text-xs">
              Click an event to delete/unblock. Select a date on the calendar to set booking/block.
            </p>
          </CardContent>
        </Card>
      )}

      <BlockModal
        open={blockOpen}
        onOpenChange={setBlockOpen}
        tours={tours}
        defaultDate={selectedDate ?? format(new Date(), "yyyy-MM-dd")}
        filterTour={filterTour}
        onSuccess={refresh}
      />
      <BookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        tours={tours}
        defaultDate={selectedDate ?? format(new Date(), "yyyy-MM-dd")}
        filterTour={filterTour}
        onSuccess={refresh}
      />
      <BlockedDetailDialog
        open={selectedBlocked !== null}
        onOpenChange={(v) => { if (!v) setSelectedBlocked(null); }}
        blocked={selectedBlocked}
        tour={selectedBlocked ? tours.find((t) => t.id === selectedBlocked.tour_id) : undefined}
        onUnblock={handleUnblock}
      />
      <BookingDetailDialog
        open={selectedBooking !== null}
        onOpenChange={(v) => { if (!v) setSelectedBooking(null); }}
        booking={selectedBooking}
        tour={selectedBooking ? tours.find((t) => t.id === selectedBooking.tour_id) : undefined}
        onDelete={handleDeleteBooking}
      />
      <BlockedList
        tours={tours}
        blocked={blocked}
        filterTour={filterTour}
        onUnblock={(bl) => {
          if (confirm(`Unblock ${bl.date}?`)) handleUnblock(bl);
        }}
      />
    </div>
  );
}
