import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyGygAuth } from "@/lib/gyg/auth";
import { gygJson } from "@/lib/gyg/response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ supplierId: string }> }
) {
  const authError = verifyGygAuth(req);
  if (authError) return authError;

  const supabase = createServiceClient();

  const { data: listings } = await supabase
    .from("tour_channel_listings")
    .select("external_product_code, tours(name, description, product_type)")
    .eq("channel", "gyg")
    .eq("is_active", true);

  const products = (listings || []).map((l: Record<string, unknown>) => {
    const tour = Array.isArray(l.tours) ? l.tours[0] : l.tours;
    const t = tour as { name?: string; product_type?: string } | null;
    return {
      productId: l.external_product_code,
      productTitle: t?.name || "Unknown",
      productType: t?.product_type === "time_period" ? "TIME_PERIOD" : "TIME_POINT",
    };
  });

  return gygJson({ data: { products } }, { status: 200 });
}
