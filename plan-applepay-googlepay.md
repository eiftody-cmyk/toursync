# Plan: Add Apple Pay and Google Pay via PayPal SDK v6

## Diagnosis: What Went Wrong

**Attempt 1** (SDK v5 `enable-funding: "applepay,googlepay"`): Failed because v5 doesn't recognize these funding sources — they're not part of the v5 SDK API.

**Attempt 2** (SDK v6 migration): Partially worked but was reverted because:
1. **Payer email collection broken** — v6's `onApprove` doesn't provide `actions.order.get()`, so we lost `payerEmail`/`payerName`
2. **Google Pay showed but didn't work** — likely due to missing `allowedAuthMethods` override for Japan
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

## Implementation Steps

### Phase 1: Server-Side Changes

**1.1 Add client token endpoint** (`src/app/api/paypal/client-token/route.ts`)
- Generate a browser-safe client token from `PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET`
- SDK v6 requires `clientToken` (not `clientId`) for authentication
- Cache the token for 15 minutes (expires in 15 min)

**1.2 Fix payer email collection** (`src/app/api/paypal/capture-order/route.ts`)
- Currently: payer email comes from client-side `actions.order.get()` (trust boundary concern)
- Fix: Extract payer email from server-side `captureOrder()` response
- The `captureResult` already contains `payer.email_address` — we're just not using it
- Keep client-side extraction as fallback, but prefer server-side data

### Phase 2: Client-Side Changes

**2.1 Install SDK v6 package**
```bash
npm install @paypal/react-paypal-js@latest
```
- Current: `@paypal/react-paypal-js` ^10.4.0 (v5 API)
- The same package supports v6 via `@paypal/react-paypal-js/sdk-v6` import path

**2.2 Rewrite `src/components/PayPalPayment.tsx`**
- Replace `PayPalScriptProvider` with `PayPalProvider`
- Replace `PayPalButtons` with individual button components:
  - `ApplePayOneTimePaymentButton`
  - `GooglePayOneTimePaymentButton`
  - `PayPalOneTimePaymentButton`
  - `PayPalGuestPaymentButton` (for card)
- Use `useEligibleMethods()` to check which methods are available
- Fix `createOrder` to return `{ orderId }` object (v6 requirement)
- Handle `onApprove` callback for each payment method

**2.3 Add Apple Pay SDK to `src/app/layout.tsx`**
```tsx
<Script src="https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js" strategy="lazyOnload" />
```

**2.4 Add Google Pay SDK to `src/app/layout.tsx`**
```tsx
<Script src="https://pay.google.com/gp/p/js/pay.js" strategy="lazyOnload" />
```

### Phase 3: Apple Pay Domain Verification

**3.1 Download domain association file**
- Sandbox: `https://paypalobjects.com/devdoc/apple-pay/sandbox/apple-developer-merchantid-domain-association`
- Production: `https://paypalobjects.com/devdoc/apple-pay/well-known/apple-developer-merchantid-domain-association`

**3.2 Host file at `/.well-known/apple-developer-merchantid-domain-association`**
- The file must be served from `osakacastletours.com`
- Currently: osakacastletours.com is served from GitHub Pages (osaka-timeline repo)
- Need to add the file to `osaka-timeline/.well-known/`

**3.3 Register domain with PayPal**
- POST to `https://api-m.sandbox.paypal.com/v1/customer/wallet-domains`
- Include `provider_type: "APPLE_PAY"` and `domain: { name: "osakacastletours.com" }`
- Requires PayPal Auth Assertion header

### Phase 4: Google Pay Setup

**4.1 Enable Google Pay in PayPal sandbox**
- Go to PayPal Developer Dashboard → Apps & Credentials
- Select sandbox app → Mobile and digital payments → Enable Google Pay

**4.2 Override `allowedAuthMethods` for Japan**
```typescript
paymentDataRequest.allowedPaymentMethods[0].parameters.allowedAuthMethods = ['PAN_ONLY'];
```
- Required for Japan integration (Google Pay docs explicitly state this)

### Phase 5: Testing

**5.1 Apple Pay testing**
- Need Apple sandbox account
- Test in Safari on iOS/macOS
- Verify domain association file is accessible

**5.2 Google Pay testing**
- Add test card to Google Wallet
- Test in Chrome/Firefox/Safari
- Verify payment flows through PayPal

**5.3 End-to-end testing**
- Test all 4 payment methods
- Verify payer email is captured correctly
- Verify booking is created
- Verify emails are sent

## Key Differences: v5 vs v6

| | SDK v5 (current) | SDK v6 (target) |
|---|---|---|
| Provider | `PayPalScriptProvider` | `PayPalProvider` |
| Authentication | `clientId` | `clientToken` |
| Buttons | `PayPalButtons` (single) | Individual components per method |
| `createOrder` return | `orderId` (string) | `{ orderId }` (object) |
| Payer info | `actions.order.get()` | Server-side capture response |
| Eligibility | N/A | `useEligibleMethods()` hook |

## Risks and Mitigations

1. **Risk**: Apple Pay domain verification fails
   - **Mitigation**: Test in sandbox first; ensure GitHub Pages serves the file correctly

2. **Risk**: Google Pay doesn't work in Japan
   - **Mitigation**: Override `allowedAuthMethods` to `['PAN_ONLY']` as per Google docs

3. **Risk**: Payer email not captured for Apple Pay/Google Pay
   - **Mitigation**: Extract from server-side capture response (already available but unused)

4. **Risk**: Breaking existing PayPal/Card flow
   - **Mitigation**: Keep v5 as fallback; implement v6 incrementally

## Questions for You

1. **Apple Merchant ID**: Do you have an Apple Developer account, or do we need to create one?
2. **Google Pay business profile**: Have you already set up a Google Pay business profile?
3. **Testing priority**: Should we start with Google Pay (easier) or Apple Pay (requires domain verification)?
4. **Rollback plan**: Should we keep v5 code as a fallback, or fully replace with v6?
