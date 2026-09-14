import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { tourCatalog, BASE_URL, type TourCatalogEntry } from "@/lib/tours/catalog";

const VALID_PRODUCT_TYPES = ["time_point", "time_period"] as const;
const VALID_TICKET_TYPES = ["individual", "group"] as const;

export async function GET() {
  const supabase = createServiceClient();

  const { data: tours, error } = await supabase
    .from("tours")
    .select("id, name, description, capacity, price, currency, product_type, ticket_type");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: schedules } = await supabase
    .from("tour_schedules")
    .select("tour_id, day_of_week, start_time, duration_minutes")
    .eq("is_active", true);

  const schedulesByTour = new Map<string, Array<{ day_of_week: number; start_time: string; duration_minutes: number }>>();
  for (const s of schedules ?? []) {
    const list = schedulesByTour.get(s.tour_id) ?? [];
    list.push({ day_of_week: s.day_of_week, start_time: s.start_time, duration_minutes: s.duration_minutes });
    schedulesByTour.set(s.tour_id, list);
  }

  const result = (tours ?? []).map((tour) => {
    const meta: TourCatalogEntry | undefined = tourCatalog[tour.name];
    const tourSchedules = schedulesByTour.get(tour.id) ?? [];
    const duration = tourSchedules[0]?.duration_minutes ?? 150;

    return {
      id: tour.id,
      name: tour.name,
      url: meta ? `${BASE_URL}/${meta.url_slug}` : null,
      description: tour.description,
      duration_minutes: duration,
      price: tour.price,
      currency: tour.currency,
      max_guests: tour.capacity,
      language: "en",
      ...(meta
        ? {
            historical_periods: meta.historical_periods,
            themes: meta.themes,
            traveler_types: meta.traveler_types,
            ideal_for: meta.ideal_for,
            best_time_of_day: meta.best_time_of_day,
            itinerary_position: meta.itinerary_position,
            nearby_attractions: meta.nearby_attractions,
            good_before: meta.good_before,
            good_after: meta.good_after,
            not_ideal_for: meta.not_ideal_for,
            meeting_point: meta.meeting_point,
            meeting_point_lat: meta.meeting_point_lat,
            meeting_point_lng: meta.meeting_point_lng,
            recommended_next: meta.recommended_next,
            recommended_before: meta.recommended_before,
            solo_day: meta.solo_day,
            pair_with: meta.pair_with,
          }
        : {}),
      schedules: tourSchedules,
      availability_endpoint: `/api/tours/${tour.id}/availability`,
      booking_url: `${BASE_URL}/book?tour=${tour.id}`,
    };
  });

  return NextResponse.json({
    tours: result,
    meta: { total: result.length, language: "en", currency: "JPY" },
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const productType = typeof body.product_type === "string" ? body.product_type : "time_point";
  if (!VALID_PRODUCT_TYPES.includes(productType as typeof VALID_PRODUCT_TYPES[number])) {
    return NextResponse.json({ error: "Invalid product_type" }, { status: 400 });
  }

  const ticketType = typeof body.ticket_type === "string" ? body.ticket_type : "individual";
  if (!VALID_TICKET_TYPES.includes(ticketType as typeof VALID_TICKET_TYPES[number])) {
    return NextResponse.json({ error: "Invalid ticket_type" }, { status: 400 });
  }

  const capacity = typeof body.capacity === "number" && body.capacity > 0 ? body.capacity : 6;
  const price = typeof body.price === "number" ? body.price : null;
  const currency = typeof body.currency === "string" && body.currency.trim() ? body.currency.trim() : "JPY";
  const cutoffMinutes = typeof body.cutoff_minutes === "number" && body.cutoff_minutes >= 0 ? body.cutoff_minutes : 60;

  let newGuestCutoffMinutes: number | null = null;
  if ("new_guest_cutoff_minutes" in body) {
    if (body.new_guest_cutoff_minutes === null) {
      newGuestCutoffMinutes = null;
    } else if (typeof body.new_guest_cutoff_minutes === "number") {
      const v = body.new_guest_cutoff_minutes;
      if (v !== 0 && v < 60) {
        return NextResponse.json(
          { error: "new_guest_cutoff_minutes must be 0 (no cutoff) or at least 60 minutes" },
          { status: 400 }
        );
      }
      newGuestCutoffMinutes = v;
    }
  }

  let groupSizeMin: number | null = null;
  let groupSizeMax: number | null = null;

  if (ticketType === "group") {
    groupSizeMin = typeof body.group_size_min === "number" && body.group_size_min >= 1 ? body.group_size_min : null;
    groupSizeMax = typeof body.group_size_max === "number" && body.group_size_max >= 1 ? body.group_size_max : null;

    if (groupSizeMin !== null && groupSizeMax !== null && groupSizeMin > groupSizeMax) {
      return NextResponse.json({ error: "group_size_min must be <= group_size_max" }, { status: 400 });
    }
  }

  let openingHours: { fromTime: string; toTime: string } | null = null;
  if (productType === "time_period" && body.opening_hours && typeof body.opening_hours === "object") {
    const oh = body.opening_hours as Record<string, string>;
    if (oh.fromTime && oh.toTime) {
      openingHours = { fromTime: oh.fromTime, toTime: oh.toTime };
    }
  }

  const description = typeof body.description === "string" ? body.description.trim() || null : null;

  const payload = {
    user_id: user.id,
    name,
    description,
    capacity,
    price,
    currency,
    cutoff_minutes: cutoffMinutes,
    new_guest_cutoff_minutes: newGuestCutoffMinutes,
    product_type: productType,
    ticket_type: ticketType,
    group_size_min: groupSizeMin,
    group_size_max: groupSizeMax,
    opening_hours: openingHours,
  };

  const { data, error } = await supabase.from("tours").insert(payload).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ id: data.id });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const tourId = typeof body.id === "string" ? body.id : null;
  if (!tourId) return NextResponse.json({ error: "Tour id is required" }, { status: 400 });

  // Verify ownership
  const { data: existing } = await supabase
    .from("tours")
    .select("id")
    .eq("id", tourId)
    .eq("user_id", user.id)
    .single();
  if (!existing) return NextResponse.json({ error: "Tour not found" }, { status: 404 });

  const update: Record<string, unknown> = {};

  if (typeof body.name === "string") {
    const n = body.name.trim();
    if (!n) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    update.name = n;
  }

  if (typeof body.description === "string") {
    update.description = body.description.trim() || null;
  }

  if (typeof body.capacity === "number" && body.capacity > 0) {
    update.capacity = body.capacity;
  }

  if ("price" in body) {
    update.price = typeof body.price === "number" ? body.price : null;
  }

  if (typeof body.currency === "string") {
    update.currency = body.currency.trim() || "JPY";
  }

  if (typeof body.cutoff_minutes === "number" && body.cutoff_minutes >= 0) {
    update.cutoff_minutes = body.cutoff_minutes;
  }

  if ("new_guest_cutoff_minutes" in body) {
    if (body.new_guest_cutoff_minutes === null) {
      update.new_guest_cutoff_minutes = null;
    } else if (typeof body.new_guest_cutoff_minutes === "number") {
      const v = body.new_guest_cutoff_minutes;
      if (v !== 0 && v < 60) {
        return NextResponse.json(
          { error: "new_guest_cutoff_minutes must be 0 (no cutoff) or at least 60 minutes" },
          { status: 400 }
        );
      }
      update.new_guest_cutoff_minutes = v;
    }
  }

  if (typeof body.product_type === "string") {
    if (!VALID_PRODUCT_TYPES.includes(body.product_type as typeof VALID_PRODUCT_TYPES[number])) {
      return NextResponse.json({ error: "Invalid product_type" }, { status: 400 });
    }
    update.product_type = body.product_type;
  }

  if (typeof body.ticket_type === "string") {
    if (!VALID_TICKET_TYPES.includes(body.ticket_type as typeof VALID_TICKET_TYPES[number])) {
      return NextResponse.json({ error: "Invalid ticket_type" }, { status: 400 });
    }
    update.ticket_type = body.ticket_type;
  }

  // Determine effective ticket_type for group size validation
  const effectiveTicketType = (typeof body.ticket_type === "string" ? body.ticket_type : null) as "individual" | "group" | null;

  if (effectiveTicketType === "individual" || (effectiveTicketType === null && !("group_size_min" in body) && !("group_size_max" in body))) {
    update.group_size_min = null;
    update.group_size_max = null;
  } else if (effectiveTicketType === "group" || "group_size_min" in body || "group_size_max" in body) {
    const min = typeof body.group_size_min === "number" ? body.group_size_min : null;
    const max = typeof body.group_size_max === "number" ? body.group_size_max : null;
    if (min !== null && max !== null && min > max) {
      return NextResponse.json({ error: "group_size_min must be <= group_size_max" }, { status: 400 });
    }
    update.group_size_min = min;
    update.group_size_max = max;
  }

  if ("opening_hours" in body) {
    if (body.opening_hours && typeof body.opening_hours === "object") {
      const oh = body.opening_hours as Record<string, string>;
      update.opening_hours = oh.fromTime && oh.toTime ? { fromTime: oh.fromTime, toTime: oh.toTime } : null;
    } else {
      update.opening_hours = null;
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { error } = await supabase.from("tours").update(update).eq("id", tourId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
