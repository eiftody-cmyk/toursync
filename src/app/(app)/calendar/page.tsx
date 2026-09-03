import { createClient } from "@/lib/supabase/server";
import { CalendarClient } from "@/components/calendar/CalendarClient";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ tour?: string }>;
}) {
  const { tour } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: tours } = await supabase.from("tours").select("*").eq("user_id", user.id).order("name");
  const { data: bookings } = await supabase.from("bookings").select("*").eq("user_id", user.id);
  const { data: blocked } = await supabase.from("blocked_dates").select("*").eq("user_id", user.id);

  const initialFilterTour = tour && tours?.some((t) => t.id === tour) ? tour : "all";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-sm text-muted-foreground">
          Click a date to block it or add a booking. Colors: green = available, amber = almost full, red =
          full/blocked.
        </p>
      </div>
      <CalendarClient
        tours={tours ?? []}
        initialBookings={bookings ?? []}
        initialBlocked={blocked ?? []}
        initialFilterTour={initialFilterTour}
      />
    </div>
  );
}
