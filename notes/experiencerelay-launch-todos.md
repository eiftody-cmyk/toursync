# Experiencerelay Launch — To-Do List

## Before Launching to Other Users

### Critical (Must Have)

- [ ] **Per-operator PayPal credentials** — Store `paypal_client_id`, `paypal_client_secret`, `paypal_mode` in `profiles` table. Each operator connects their own PayPal account.
  - See: `notes/apple-pay-google-pay-setup.md` for PayPal provisioning notes
  - Code changes: `src/lib/paypal/client.ts`, `src/app/api/paypal/create-order/route.ts`, `src/app/api/paypal/capture-order/route.ts`

- [ ] **Per-operator email (Resend)** — Store `resend_api_key`, `from_name`, `from_email` in `profiles` table.
  - See: `notes/personalized-from-address.md` for full implementation guide
  - Code changes: `src/lib/email/client.ts`, capture-order route, operator notification route

- [ ] **Whitelabel booking page** — Replace hardcoded "Osaka Castle Walks with Edward" in `BookingPageClient.tsx` and `CustomBookingClient.tsx` with `companyName` and `logo_url` from operator profile.
  - Currently: Hardcoded strings in ~10 places
  - Fix: Use `companyName` prop (already fetched but ignored)

- [ ] **Stripe/PayPal payout split** — Currently all payments go to one PayPal account. Need to route payments to each operator's PayPal.
  - Option: PayPal Payouts API (batch payments)
  - Option: Each operator's own PayPal checkout (current approach — simplest)

### Important (Should Have)

- [ ] **Onboarding flow** — New operators need a guided setup:
  1. Create account (Supabase Auth)
  2. Set company name + logo
  3. Connect PayPal (enter credentials)
  4. Set up Resend (enter API key + verify domain)
  5. Create first tour
  6. Test booking flow

- [ ] **Settings page for operators** — Currently has Company Branding card. Need to add:
  - PayPal configuration card
  - Email configuration card (Resend API key, from address)
  - Website URL field
  - Phone number field

- [ ] **Tour data model** — Add fields:
  - `description` (rich text for tour page)
  - `duration_hours` (display on booking page)
  - `meeting_point` (text for customer instructions)
  - `cancellation_policy` (text for booking page)

- [ ] **Customer-facing booking page improvements**:
  - Show meeting point instructions after booking
  - Show cancellation policy on booking page
  - Add tour description to booking page
  - Show operator contact info

### Nice to Have

- [ ] **Google Pay / Apple Pay** — Re-enable when PayPal provisions account
  - See: `notes/apple-pay-google-pay-setup.md`

- [ ] **Multi-language support** — Japanese + English for Osaka market

- [ ] **Automated reminders** — Send reminder email 24h before tour

- [ ] **Review collection** — Post-tour email asking for Google/TripAdvisor review

- [ ] **Analytics dashboard** — Bookings over time, revenue, popular tours

- [ ] **Mobile app** — React Native or PWA for operators to manage on the go

### Infrastructure

- [ ] **Custom domains per operator** — Each operator gets `tours.theirdomain.com`
  - Cloudflare Workers route per operator
  - SSL certificates automatic via Cloudflare

- [ ] **Database backups** — Automated daily backups of Supabase

- [ ] **Monitoring** — Error tracking (Sentry), uptime monitoring

- [ ] **Rate limiting** — Prevent abuse on booking endpoints

- [ ] **GDPR compliance** — Data export, deletion requests, privacy policy

### Testing Checklist

Before each operator goes live:

- [ ] Create tour with correct pricing
- [ ] Book with PayPal (sandbox first, then live)
- [ ] Receive confirmation email (buyer + seller)
- [ ] Cancel booking (within 24h policy)
- [ ] Receive cancellation email
- [ ] Check manage page works (`/book/manage?id=...`)
- [ ] Check email lookup works (`/book/manage?email=...`)
- [ ] Verify calendar sync (Google Calendar)
- [ ] Test capacity management (auto-block when full)

### Documentation Needed

- [ ] **Operator guide** — How to set up tours, manage bookings, configure settings
- [ ] **API documentation** — For GYG/Viator/Airbnb integrations
- [ ] **Troubleshooting guide** — Common issues and fixes
- [ ] **Deployment guide** — How to deploy updates without downtime

### Current Status (osakacastletours.com)

✅ Working:
- PayPal checkout (live)
- Credit card payments
- Booking creation
- Confirmation emails (Resend)
- Operator notification emails
- Manage/cancel bookings
- Calendar sync (Google Calendar)
- Calendar (cancelled bookings hidden)
- Capacity management
- GYG inbound webhooks (testing passed, awaiting finalization)

❌ Not Working:
- Per-operator PayPal (single account)
- Per-operator emails (single Resend)
- Whitelabel booking page (hardcoded branding)
- Apple Pay / Google Pay (not provisioned)
