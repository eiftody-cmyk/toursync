import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchGuestBookings } from "@/lib/crm/guest-history";

export interface PreviousTour {
  date: string;
  tourName: string;
  source: string | null;
  guestNotes: string | null;
}

const SOURCE_LABELS: Record<string, string | null> = {
  gyg: "GetYourGuide",
  viator: "Viator",
  airbnb: "Airbnb",
  direct: null,
  "direct-custom": null,
  misaki: "MISAKI Kimono Rental",
};

export function sourceLabel(source: string | null): string | null {
  if (!source) return null;
  if (source in SOURCE_LABELS) return SOURCE_LABELS[source];
  return source;
}

/**
 * Past tours taken by this guest, matched by exact full name
 * (case-insensitive, two+ words), newest first.
 *
 * Returns [] when the name is missing or the lookup fails —
 * never blocks booking creation.
 */
export async function getPreviousTours(
  supabase: SupabaseClient,
  customerName: string | null | undefined
): Promise<PreviousTour[]> {
  const bookings = await fetchGuestBookings(supabase, customerName, { pastOnly: true });
  return bookings.map((b) => ({
    date: b.date,
    tourName: b.tourName,
    source: b.source,
    guestNotes: b.guest_notes,
  }));
}
