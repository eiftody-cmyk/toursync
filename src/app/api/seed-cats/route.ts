import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  const supabase = createServiceClient();

  // Get all GYG tour listings with tour data
  const { data: listings } = await supabase
    .from("tour_channel_listings")
    .select("tour_id, external_product_code, tours(price, currency)")
    .eq("channel", "gyg")
    .eq("is_active", true);

  const results = [];

  for (const l of listings ?? []) {
    const tour = Array.isArray(l.tours) ? l.tours[0] : l.tours;
    if (!tour?.price) continue;

    const productId = l.external_product_code;
    const isGroup = productId === "T-1258476";
    const categories = isGroup ? ["GROUP"] : ["ADULT", "SENIOR"];

    for (const cat of categories) {
      const { error } = await supabase
        .from("tour_pricing_categories")
        .upsert(
          {
            tour_id: l.tour_id,
            category: cat,
            price: Math.round(tour.price),
            currency: tour.currency || "JPY",
          },
          { onConflict: "tour_id,category" }
        );

      results.push({
        product: productId,
        category: cat,
        price: Math.round(tour.price),
        error: error?.message ?? null,
      });
    }
  }

  return NextResponse.json(results);
}
