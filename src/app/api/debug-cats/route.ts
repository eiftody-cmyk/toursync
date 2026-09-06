import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  const supabase = createServiceClient();
  const { data: listings } = await supabase
    .from("tour_channel_listings")
    .select("tour_id, external_product_code, tours(name)")
    .eq("channel", "gyg")
    .eq("is_active", true);

  const results = [];
  for (const l of listings ?? []) {
    const { data: cats } = await supabase
      .from("tour_pricing_categories")
      .select("category, price")
      .eq("tour_id", l.tour_id);
    results.push({
      product: l.external_product_code,
      tour: (l.tours as any)?.name,
      categories: cats,
    });
  }
  return NextResponse.json(results);
}
