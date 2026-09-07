import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyGygAuth } from "@/lib/gyg/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ supplierId: string }> }
) {
  const authError = verifyGygAuth(req);
  if (authError) return authError;

  const supabase = createServiceClient();

  const { data: listings } = await supabase
    .from("tour_channel_listings")
    .select("external_product_code, tours(name, description)")
    .eq("channel", "gyg")
    .eq("is_active", true);

  const products = (listings || []).map((l: Record<string, unknown>) => {
    const tour = Array.isArray(l.tours) ? l.tours[0] : l.tours;
    return {
      productId: l.external_product_code,
      productTitle: tour?.name || "Unknown",
    };
  });

  return NextResponse.json({ data: { products } }, { status: 200 });
}
