# Viator API Specification & Analysis

**Last Updated:** 2026-09-08
**Supplier ID:** 5636104
**Business Name:** Osaka Castle Walks with Edward

---

## Overview

Viator's Supply API v2.0 is REST-based, POST-only, with JSON payloads. We build "Reservation System APIs" that Viator calls to check availability, hold inventory, and create bookings. We also build clients to call Viator's APIs for notifications and product mapping.

---

## Authentication

### v2.0+ (Current)
- Header: `X-Api-Key: {your-api-key}`
- Header: `X-Supplier-Id: 5636104`

### v1.0 (Legacy)
- Body field: `"ApiKey": "{your-api-key}"`
- Body field: `"SupplierId": 5636104`

---

## Reservation System APIs (Built by Us)

### 1. Tour List
- **Endpoint:** `POST /tourlist`
- **Version:** v1.0
- **Purpose:** List products for mapping
- **Mandatory:** Yes
- **Rate Limits:** 
  - Request: 50 products/request
  - Sustainable: `X` requests/second (X = ceil(products/10000), min 1)
  - Peak: `X*2` requests/second
- **SLA:** Expected <10s, Acceptable 15s, Max 60s
- **Error Rate:** <0.5%
- **Circuit Breaker:** 70% failure, 60s slow, 5 min calls, 30s open, 3 calls while open

**Response:**
```json
{
  "Products": [
    {
      "TourCode": "tour-uuid",
      "ProductOptionId": "option-id",
      "ProductName": "Tour Name",
      "Description": "...",
      "IsPerPersonPrice": true,
      "IsGroupPricing": false,
      "Duration": "1 hour",
      "PriceBands": [
        {
          "AgeFrom": 0,
          "AgeTo": 17,
          "Price": 28000,
          "Currency": "JPY"
        }
      ]
    }
  ]
}
```

### 2. Availability Check (Real-Time)
- **Endpoint:** `POST /v2/availability/check`
- **Version:** v2.0
- **Purpose:** Real-time availability during checkout
- **Mandatory:** Yes
- **Rate Limits:**
  - Sustainable: `X*10` requests/second
  - Peak: `X*20` requests/second
- **SLA:** Expected <1s, Acceptable 3s, Max 10s
- **Error Rate:** <1.5%
- **Circuit Breaker:** 70% failure, 10s slow, 10 min calls, 30s open, 5 calls while open

**Request:**
```json
{
  "SupplierId": 5636104,
  "ProductOptionIds": ["tour-uuid"],
  "TravelDate": "2026-09-12",
  "TicketRequests": [
    {
      "Type": "ADULT",
      "Quantity": 2
    }
  ]
}
```

**Response:**
```json
{
  "Availability": [
    {
      "ProductOptionId": "tour-uuid",
      "Available": true,
      "Vacancies": 10,
      "Prices": [
        {
          "Type": "ADULT",
          "Price": 28000,
          "Currency": "JPY"
        }
      ]
    }
  ]
}
```

### 3. Availability Calendar
- **Endpoint:** `POST /v2/availability/calendar`
- **Version:** v2.0
- **Purpose:** Long-term availability + pricing
- **Mandatory:** Yes
- **Rate Limits:**
  - Sustainable: `X*30` requests/second
  - Peak: `X*60` requests/second
- **SLA:** Expected <5s, Acceptable 10s, Max 20s
- **Error Rate:** <1%
- **Circuit Breaker:** 75% failure, 20s slow, 15 min calls, 60s open, 7 calls while open

**Request:**
```json
{
  "SupplierId": 5636104,
  "ProductOptionIds": ["tour-uuid"],
  "StartDate": "2026-09-01",
  "EndDate": "2026-09-30"
}
```

**Response:**
```json
{
  "ProductOptionId": "tour-uuid",
  "Events": [
    {
      "Date": "2026-09-12",
      "StartTime": "10:00",
      "EndTime": "11:00",
      "Status": "AVAILABLE",
      "Capacity": {
        "Type": "LIMITED",
        "Vacancies": 10,
        "Original": 10,
        "Remaining": 10
      },
      "Price": {
        "Type": "TIERED_PER_PERSON_PRICE",
        "MinimumPrice": 28000,
        "MaximumPrice": 28000,
        "Currency": "JPY",
        "Tiers": [
          {
            "FromQuantity": 1,
            "ToQuantity": 10,
            "Price": 28000,
            "Currency": "JPY"
          }
        ]
      }
    }
  ]
}
```

### 4. Reserve (Hold Inventory)
- **Endpoint:** `POST /v2/reserve`
- **Version:** v2.0
- **Purpose:** Hold inventory for 15 minutes during checkout
- **Mandatory:** Yes
- **Rate Limits:**
  - Sustainable: `X*5` requests/second
  - Peak: `X*10` requests/second
- **SLA:** Expected <1s, Acceptable 3s, Max 28s
- **Error Rate:** <1.5%
- **Circuit Breaker:** 75% failure, 15s slow, 15 min calls, 60s open, 7 calls while open

**Request:**
```json
{
  "SupplierId": 5636104,
  "ProductOptionId": "tour-uuid",
  "TravelDate": "2026-09-12",
  "TicketRequests": [
    {
      "Type": "ADULT",
      "Quantity": 2
    }
  ]
}
```

**Response:**
```json
{
  "ReservationId": "reserve-uuid",
  "ProductOptionId": "tour-uuid",
  "ExpiryTime": "2026-09-12T10:15:00Z",
  "TotalPrice": 56000,
  "Currency": "JPY"
}
```

#### 15-Minute Reservation Hold Explained

The 15-minute reservation hold is Viator's way of preventing double-bookings during checkout.

**Why Viator requires this:**
- Tour operators have limited capacity
- Viator needs to guarantee availability to customers
- Double-bookings cause cancellations, refunds, and bad reviews

**Flow comparison:**

| Approach | GYG (No Hold) | Viator (15-Min Hold) |
|----------|---------------|----------------------|
| Step 1 | Check availability | Reserve (locks inventory) |
| Step 2 | Check again at booking | Customer fills form (inventory locked) |
| Step 3 | Create booking | Create booking (with reservation_id) |
| Double-booking risk | Higher (no lock) | Lower (locked inventory) |
| Complexity | Simpler | More complex (expiration logic) |

**Customer flow:**
1. `POST /v2/reserve` → gets reservation_id + expiry_time (15 min)
2. Customer fills form (name, email, phone)
3. `POST /booking` → uses reservation_id to create booking

**Expiration logic:**
- If customer doesn't book within 15 minutes → inventory auto-releases
- We need a cleanup job that runs every minute
- Expired reservations → status = "EXPIRED" → inventory available again

**Database table: `viator_reservations`**
```sql
CREATE TABLE viator_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id VARCHAR(255) NOT NULL UNIQUE,
  tour_id UUID NOT NULL REFERENCES tours(id),
  travel_date DATE NOT NULL,
  travel_time VARCHAR(50) NOT NULL,
  ticket_requests JSONB NOT NULL,
  total_price INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'JPY',
  expires_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, CONVERTED
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Expiration cron job (run every minute):**
```sql
UPDATE viator_reservations 
SET status = 'EXPIRED' 
WHERE status = 'ACTIVE' 
AND expires_at < now();
```

**Edge cases to handle:**
1. Customer abandons checkout → reservation expires → inventory releases
2. Customer books at 14:59 → reservation still valid → booking succeeds
3. Two customers reserve same slot → second one fails (no vacancies)
4. System crashes during reservation → reservation expires → inventory releases
5. Customer tries to use expired reservation → booking fails → must reserve again

### 5. Booking (Create Booking)
- **Endpoint:** `POST /booking`
- **Version:** v1.0
- **Purpose:** Create booking
- **Mandatory:** Yes
- **Rate Limits:**
  - Sustainable: `X*5` requests/second
  - Peak: `X*10` requests/second
- **SLA:** Expected <5s, Acceptable 10s, Max 28s
- **Error Rate:** <0.75%
- **Circuit Breaker:** 75% failure, 25s slow, 15 min calls, 120s open, 7 calls while open

**Request:**
```json
{
  "SupplierId": 5636104,
  "ProductOptionId": "tour-uuid",
  "ReservationId": "reserve-uuid",
  "TravelDate": "2026-09-12",
  "BookingReference": "VBR-12345",
  "TicketRequests": [
    {
      "Type": "ADULT",
      "Quantity": 2
    }
  ],
  "LeadTraveller": {
    "FullName": "John Smith",
    "Email": "john@example.com",
    "Phone": "+1-555-123-4567"
  }
}
```

**Response:**
```json
{
  "BookingReference": "VBR-12345",
  "Status": "CONFIRMED",
  "TotalPrice": 56000,
  "Currency": "JPY"
}
```

### 6. Booking Cancellation
- **Endpoint:** `POST /booking-cancellation`
- **Version:** v1.0
- **Purpose:** Cancel booking
- **Mandatory:** Yes
- **Rate Limits:**
  - Sustainable: `X*5` requests/second
  - Peak: `X*10` requests/second
- **SLA:** Expected <1s, Acceptable 5s, Max 20s
- **Error Rate:** <0.75%
- **Circuit Breaker:** 75% failure, 10s slow, 15 min calls, 60s open, 7 calls while open

**Request:**
```json
{
  "SupplierId": 5636104,
  "BookingReference": "VBR-12345",
  "CancellationReason": "Customer request"
}
```

**Response:**
```json
{
  "BookingReference": "VBR-12345",
  "Status": "CANCELLED",
  "CancellationFee": 0,
  "RefundAmount": 56000,
  "Currency": "JPY"
}
```

### 7. Booking Amendment (Optional)
- **Endpoint:** `POST /booking-amendment`
- **Version:** v1.0
- **Purpose:** Modify booking
- **Mandatory:** Optional
- **Rate Limits:**
  - Sustainable: `X*5` requests/second
  - Peak: `X*10` requests/second
- **SLA:** Expected <1s, Acceptable 5s, Max 20s
- **Error Rate:** <0.75%
- **Circuit Breaker:** 75% failure, 10s slow, 15 min calls, 60s open, 7 calls while open

**Request:**
```json
{
  "SupplierId": 5636104,
  "BookingReference": "VBR-12345",
  "NewTravelDate": "2026-09-13",
  "NewTicketRequests": [
    {
      "Type": "ADULT",
      "Quantity": 3
    }
  ]
}
```

### 8. Redemption (Optional)
- **Endpoint:** `POST /redemption`
- **Version:** v1.0
- **Purpose:** Check ticket redemption
- **Mandatory:** Optional
- **Rate Limits:**
  - Sustainable: `X*5` requests/second
  - Peak: `X*10` requests/second
- **SLA:** Expected <1s, Acceptable 5s, Max 20s
- **Error Rate:** <0.75%

**Request:**
```json
{
  "SupplierId": 5636104,
  "BookingReference": "VBR-12345",
  "TicketCode": "TKT-12345"
}
```

### 9. Availability Notification (Push to Viator)
- **Endpoint:** `POST /availabilitynotification2`
- **Version:** v1.0
- **Purpose:** Notify Viator of availability changes
- **Mandatory:** Yes

**Request:**
```json
{
  "SupplierId": 5636104,
  "ProductOptionId": "tour-uuid",
  "DateRange": {
    "StartDate": "2026-09-01",
    "EndDate": "2026-09-30"
  },
  "NotificationType": "AVAILABILITY",
  "Status": "AVAILABLE"
}
```

---

## Viator APIs (Built by Viator, We Call)

### 1. Event Notification
- **Endpoint:** `POST /v2/notification/events`
- **Version:** v2.0
- **Purpose:** Notify Viator of availability/pricing/capacity changes
- **Rate Limits:**
  - Sustainable: `X*1` requests/second
  - Peak: `X*2` requests/second
- **SLA:** Expected <3s, Acceptable 5s, Max 10s
- **Error Rate:** <0.5%

**Request:**
```json
{
  "SupplierId": 5636104,
  "ProductOptionId": "tour-uuid",
  "Events": [
    {
      "StartTime": "2026-09-12T10:00:00",
      "EndTime": "2026-09-12T11:00:00",
      "Status": "AVAILABLE",
      "Capacity": {
        "Type": "LIMITED",
        "Vacancies": 10,
        "Original": 10
      },
      "Price": {
        "Type": "PER_PERSON_PRICE",
        "Price": 28000,
        "Currency": "JPY"
      }
    }
  ]
}
```

### 2. Special Offers Notification
- **Endpoint:** `POST /v2/notification/special-offers`
- **Version:** v2.0
- **Purpose:** Notify Viator of special offers
- **Rate Limits:**
  - Sustainable: `X*1` requests/second
  - Peak: `X*2` requests/second
- **SLA:** Expected <3s, Acceptable 5s, Max 10s
- **Error Rate:** <0.5%

### 3. Product Special Offers
- **Endpoint:** `POST /v2/product/special-offers`
- **Version:** v2.0
- **Purpose:** Get special offer metadata
- **Rate Limits:**
  - Sustainable: `X*1` requests/second
  - Peak: `X*2` requests/second
- **SLA:** Expected <3s, Acceptable 5s, Max 10s
- **Error Rate:** <0.5%

### 4. Mapping Catalog
- **Endpoint:** `POST /v2/mappings/catalog`
- **Version:** v2.0 (Beta)
- **Purpose:** Product mapping catalog
- **Rate Limits:**
  - Sustainable: `X*1` requests/second
  - Peak: `X*2` requests/second
- **SLA:** Expected <3s, Acceptable 5s, Max 10s
- **Error Rate:** <0.5%

### 5. Connect Products
- **Endpoint:** `POST /v2/mappings/connect`
- **Version:** v2.0 (Beta)
- **Purpose:** Map products
- **Rate Limits:**
  - Sustainable: `X*1` requests/second
  - Peak: `X*2` requests/second
- **SLA:** Expected <3s, Acceptable 5s, Max 10s
- **Error Rate:** <0.5%

### 6. Disconnect Products
- **Endpoint:** `POST /v2/mappings/disconnect`
- **Version:** v2.0 (Beta)
- **Purpose:** Unmap products
- **Rate Limits:**
  - Sustainable: `X*1` requests/second
  - Peak: `X*2` requests/second
- **SLA:** Expected <3s, Acceptable 5s, Max 10s
- **Error Rate:** <0.5%

---

## Key Schemas

### Ticket Types
- `ADULT` — Adult ticket
- `CHILD` — Child ticket (typically 4-12)
- `YOUTH` — Youth ticket (typically 13-17)
- `INFANT` — Infant ticket (typically 0-3)
- `SENIOR` — Senior ticket (typically 65+)
- `UNIT` — Per group/vehicle pricing

### Price Types
- `PER_PERSON_PRICE` — Per person pricing
- `PER_UNIT_PRICE` — Per group/vehicle pricing
- `TIERED_PER_PERSON_PRICE` — Tiered pricing by quantity
- `UNSUPPORTED_PRICE` — Cannot map pricing

### Capacity Types
- `UNLIMITED` — No capacity restrictions
- `LIMITED` — Has capacity limits (vacancies, original, remaining)

### Event Status
- `AVAILABLE` — Tour is available
- `UNAVAILABLE` — Tour is not available

---

## Rate Limit Calculation

**X = ceil(products / 10000), minimum 1**

For our 5 products: X = 1

| API | Sustainable | Peak |
|-----|------------|------|
| Availability Check | 10/sec | 20/sec |
| Reserve | 5/sec | 10/sec |
| Booking | 5/sec | 10/sec |
| Calendar | 30/sec | 60/sec |
| Tourlist | 1/sec | 2/sec |
| Notifications | 1/sec | 2/sec |

---

## Circuit Breakers

| API | Failure Threshold | Slow Call | Min Calls/Min | Open Duration | Calls While Open |
|-----|------------------|-----------|---------------|---------------|------------------|
| Availability Check | 70% | 10s | 10 | 30s | 5 |
| Calendar | 75% | 20s | 15 | 60s | 7 |
| Tour List | 70% | 60s | 5 | 30s | 3 |
| Reserve | 75% | 15s | 15 | 60s | 7 |
| Booking | 75% | 25s | 15 | 120s | 7 |
| Cancellation | 75% | 10s | 15 | 60s | 7 |
| Amendment | 75% | 10s | 15 | 60s | 7 |

---

## Product Mapping Flow

1. We return products via `/tourlist`
2. Viator calls `/v2/mappings/catalog` to see what's mapped
3. We call `/v2/mappings/connect` to map our products to Viator's
4. Viator starts calling our availability/booking endpoints
5. We can call `/v2/mappings/disconnect` to unmap products

---

## Key Differences from GYG

| Aspect | GYG | Viator |
|--------|-----|--------|
| Methods | GET + POST | POST only |
| Auth | Basic Auth | API key header |
| Body wrapper | `{"data": {...}}` | `{"supplierId": ..., "data": {...}}` |
| Reserve | No explicit hold | 15-minute hold required |
| Calendar | Separate endpoint | Combined calendar with pricing |
| Notifications | Pull-based | Push-based to Viator |
| Pricing | Category-based | Age band + Unit |
| Contract testing | Self-service tool | Docker-based tool |
| Product ID | `productId` | `SupplierProductCode` + `productOptionId` |
| Error handling | Varies by endpoint | Consistent error codes |
| Rate limits | Not documented | Detailed per-API |
| Circuit breakers | Not documented | Detailed per-API |

---

## Database Changes Needed

### 1. New Table: `viator_channel_listings`
```sql
CREATE TABLE viator_channel_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id),
  supplier_product_code VARCHAR(255) NOT NULL, -- tour UUID
  product_option_id VARCHAR(255) NOT NULL, -- same as supplier_product_code
  product_name VARCHAR(255) NOT NULL,
  is_per_person_price BOOLEAN NOT NULL DEFAULT true,
  is_group_pricing BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tour_id)
);
```

### 2. New Table: `viator_reservations`
```sql
CREATE TABLE viator_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id VARCHAR(255) NOT NULL UNIQUE,
  tour_id UUID NOT NULL REFERENCES tours(id),
  travel_date DATE NOT NULL,
  travel_time VARCHAR(50) NOT NULL,
  ticket_requests JSONB NOT NULL,
  total_price INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'JPY',
  expires_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, CONVERTED
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3. Extend `bookings` Table
```sql
ALTER TABLE bookings ADD COLUMN channel VARCHAR(20) NOT NULL DEFAULT 'direct';
ALTER TABLE bookings ADD COLUMN viator_booking_reference VARCHAR(255);
ALTER TABLE bookings ADD COLUMN reservation_id VARCHAR(255);
```

### 4. Extend `tours` Table
```sql
ALTER TABLE tours ADD COLUMN viator_product_option_id VARCHAR(255);
ALTER TABLE tours ADD COLUMN viator_supplier_product_code VARCHAR(255);
```

---

## File Structure (Proposed)

```
src/app/api/viator/
├── tourlist/route.ts              # POST /tourlist
├── availability/
│   ├── calendar/route.ts          # POST /v2/availability/calendar
│   └── check/route.ts             # POST /v2/availability/check
├── reserve/route.ts               # POST /v2/reserve
├── booking/route.ts               # POST /booking
├── booking-amendment/route.ts     # POST /booking-amendment
├── booking-cancellation/route.ts  # POST /booking-cancellation
├── redemption/route.ts            # POST /redemption
├── availabilitynotification2/route.ts  # POST /availabilitynotification2
├── notification/
│   ├── events/route.ts            # POST /v2/notification/events (client)
│   └── special-offers/route.ts    # POST /v2/notification/special-offers (client)
├── product/
│   └── special-offers/route.ts    # POST /v2/product/special-offers (client)
└── mappings/
    ├── catalog/route.ts           # POST /v2/mappings/catalog (client)
    ├── connect/route.ts           # POST /v2/mappings/connect (client)
    └── disconnect/route.ts        # POST /v2/mappings/disconnect (client)
```

---

## Implementation Phases

### Phase 1: Setup & Tour List (1-2 days)
- Receive API key from Viator
- Build `/tourlist` endpoint
- Return our 5 tours with `SupplierProductCode` = tour UUID
- Create `viator_channel_listings` table

### Phase 2: Availability & Pricing (3-4 days)
- Build `/v2/availability/calendar` — date range availability
- Build `/v2/availability/check` — real-time availability
- Build `/v2/reserve` — 15-minute inventory hold
- Build `/availabilitynotification2` — push changes to Viator
- Create `viator_reservations` table
- Implement 15-minute expiration logic

### Phase 3: Booking Operations (2-3 days)
- Build `/booking` — receive bookings
- Build `/booking-cancellation` — receive cancellations
- Build `/booking-amendment` — receive amendments (optional)
- Build `/redemption` — check ticket redemption (optional)
- Extend `bookings` table with Viator columns

### Phase 4: Viator APIs (Notifications) (1-2 days)
- Build client for `/v2/notification/events`
- Build client for `/v2/notification/special-offers`
- Build client for `/v2/product/special-offers`
- Implement event notification logic
- Implement special offers notification logic

### Phase 5: Product Mapping (1 day)
- Build client for `/v2/mappings/catalog`
- Build client for `/v2/mappings/connect`
- Build client for `/v2/mappings/disconnect`
- Implement mapping UI in dashboard

### Phase 6: Testing & Certification (2-3 days)
- Use Docker contract testing tool
- Configure test environment
- Run certification tests
- Go live

**Total: 10-15 days**

---

## What We Need from Viator

1. **API Key** — for authentication
2. **Supplier ID** — already have: 5636104
3. **Reseller ID** — for v1.0 APIs (if needed)
4. **Test environment** — sandbox for development
5. **Product list** — their product codes for our tours

---

## Testing Strategy

### Contract Testing
- Use Docker-based contract testing tool
- Test each endpoint against Viator's mock server
- Validate request/response schemas

### Integration Testing
- Test availability check with real DB data
- Test reserve + booking flow end-to-end
- Test cancellation + refund flow
- Test 15-minute reservation expiration

### Load Testing
- Verify SLA compliance
- Test circuit breaker behavior
- Test rate limiting

---

## Monitoring

### Metrics to Track
- Response times per API
- Error rates per API
- Circuit breaker state changes
- Rate limit violations
- Reservation expiration rates

### Alerts
- Response time > SLA threshold
- Error rate > threshold
- Circuit breaker opens
- Rate limit exceeded

---

## Notes

1. **Time Handling:** Viator expects `HH:MM` format, no timezone (assumed local to product)
2. **Price Handling:** All prices in JPY, integer (no decimals)
3. **Reservation Expiry:** Must implement 15-minute hold with automatic expiration
4. **Notification Push:** Must proactively push availability changes to Viator
5. **Contract Testing:** More sophisticated than GYG (Docker-based)
6. **Rate Limits:** Detailed per-API, must implement backoff
7. **Circuit Breakers:** Must implement per-API circuit breakers

---

## OpenAPI 3.0 Spec

The full OpenAPI 3.0 spec is available in the chat history from 2026-09-08. Key highlights:

- **Servers:** `https://your-reservation-system.example.com` (placeholder)
- **Security:** `X-Api-Key` header (v2.0+) or body `ApiKey` (v1.0)
- **Content-Type:** `application/json` only (XML deprecated)
- **Error Responses:** Consistent error codes across all APIs

---

## Mitigation Plan: Protecting GYG During Refactoring

### Strategy 1: Staged Rollout (Not Big Bang)

Don't refactor GYG immediately. Build the core services and Viator adapter first. Only refactor GYG after we have confidence in the new architecture.

```
Phase 1: Build core services (no GYG changes)
Phase 2: Build Viator adapter (uses core services)
Phase 3: Test Viator adapter thoroughly
Phase 4: THEN refactor GYG to use core services
Phase 5: Remove old code after verification
```

**Why this works:**
- GYG stays untouched while we build and test the new architecture
- We can validate core services with Viator (new code, no legacy risk)
- Only after Viator is working do we touch GYG
- If something breaks, we can revert GYG changes without affecting Viator

### Strategy 2: Database Migration Safety

**Use non-destructive migrations:**

```sql
-- 1. Add new table (doesn't affect existing tables)
CREATE TABLE IF NOT EXISTS reservations (...);

-- 2. Add new columns (doesn't affect existing data)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS channel TEXT NOT NULL DEFAULT 'direct';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS channel_booking_reference TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reservation_id UUID REFERENCES reservations(id);

-- 3. DON'T drop gyg_reservations yet
-- Keep it until we've verified the new system works
```

**Migration verification checklist:**
- [ ] Row count before migration = row count after migration
- [ ] All existing GYG bookings still have `source = 'gyg'`
- [ ] All existing `gyg_booking_reference` values preserved
- [ ] All existing `reservation_reference` values preserved
- [ ] New columns have sensible defaults (`channel = 'direct'`)

**Data migration script (run after Phase 4):**
```sql
-- 1. Verify counts first
SELECT COUNT(*) FROM gyg_reservations;
-- 2. Migrate data
INSERT INTO reservations (channel, channel_reservation_id, tour_id, date, start_time, booking_items, total_guests, total_price, currency, status, expires_at, created_at)
SELECT
  'gyg' as channel,
  reservation_reference as channel_reservation_id,
  tour_id,
  date,
  start_time,
  booking_items,
  -- Calculate total_guests from booking_items
  (SELECT SUM(CASE WHEN item->>'category' = 'GROUP'
    THEN (item->>'groupSize')::int * (item->>'count')::int
    ELSE (item->>'count')::int END)
   FROM jsonb_array_elements(booking_items) AS item) as total_guests,
  0 as total_price, -- Will need to calculate or set to 0
  'JPY' as currency,
  CASE WHEN expires_at > now() THEN 'active' ELSE 'expired' END as status,
  expires_at,
  created_at
FROM gyg_reservations;
-- 3. Verify counts match
SELECT COUNT(*) FROM reservations WHERE channel = 'gyg';
-- 4. Only then drop old table
-- DROP TABLE gyg_reservations;
```

### Strategy 3: Feature Flags

**Use environment variables to toggle between old and new code paths:**

```typescript
// src/lib/config.ts
export const USE_CORE_SERVICES = process.env.USE_CORE_SERVICES === 'true';
export const USE_GYG_ADAPTER = process.env.USE_GYG_ADAPTER === 'true';
```

**In GYG routes:**
```typescript
// src/app/api/1/reserve/route.ts
import { USE_CORE_SERVICES } from '@/lib/config';
import { createReservation } from '@/lib/core/reservations';
import { createGygReservationLegacy } from '@/lib/gyg/legacy';

export async function POST(req: NextRequest) {
  if (USE_CORE_SERVICES) {
    // New code path
    return createReservation(req);
  } else {
    // Old code path (unchanged)
    return createGygReservationLegacy(req);
  }
}
```

**Deployment strategy:**
1. Deploy with `USE_CORE_SERVICES=false` (default)
2. Test new code path in staging
3. Set `USE_CORE_SERVICES=true` in production
4. Monitor for errors
5. If errors, set `USE_CORE_SERVICES=false` to revert

### Strategy 4: Shadow Mode

**Run new code in parallel with old code, compare results:**

```typescript
// src/app/api/1/reserve/route.ts
export async function POST(req: NextRequest) {
  // Clone request for shadow testing
  const shadowReq = req.clone();

  // Run old code path (production)
  const oldResult = await createGygReservationLegacy(req);

  // Run new code path (shadow, don't return)
  if (process.env.SHADOW_MODE === 'true') {
    createReservation(shadowReq)
      .then(newResult => {
        // Log differences
        if (JSON.stringify(oldResult) !== JSON.stringify(newResult)) {
          console.error('SHADOW MISMATCH', { oldResult, newResult });
        }
      })
      .catch(err => {
        console.error('SHADOW ERROR', err);
      });
  }

  return oldResult;
}
```

**Benefits:**
- Production uses old code (safe)
- New code runs in background, results compared
- No risk to production
- Can validate new code before switching

### Strategy 5: Comprehensive Testing

**Before refactoring GYG, ensure:**

1. **Unit tests for core services:**
   - `checkCapacity()` — various scenarios
   - `createReservation()` — with capacity checks
   - `convertReservation()` — and expiration
   - `createBooking()` — with and without reservation

2. **Integration tests for GYG flows:**
   - Reserve → Book flow
   - Cancel reservation
   - Cancel booking
   - Idempotency
   - Expiration
   - Capacity edge cases

3. **Contract testing with GYG:**
   - Use GYG's self-testing tool
   - Run all 47 tests that passed before
   - Ensure responses are identical

4. **Comparison testing:**
   - Run old code and new code with same inputs
   - Compare responses field-by-field
   - Log any differences

### Strategy 6: Rollback Plan

**If something breaks during GYG refactoring:**

1. **Immediate rollback (< 5 minutes):**
   ```bash
   # Set feature flag to use old code
   wrangler secret put USE_CORE_SERVICES
   # Enter: false
   ```

2. **Database rollback (if needed):**
   ```sql
   -- Remove new columns (data preserved in old columns)
   ALTER TABLE bookings DROP COLUMN IF EXISTS channel;
   ALTER TABLE bookings DROP COLUMN IF EXISTS channel_booking_reference;
   ALTER TABLE bookings DROP COLUMN IF EXISTS reservation_id;

   -- Drop new table (old table still exists)
   DROP TABLE IF EXISTS reservations;
   ```

3. **Code rollback:**
   ```bash
   git revert <commit-hash>
   git push origin main
   # Redeploy
   ```

### Strategy 7: Monitoring & Alerting

**Track key metrics before/during/after refactoring:**

| Metric | Baseline | Alert Threshold |
|--------|----------|-----------------|
| GYG API error rate | < 1% | > 2% |
| GYG API response time | < 1s | > 3s |
| GYG reservation success rate | > 99% | < 98% |
| GYG booking success rate | > 99% | < 98% |
| Capacity check accuracy | 100% | Any mismatch |

**Monitoring setup:**
```typescript
// src/lib/core/availability.ts
export async function checkCapacity(...) {
  const start = Date.now();

  try {
    // ... existing logic
  } catch (error) {
    // Track errors
    metrics.increment('capacity_check.error');
    throw error;
  } finally {
    // Track response time
    metrics.histogram('capacity_check.duration', Date.now() - start);
  }
}
```

### Strategy 8: Documentation

**Document everything for safe rollback:**

1. **Migration steps:**
   - Step 1: Run migration 017_add_reservations_table.sql
   - Step 2: Verify row counts
   - Step 3: Run migration 018_add_channel_to_bookings.sql
   - Step 4: Verify columns added

2. **Rollback steps:**
   - Step 1: Set USE_CORE_SERVICES=false
   - Step 2: Redeploy
   - Step 3: If database changes needed, run rollback migrations

3. **Verification checklist:**
   - [ ] All GYG endpoints return same responses
   - [ ] All GYG tests pass
   - [ ] No increase in error rates
   - [ ] No increase in response times

### Strategy 9: Branch-Based Development

**Use git branches for safe development:**

```
main (production)
  └── feature/core-services (build core, no GYG changes)
       └── feature/viator-adapter (build Viator, no GYG changes)
            └── feature/gyg-refactor (refactor GYG to use core)
                 └── feature/gyg-cleanup (remove old code)
```

**Each branch:**
- Builds on previous branch
- Has its own tests
- Requires PR review
- Can be reverted independently

### Strategy 10: Go-Live Checklist

**Before switching GYG to new code:**

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] GYG contract tests pass (47/47)
- [ ] Shadow mode shows no mismatches
- [ ] Staging environment tested
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured
- [ ] Team notified of change window
- [ ] Feature flag ready to toggle

**During go-live:**
- [ ] Toggle feature flag
- [ ] Monitor error rates for 15 minutes
- [ ] Monitor response times for 15 minutes
- [ ] Check GYG dashboard for any issues
- [ ] Verify bookings are being created correctly

**After go-live (1 week):**
- [ ] No increase in error rates
- [ ] No increase in response times
- [ ] All GYG tests still passing
- [ ] Ready to remove old code

### Summary

| Strategy | Purpose | Risk Level |
|----------|---------|------------|
| Staged rollout | Don't touch GYG until confident | Low |
| Non-destructive migrations | Preserve existing data | Low |
| Feature flags | Easy rollback | Low |
| Shadow mode | Validate without risk | Low |
| Comprehensive testing | Catch issues early | Low |
| Rollback plan | Quick recovery | Low |
| Monitoring | Detect issues fast | Low |
| Documentation | Safe execution | Low |
| Branch-based development | Isolate changes | Low |
| Go-live checklist | Verify before switching | Low |

**Bottom line:** We won't touch the existing GYG code or database until we're confident the new architecture works. The safest approach is to build Viator first, test it thoroughly, and only then refactor GYG.
