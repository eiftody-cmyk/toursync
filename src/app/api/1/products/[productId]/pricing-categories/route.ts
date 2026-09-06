import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyGygAuth } from "@/lib/gyg/auth";

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
    .select("tour_id, tours(*)")
    .eq("external_product_code", productId)
    .eq("channel", "gyg")
    .eq("is_active", true)
    .single();

  if (!listing?.tours) {
    return NextResponse.json(
      { errorCode: "INVALID_PRODUCT", errorMessage: `Product not found: ${productId}` },
      { status: 200 }
    );
  }

  const tour = (Array.isArray(listing.tours) ? listing.tours[0] : listing.tours) as {
    id: string;
    currency: string;
    group_size_min: number;
    group_size_max: number;
    ticket_type: string;
  };

  const { data: categories } = await supabase
    .from("tour_pricing_categories")
    .select("category, price, currency")
    .eq("tour_id", tour.id);

  const pricingCategories = (categories ?? []).map((c) => ({
    category: c.category,
    minTicketAmount: 1,
    maxTicketAmount: 999,
    groupSizeMin: tour.ticket_type === "group" ? tour.group_size_min : null,
    groupSizeMax: tour.ticket_type === "group" ? tour.group_size_max : null,
    ageFrom: null,
    ageTo: null,
    bookingCategory: "STANDARD",
    price: [
      {
        priceType: "RETAIL_PRICE",
        price: c.price,
        currency: c.currency || tour.currency || "JPY",
      },
    ],
  }));

  return NextResponse.json(
    { data: { pricingCategories } },
    { status: 200 }
  );
}
