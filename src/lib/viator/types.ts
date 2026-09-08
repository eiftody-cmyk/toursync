// Viator API types (v2.0 spec)

// === Ticket Types ===
export type ViatorTicketType = 'ADULT' | 'CHILD' | 'YOUTH' | 'INFANT' | 'SENIOR' | 'UNIT';

// === Price Types ===
export type ViatorPriceType = 'PER_PERSON_PRICE' | 'PER_UNIT_PRICE' | 'TIERED_PER_PERSON_PRICE' | 'UNSUPPORTED_PRICE';

// === Capacity Types ===
export type ViatorCapacityType = 'UNLIMITED' | 'LIMITED';

// === Event Status ===
export type ViatorEventStatus = 'AVAILABLE' | 'UNAVAILABLE';

// === Request Types ===
export interface ViatorTicketRequest {
  type: ViatorTicketType;
  quantity: number;
}

export interface ViatorAvailabilityCheckRequest {
  supplierId: number;
  productOptionIds: string[];
  travelDate: string; // YYYY-MM-DD
  ticketRequests: ViatorTicketRequest[];
}

export interface ViatorAvailabilityCalendarRequest {
  supplierId: number;
  productOptionIds: string[];
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface ViatorReserveRequest {
  supplierId: number;
  productOptionId: string;
  travelDate: string;
  ticketRequests: ViatorTicketRequest[];
}

export interface ViatorBookingRequest {
  supplierId: number;
  productOptionId: string;
  reservationId: string;
  travelDate: string;
  bookingReference: string;
  ticketRequests: ViatorTicketRequest[];
  leadTraveller: {
    fullName: string;
    email: string;
    phone?: string;
  };
}

export interface ViatorBookingCancellationRequest {
  supplierId: number;
  bookingReference: string;
  cancellationReason?: string;
}

export interface ViatorAvailabilityNotificationRequest {
  supplierId: number;
  productOptionId: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  notificationType: 'AVAILABILITY' | 'PRICING' | 'CAPACITY';
  status: 'AVAILABLE' | 'UNAVAILABLE';
}

// === Response Types ===
export interface ViatorPrice {
  type: ViatorPriceType;
  price: number;
  currency: string;
}

export interface ViatorTieredPrice {
  type: 'TIERED_PER_PERSON_PRICE';
  minimumPrice: number;
  maximumPrice: number;
  currency: string;
  tiers: Array<{
    fromQuantity: number;
    toQuantity: number;
    price: number;
    currency: string;
  }>;
}

export interface ViatorUnlimitedCapacity {
  type: 'UNLIMITED';
}

export interface ViatorLimitedCapacity {
  type: 'LIMITED';
  vacancies: number;
  original: number;
  remaining: number;
}

export type ViatorCapacity = ViatorUnlimitedCapacity | ViatorLimitedCapacity;

export interface ViatorAvailability {
  productOptionId: string;
  available: boolean;
  vacancies: number;
  prices: ViatorPrice[];
}

export interface ViatorCalendarEvent {
  date: string;
  startTime: string;
  endTime: string;
  status: ViatorEventStatus;
  capacity: ViatorCapacity;
  price: ViatorPrice | ViatorTieredPrice;
}

export interface ViatorReserveResponse {
  reservationId: string;
  productOptionId: string;
  expiryTime: string;
  totalPrice: number;
  currency: string;
}

export interface ViatorBookingResponse {
  bookingReference: string;
  status: 'CONFIRMED' | 'PENDING';
  totalPrice: number;
  currency: string;
}

export interface ViatorCancellationResponse {
  bookingReference: string;
  status: 'CANCELLED';
  cancellationFee: number;
  refundAmount: number;
  currency: string;
}

// === Tour List Types ===
export interface ViatorPriceBand {
  ageFrom: number;
  ageTo: number;
  price: number;
  currency: string;
}

export interface ViatorProduct {
  tourCode: string;
  productOptionId: string;
  productName: string;
  description: string;
  isPerPersonPrice: boolean;
  isGroupPricing: boolean;
  duration: string;
  priceBands: ViatorPriceBand[];
}

export interface ViatorTourListResponse {
  products: ViatorProduct[];
}

// === Notification Types ===
export interface ViatorEventNotification {
  supplierId: number;
  productOptionId: string;
  events: Array<{
    startTime: string;
    endTime: string;
    status: ViatorEventStatus;
    capacity: ViatorCapacity;
    price: ViatorPrice;
  }>;
}

// === Mapping Types ===
export interface ViatorMappingCatalogRequest {
  supplierId: number;
}

export interface ViatorMappingConnectRequest {
  supplierId: number;
  mappings: Array<{
    supplierProductCode: string;
    viatorProductId: string;
  }>;
}

export interface ViatorMappingDisconnectRequest {
  supplierId: number;
  mappings: Array<{
    supplierProductCode: string;
    viatorProductId: string;
  }>;
}
