import { createServiceClient } from '@/lib/supabase/service';
import type { BookingItem, PricingCategory } from './types';

/**
 * Get pricing categories for a tour.
 */
export async function getPricingCategories(
  tourId: string
): Promise<PricingCategory[]> {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from('tour_pricing_categories')
    .select('category, price, currency')
    .eq('tour_id', tourId);

  return (data ?? []) as PricingCategory[];
}

/**
 * Validate that all booking items have valid pricing categories.
 */
export async function validatePricingCategories(
  tourId: string,
  bookingItems: BookingItem[]
): Promise<boolean> {
  const categories = await getPricingCategories(tourId);
  const validCategories = new Set(categories.map(c => c.category));

  for (const item of bookingItems) {
    if (!validCategories.has(item.category)) {
      return false;
    }
  }

  return true;
}

/**
 * Calculate total price from booking items and pricing categories.
 */
export async function calculateTotalPrice(
  tourId: string,
  bookingItems: BookingItem[]
): Promise<{ totalPrice: number; currency: string }> {
  const categories = await getPricingCategories(tourId);
  const priceMap = new Map(categories.map(c => [c.category, c.price]));
  const currency = categories[0]?.currency ?? 'JPY';

  let totalPrice = 0;
  for (const item of bookingItems) {
    const unitPrice = priceMap.get(item.category) ?? 0;
    if (item.category === 'GROUP') {
      totalPrice += unitPrice * (item.count || 0);
    } else {
      totalPrice += unitPrice * (item.count || 0);
    }
  }

  return { totalPrice, currency };
}
