# Plan: Add Apple Pay and Google Pay via PayPal SDK v6

## Diagnosis: What Went Wrong

**Attempt 1** (SDK v5 `enable-funding: "applepay,googlepay"`): Failed because v5 doesn't recognize these funding sources — they're not part of the v5 SDK API.

**Attempt 2** (SDK v6 migration): Partially worked but was reverted because:
1. **Payer email collection broken** — v6's `onApprove` doesn't provide `actions.order.get()`, so we lost `payerEmail`/`payerName`
2. **Google Pay showed but didn't work** — likely due to missing configuration for Japan
3. **External SDKs loaded separately** — Apple Pay SDK and Google Pay JS were loaded in `layout.tsx` but not properly integrated

## The Correct Architecture

```
osakacastletours.com/book
        │
        ├── Apple Pay ──┐
        ├── Google Pay ─┤
        ├── PayPal ─────┤
        └── Card ───────┤
                       ▼
                  PayPal API
                       │
                       ▼
                  Order capture
                       │
                       ▼
               Booking confirmed
```

All four payment methods feed into the same PayPal order/capture flow. No separate payment-processing logic.

## Core Sequence

1. Preserve working v5 checkout
2. Upgrade `@paypal/react-paypal-js`
3. Implement PayPal v6 using existing `clientId` (no client-token endpoint)
4. Move payer-data authority to server-side capture
5. Get ordinary PayPal + card working under v6
6. Add Google Pay
7. Add Apple Pay + domain verification
8. Test all four
9. Switch production

## Implementation Phases

### Phase A: Preserve + Prepare

**A.1 Keep v5 intact**
- Current `src/components/PayPalPayment.tsx` with v5 API stays as-is
- Do not modify until v6 passes complete sandbox regression test
- Current PayPal + Card checkout is working and takes real money

**A.2 Fix payer email collection (server-side authoritative)**
- Currently: payer email comes from client-side `actions.order.get()` (trust boundary concern)
- Fix: Extract payer email from server-side `captureOrder()` response
- The `captureResult` already contains `payer.email_address` — we're just not using it
- Make server-side capture the authoritative source (remove client-side payer extraction entirely)
- This fix applies to both v5 and v6

**A.3 Install SDK v6 package**
```bash
npm install @paypal/react-paypal-js@latest
```
- Current: `@paypal/react-paypal-js` ^10.4.0 (v5 API)
- The same package supports v6 via `@paypal/react-paypal-js/sdk-v6` import path

### Phase B: v6 PayPal Test Route

**B.1 Create `/book-v6` test route**
- Duplicate `/book` route structure to `/book-v6`
- Build v6 integration here, completely isolated from production
- Production `/book` remains untouched on v5

**B.2 Implement v6 PayPal provider**
- Use `PayPalProvider` from `@paypal/react-paypal-js/sdk-v6`
- Authentication: Use existing `clientId` (no client-token endpoint needed)
- Configure with `components: ["paypal-payments"]`

**B.3 Implement v6 PayPal button**
- Use `PayPalOneTimePaymentButton` component
- `createOrder` must return `{ orderId }` object (v6 requirement, not just string)
- Handle `onApprove` callback with server-side capture

**B.4 Verify server-side capture response**
- Confirm that server-side `captureOrder()` returns:
  - `payer.email_address`
  - `payer.name`
  - Transaction/order ID
  - Amount
  - Currency
  - Capture status
- Server-side capture is the authoritative source for payer data

**B.5 Test v6 PayPal flow**
- Create order → Approve → Server capture → Booking
- Verify booking is created correctly
- Verify emails are sent
- Run alongside v5 (`/book` vs `/book-v6`) to compare results

### Phase C: Google Pay

**C.1 Enable Google Pay in PayPal sandbox**
- Go to PayPal Developer Dashboard → Apps & Credentials
- Select sandbox app → Mobile and digital payments → Enable Google Pay

**C.2 Add Google Pay SDK to `src/app/layout.tsx`**
```tsx
<Script src="https://pay.google.com/gp/p/js/pay.js" strategy="lazyOnload" />
```

**C.3 Implement v6 Google Pay component**
- Use `GooglePayOneTimePaymentButton` from `@paypal/react-paypal-js/sdk-v6`
- Follow PayPal's current v6 Google Pay integration exactly
- Don't manually construct Google Pay requests — use PayPal's component
- Include Japan-specific `PAN_ONLY` as per PayPal's guidance
- Don't implement Google Pay API independently alongside PayPal's abstraction

**C.4 Test Google Pay flow**
- Google Pay → PayPal order → Capture → Booking
- Test in Chrome/Firefox/Safari
- Verify payment flows through PayPal correctly

### Phase D: Apple Pay

**D.1 Domain verification (test first)**
- Test `https://osakacastletours.com/.well-known/apple-developer-merchantid-domain-association` before client-side work
- Verify it returns the association file directly (no HTML, redirects, auth)
- GitHub Pages + Cloudflare setup needs careful testing

**D.2 Download domain association file**
- Sandbox: `https://paypalobjects.com/devdoc/apple-pay/sandbox/apple-developer-merchantid-domain-association`
- Production: `https://paypalobjects.com/devdoc/apple-pay/well-known/apple-developer-merchantid-domain-association`

**D.3 Host file at `/.well-known/apple-developer-merchantid-domain-association`**
- The file must be served from `osakacastletours.com`
- Currently: osakacastletours.com is served from GitHub Pages (osaka-timeline repo)
- Need to add the file to `osaka-timeline/.well-known/`

**D.4 Register domain with PayPal**
- POST to `https://api-m.sandbox.paypal.com/v1/customer/wallet-domains`
- Include `provider_type: "APPLE_PAY"` and `domain: { name: "osakacastletours.com" }`
- Requires PayPal Auth Assertion header

**D.5 Add Apple Pay SDK to `src/app/layout.tsx`**
```tsx
<Script src="https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js" strategy="lazyOnload" />
```

**D.6 Implement v6 Apple Pay component**
- Use `ApplePayOneTimePaymentButton` from `@paypal/react-paypal-js/sdk-v6`
- Follow PayPal's current Apple Pay integration — PayPal handles:
  - Eligibility checking
  - Apple Pay session creation
  - Merchant validation
  - Payment authorization/confirmation
- Do NOT independently reinvent merchant validation — use PayPal's integration

**D.7 Test Apple Pay flow**
- Need Apple sandbox account
- Test in Safari on iOS/macOS
- Verify domain association file is accessible
- Apple Pay → PayPal order → Capture → Booking

### Phase E: Production

**E.1 Full regression test**
- Test all 4 payment methods: PayPal / Card / Google Pay / Apple Pay
- Verify all produce exactly the same successful booking outcome
- Test across browsers/devices
- Verify approval/cancellation/error callbacks
- Verify eligibility checks
- Verify order capture
- Verify fulfillment (booking creation, emails)
- Verify webhooks and monitoring

**E.2 Switch production to v6**
- Only after complete sandbox regression test passes
- Move v6 from `/book-v6` to `/book`
- Keep v5 code in Git history for rollback

**E.3 Remove v5**
- Remove duplicate v5 implementation once confident
- Clean up test route

## Key Differences: v5 vs v6

| | SDK v5 (current) | SDK v6 (target) |
|---|---|---|
| Provider | `PayPalScriptProvider` | `PayPalProvider` |
| Authentication | `clientId` | `clientId` (same) |
| Buttons | `PayPalButtons` (single) | Individual components per method |
| `createOrder` return | `orderId` (string) | `{ orderId }` (object) |
| Payer info | `actions.order.get()` (client-side) | Server-side capture response (authoritative) |
| Eligibility | N/A | `useEligibleMethods()` hook |

## Risks and Mitigations

1. **Risk**: Breaking existing PayPal/Card flow
   - **Mitigation**: Keep v5 intact at `/book` until v6 passes complete sandbox regression test at `/book-v6`

2. **Risk**: Apple Pay domain verification fails
   - **Mitigation**: Test `.well-known` file before client-side work; ensure GitHub Pages serves the file correctly

3. **Risk**: Google Pay doesn't work in Japan
   - **Mitigation**: Follow PayPal's v6 Google Pay documentation exactly; include `PAN_ONLY` as per guidance

4. **Risk**: Payer email not captured
   - **Mitigation**: Server-side capture is authoritative source (already available but unused)

5. **Risk**: v6 migration introduces regressions
   - **Mitigation**: Build v6 on isolated test route; run both in parallel during testing
