import type { SupabaseClient } from "@supabase/supabase-js";
import { notifyViatorAvailabilityChange } from "@/lib/adapters/viator";
import { notifyGygAvailabilityChange } from "@/lib/adapters/gyg";

export interface PushAvailabilityParams {
  tour_id: string;
  date: string;
  start_time?: string;
  remaining_capacity: number;
}

export interface PushResult {
  channel: string;
  ok: boolean;
  error?: string;
}

const PUSH_CHANNELS = ["viator", "gyg"] as const;

export async function pushAvailability(
  supabase: SupabaseClient,
  params: PushAvailabilityParams
): Promise<PushResult[]> {
  const { data: listings } = await supabase
    .from("tour_channel_listings")
    .select("*")
    .eq("tour_id", params.tour_id)
    .eq("is_active", true)
    .in("channel", PUSH_CHANNELS);

  if (!listings?.length) return [];

  const results: PushResult[] = [];

  for (const listing of listings) {
    try {
      if (listing.channel === "viator") {
        const r = await notifyViatorAvailabilityChange({
          ...params,
          external_product_code: listing.external_product_code,
        });
        results.push({ channel: "viator", ok: r.ok, error: r.error });
      } else if (listing.channel === "gyg") {
        const r = await notifyGygAvailabilityChange({
          ...params,
          external_product_code: listing.external_product_code,
        });
        results.push({ channel: "gyg", ok: r.ok, error: r.error });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[OTA] ${listing.channel} push failed:`, msg);
      results.push({ channel: listing.channel, ok: false, error: msg });
    }
  }

  return results;
}
