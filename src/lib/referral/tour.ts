import { createClient } from "@/lib/supabase/server";

// The flagship 2.5-hour tour already positioned for Shōgun-series viewers.
// Single source for /ref/[slug] and /misaki — both sell exactly this one tour.
export const FLAGSHIP_TOUR_ID = "c97d74f3-c95a-451f-aa1a-e34452b3e592";

export interface ReferralTour {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  capacity: number;
  meeting_point_address: string | null;
}

const FALLBACK_TOUR: ReferralTour = {
  id: FLAGSHIP_TOUR_ID,
  name: "Osaka Castle: Warrior Monks, a Peasant, and a Shogun",
  description:
    "An Osaka Castle Park tour for Shogun-series fans looking for accurate, accessible history.",
  price: 9500,
  currency: "JPY",
  capacity: 6,
  meeting_point_address:
    "2-3-6 Tanimachi, Chuo-ku, Osaka - There is a CoCo Curry House restaurant on the ground floor.",
};

/** Live tour row, falling back to static copy on any failure. */
export async function fetchFlagshipTour(): Promise<ReferralTour> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("tours")
      .select(
        "id, name, description, price, currency, capacity, meeting_point_address"
      )
      .eq("id", FLAGSHIP_TOUR_ID)
      .single();
    if (data) return data as ReferralTour;
  } catch {
    // fall back below
  }
  return FALLBACK_TOUR;
}
