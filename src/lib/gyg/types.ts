// GYG Supplier API types — matches OpenAPI spec v48

export type GygCategory =
  | "ADULT" | "CHILD" | "YOUTH" | "INFANT" | "SENIOR" | "STUDENT"
  | "EU_CITIZEN" | "MILITARY" | "EU_CITIZEN_STUDENT" | "GROUP" | "COLLECTIVE";

export type GygTicketCodeType =
  | "TEXT" | "BARCODE_CODE39" | "BARCODE_CODE128" | "QR_CODE"
  | "DATA_MATRIX" | "EAN_13" | "ITF" | "AZTEC";

// ── Availability ────────────────────────────────────────────────

export interface GygRetailPrice {
  category: GygCategory;
  price: number; // smallest currency unit (JPY = exact amount)
}

export interface GygPricesByCategory {
  retailPrices: GygRetailPrice[];
}

export interface GygOpeningTime {
  fromTime: string; // "HH:MM"
  toTime: string;   // "HH:MM"
}

export interface GygAvailability {
  productId: string;
  dateTime: string; // ISO 8601
  cutoffSeconds?: number;
  vacancies?: number;
  currency?: string;
  pricesByCategory?: GygPricesByCategory;
  openingTimes?: GygOpeningTime[];
}

export interface GygAvailabilityResponse {
  data: {
    availabilities: GygAvailability[];
  };
}

// ── Reservation ─────────────────────────────────────────────────

export interface GygReservationBookingItem {
  category: GygCategory;
  count: number;
  groupSize?: number;
}

export interface GygReservationRequest {
  data: {
    productId: string;
    dateTime: string;
    bookingItems: GygReservationBookingItem[];
    gygBookingReference: string;
    gygActivityReference?: string;
  };
}

export interface GygReservationResponse {
  data: {
    reservationReference: string;
    reservationExpiration: string; // ISO 8601
  };
}

export interface GygReservationCancellationRequest {
  data: {
    reservationReference: string;
    gygBookingReference: string;
    gygActivityReference?: string;
  };
}

// ── Booking ─────────────────────────────────────────────────────

export interface GygBookingItem {
  category: GygCategory;
  count: number;
  retailPrice: number;
  groupSize?: number;
}

export interface GygTraveler {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface GygBookingRequest {
  data: {
    productId: string;
    reservationReference: string;
    gygBookingReference: string;
    gygActivityReference?: string;
    currency: string;
    dateTime: string;
    bookingItems: GygBookingItem[];
    travelers: GygTraveler[];
    comment: string;
    language?: string;
    travelerHotel?: string;
  };
}

export interface GygTicket {
  category: GygCategory | "COLLECTIVE";
  ticketCode: string;
  ticketCodeType: GygTicketCodeType;
}

export interface GygBookingResponse {
  data: {
    bookingReference: string;
    tickets: GygTicket[];
  };
}

export interface GygBookingCancellationRequest {
  data: {
    bookingReference: string;
    gygBookingReference: string;
    productId: string;
  };
}

// ── Errors ──────────────────────────────────────────────────────

export type GygErrorCode =
  | "AUTHORIZATION_FAILURE"
  | "INVALID_PRODUCT"
  | "VALIDATION_FAILURE"
  | "INTERNAL_SYSTEM_FAILURE"
  | "NO_AVAILABILITY"
  | "INVALID_TICKET_CATEGORY"
  | "INVALID_PARTICIPANTS_CONFIGURATION"
  | "INVALID_RESERVATION"
  | "INVALID_BOOKING"
  | "INVALID_SUPPLIER"
  | "BOOKING_REDEEMED"
  | "BOOKING_IN_PAST"
  | "BOOKING_ALREADY_CANCELED";

export interface GygErrorResponse {
  errorCode: GygErrorCode;
  errorMessage: string;
  participantsConfiguration?: {
    min: number;
    max: number | null;
  };
  groupConfiguration?: {
    max: number;
  };
}

// ── Empty success ───────────────────────────────────────────────

export interface GygEmptySuccessResponse {
  data: Record<string, never>;
}
