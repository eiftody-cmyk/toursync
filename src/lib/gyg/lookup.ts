import { createServiceClient } from "@/lib/supabase/service";

export interface TourLookupResult {
  tour: {
    id: string;
    user_id: string;
    name: string;
    capacity: number;
    price: number | null;
    currency: string;
    cutoff_minutes: number;
    product_type: "time_point" | "time_period";
    ticket_type: "individual" | "group";
    group_size_min: number;
    group_size_max: number;
    opening_hours: { fromTime: string; toTime: string } | null;
  };
  tourId: string;
}

/**
 * Look up a tour by GYG productId.
 * Tries the exact value first (e.g. "T-1221780"), then falls back
 * to the numeric-only form ("1221780") since GYG's portal sometimes
 * sends the Product ID without the "T-" prefix.
 */
export async function lookupTourByProductId(productId: string): Promise<TourLookupResult | null> {
  const supabase = createServiceClient();

  // Try exact match first
  let { data: listing } = await supabase
    .from("tour_channel_listings")
    .select("tour_id, tours(*)")
    .eq("external_product_code", productId)
    .eq("channel", "gyg")
    .eq("is_active", true)
    .single();

  // Fallback: try with/without T- prefix
  if (!listing?.tours) {
    const altId = productId.startsWith("T-") ? productId.slice(2) : `T-${productId}`;
    ({ data: listing } = await supabase
      .from("tour_channel_listings")
      .select("tour_id, tours(*)")
      .eq("external_product_code", altId)
      .eq("channel", "gyg")
      .eq("is_active", true)
      .single());
  }

  if (!listing?.tours) return null;

  const tour = (Array.isArray(listing.tours) ? listing.tours[0] : listing.tours) as TourLookupResult["tour"];
  return { tour, tourId: listing.tour_id };
}
