import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyGygAuth } from "@/lib/gyg/auth";
import { gygJson } from "@/lib/gyg/response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const authError = verifyGygAuth(req);
  if (authError) return authError;

  const { productId } = await params;
  const supabase = createServiceClient();

  const { data: listing } = await supabase
    .from("tour_channel_listings")
    .select("tour_id")
    .eq("external_product_code", productId)
    .eq("channel", "gyg")
    .eq("is_active", true)
    .single();

  if (!listing) {
    return gygJson(
      { errorCode: "INVALID_PRODUCT", errorMessage: `Product not found: ${productId}` },
      { status: 200 }
    );
  }

  return gygJson(
    { data: { addons: [] } },
    { status: 200 }
  );
}
