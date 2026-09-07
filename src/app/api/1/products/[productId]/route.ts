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
    .select("tour_id, tours(*)")
    .eq("external_product_code", productId)
    .eq("channel", "gyg")
    .eq("is_active", true)
    .single();

  if (!listing?.tours) {
    return gygJson(
      { errorCode: "INVALID_PRODUCT", errorMessage: `Product not found: ${productId}` },
      { status: 200 }
    );
  }

  const tour = (Array.isArray(listing.tours) ? listing.tours[0] : listing.tours) as {
    id: string;
    name: string;
    description: string | null;
    capacity: number;
    group_size_min: number;
    group_size_max: number;
    ticket_type: string;
    product_type: string;
  };

  return gygJson(
    {
      data: {
        supplierId: "ExperienceRelay",
        productTitle: tour.name,
        productDescription: tour.description || tour.name,
        productType: tour.product_type === "time_period" ? "TIME_PERIOD" : "TIME_POINT",
        destinationLocation: {
          city: "Osaka",
          country: "JPN",
        },
        configuration: {
          participantsConfiguration: {
            min: tour.ticket_type === "group" ? tour.group_size_min : 1,
            max: tour.ticket_type === "group" ? tour.group_size_max : tour.capacity,
          },
        },
      },
    },
    { status: 200 }
  );
}
