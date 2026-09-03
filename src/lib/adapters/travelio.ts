export interface TravelioAvailabilityParams {
  tour_id: string;
  date: string;
  start_time?: string;
  remaining_capacity: number;
  external_product_code: string;
}

/**
 * Travelio/Bokun uses a PULL model.
 * Travelio calls our availability endpoint — we don't push to them.
 *
 * This module will serve the API route that Bokun calls:
 *   POST /api/ota/travelio/availability
 *
 * For now, this is a data-preparation stub. The actual API route
 * is built when Travelio integration is activated.
 */
export function buildTravelioAvailabilityResponse(params: TravelioAvailabilityParams) {
  return {
    productCode: params.external_product_code,
    date: params.date,
    time: params.start_time,
    remainingCapacity: params.remaining_capacity,
  };
}
