import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_PRODUCT_TYPES = ["time_point", "time_period"] as const;
const VALID_TICKET_TYPES = ["individual", "group"] as const;

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
