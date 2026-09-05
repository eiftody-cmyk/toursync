export type Tour = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  capacity: number;
  price: number | null;
  currency: string;
  google_calendar_id: string | null;
  created_at: string;
};

export type Booking = {
  id: string;
  tour_id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  guest_count: number;
  source: string | null;
  customer_name: string | null;
  customer_email: string | null;
  status: string;
  start_time: string | null; // HH:MM (JST)
  end_time: string | null; // HH:MM (JST)
  notes: string | null;
  created_at: string;
};

export type BlockedDate = {
  id: string;
  tour_id: string | null;
  user_id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
  google_calendar_event_id: string | null;
  calendar_id: string | null;
  is_auto_blocked: boolean;
  created_at: string;
};

export type GoogleTokens = {
  id: string;
  user_id: string;
  access_token: string | null;
  refresh_token: string | null;
  token_expiry: string | null;
  calendar_id: string;
  created_at: string;
};

export type CapacityInfo = {
  tourId: string;
  date: string;
  capacity: number;
  booked: number;
  remaining: number;
  isBlocked: boolean;
  isFull: boolean;
  status: "available" | "almost-full" | "full" | "blocked";
};

export type TourChannelListing = {
  id: string;
  tour_id: string;
  user_id: string;
  channel: "viator" | "gyg" | "travelio";
  external_product_code: string;
  supplier_code: string | null;
  listing_url: string | null;
  is_active: boolean;
  created_at: string;
};

export const CHANNELS = ["viator", "gyg", "travelio"] as const;

export type Channel = (typeof CHANNELS)[number];

export const CHANNEL_LABELS: Record<Channel, string> = {
  viator: "Viator",
  gyg: "GetYourGuide",
  travelio: "Travelio",
};

export type TourSchedule = {
  id: string;
  tour_id: string;
  user_id: string;
  day_of_week: number; // 0=Sun, 6=Sat
  start_time: string; // "HH:MM"
  duration_minutes: number;
  start_date: string; // YYYY-MM-DD
  end_date: string | null;
  is_active: boolean;
  created_at: string;
};

export type ScheduleException = {
  id: string;
  tour_id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  reason: string | null;
  created_at: string;
};

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const BOOKING_SOURCES = [
  "viator",
  "gyg",
  "airbnb",
  "travelio",
  "direct",
  "walk-in",
  "other",
] as const;

export type BookingSource = (typeof BOOKING_SOURCES)[number];

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
};
