// Booking item from OTAs (GYG, Viator)
export interface BookingItem {
  category: string;
  count: number;
  groupSize?: number;
  retailPrice?: number;
}

// Customer information for bookings
export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
}

// Reservation status
export type ReservationStatus = 'active' | 'expired' | 'converted' | 'cancelled';

// Reservation record (maps to reservations table)
export interface Reservation {
  id: string;
  channel: string;
  channel_reservation_id: string | null;
  tour_id: string;
  user_id: string;
  date: string;
  start_time: string | null;
  booking_items: BookingItem[];
  total_guests: number;
  total_price: number;
  currency: string;
  status: ReservationStatus;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

// Booking record (maps to bookings table)
export interface Booking {
  id: string;
  tour_id: string;
  user_id: string;
  date: string;
  start_time: string | null;
  guest_count: number;
  source: string;
  channel: string;
  channel_booking_reference: string | null;
  reservation_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

// Capacity check result
export interface CapacityResult {
  remaining: number;
  totalBooked: number;
  capacity: number;
}

// Tour lookup result (shared across adapters)
export interface TourInfo {
  id: string;
  user_id: string;
  name: string;
  capacity: number;
  price: number | null;
  currency: string;
  cutoff_minutes: number;
  product_type: 'time_point' | 'time_period';
  ticket_type: 'individual' | 'group';
  group_size_min: number | null;
  group_size_max: number | null;
  opening_hours: { fromTime: string; toTime: string } | null;
}

// Pricing category
export interface PricingCategory {
  category: string;
  price: number;
  currency: string;
}
