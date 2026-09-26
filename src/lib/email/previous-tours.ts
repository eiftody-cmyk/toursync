import type { SupabaseClient } from "@supabase/supabase-js";

export interface PreviousTour {
  date: string;
  tourName: string;
  source: string | null;
}

const SOURCE_LABELS: Record<string, string | null> = {
  gyg: "GetYourGuide",
  viator: "Viator",
  airbnb: "Airbnb",
  direct: null,
  "direct-custom": null,
};

export function sourceLabel(source: string | null): string | null {
  if (!source) return null;
  if (source in SOURCE_LABELS) return SOURCE_LABELS[source];
  return source;
}

function todayInTokyo(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
}

/**
 * Past tours taken by this guest (confirmed, date before today, newest first).
 * Returns [] when the email is missing or the lookup fails — never blocks booking.
 */
export async function getPreviousTours(
  supabase: SupabaseClient,
  customerEmail: string | null | undefined
): Promise<PreviousTour[]> {
  if (!customerEmail) return [];
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("date, source, tours(name)")
      .ilike("customer_email", customerEmail)
      .eq("status", "confirmed")
      .lt("date", todayInTokyo())
      .order("date", { ascending: false });
    if (error) {
      console.error("[PreviousTours] Lookup failed:", error.message);
      return [];
    }
    return (data ?? []).map((row) => {
      const tour = row.tours as { name: string | null } | null;
      return {
        date: row.date as string,
        tourName: tour?.name ?? "Unknown tour",
        source: (row.source as string | null) ?? null,
      };
    });
  } catch (e) {
    console.error("[PreviousTours] Lookup threw:", e instanceof Error ? e.message : e);
    return [];
  }
}
