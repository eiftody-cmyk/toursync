import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Name-based guest lookup — the CRM matching layer.
 *
 * Matching is deliberately by full name only (never email): the operator
 * confirms identity manually when a returning guest is flagged. A name must
 * contain at least two words so a typed surname can never sweep up every
 * guest with that surname.
 */

export interface GuestBooking {
  id: string;
  date: string;
  start_time: string | null;
  source: string | null;
  guest_notes: string | null;
  customer_country: string | null;
  tourName: string;
}

/** Trim, collapse internal whitespace, lowercase. */
export function normalizeName(name: string | null | undefined): string {
  return (name ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

/** Full names only — two or more words. */
export function isMatchableName(name: string | null | undefined): boolean {
  const n = normalizeName(name);
  return n.length >= 3 && n.includes(" ");
}

/** Escape LIKE wildcards so a guest name can never become a pattern. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (m) => `\\${m}`);
}

function todayInTokyo(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
}

/**
 * Confirmed bookings belonging to the guest with this exact name
 * (case-insensitive), newest first.
 *
 * `pastOnly`  — only dates before today (return-reminder path).
 * `excludeId` — omit the booking currently open in the dialog.
 *
 * Returns [] when the name is missing/unmatchable or the lookup fails —
 * never throws, never blocks a booking.
 */
export async function fetchGuestBookings(
  supabase: SupabaseClient,
  name: string | null | undefined,
  opts: { pastOnly?: boolean; excludeId?: string } = {}
): Promise<GuestBooking[]> {
  const target = normalizeName(name);
  if (!isMatchableName(target)) return [];

  try {
    let query = supabase
      .from("bookings")
      .select("id, date, start_time, source, customer_name, guest_notes, customer_country, tours(name)")
      .ilike("customer_name", escapeLike(target))
      .eq("status", "confirmed")
      .order("date", { ascending: false })
      .limit(20);

    if (opts.pastOnly) query = query.lt("date", todayInTokyo());
    if (opts.excludeId) query = query.neq("id", opts.excludeId);

    const { data, error } = await query;
    if (error) {
      console.error("[GuestHistory] Lookup failed:", error.message);
      return [];
    }

    return (data ?? [])
      .filter((row) => normalizeName(row.customer_name as string) === target)
      .map((row) => {
        // FK embed is a to-one object at runtime; supabase-js types it as an array
        const embedded = row.tours as unknown as
          | { name?: string | null }
          | { name?: string | null }[]
          | null;
        const tour = Array.isArray(embedded) ? embedded[0] : embedded;
        return {
          id: row.id as string,
          date: row.date as string,
          start_time: (row.start_time as string | null) ?? null,
          source: (row.source as string | null) ?? null,
          guest_notes: (row.guest_notes as string | null) ?? null,
          customer_country: (row.customer_country as string | null) ?? null,
          tourName: tour?.name ?? "Unknown tour",
        };
      });
  } catch (e) {
    console.error("[GuestHistory] Lookup threw:", e instanceof Error ? e.message : e);
    return [];
  }
}
