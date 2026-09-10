# Apple Pay & Google Pay Setup Notes

## Current Status (as of Sep 2026)
- Google Pay: Works in sandbox ✅
- Apple Pay: Domain file deployed, not provisioned ❌
- Production: Account not provisioned for either ❌

## What to Ask PayPal Support

Call: **1-888-221-1161** (PayPal Business Support)

### Script:
> "I need to enable Expanded Checkout on my business account so I can accept Apple Pay and Google Pay on my website. My account shows 'not provisioned' in the Developer Dashboard. Can you provision my account for Apple Pay and Google Pay?"

### Follow-up questions:
1. "Do I need to complete any additional business verification?"
2. "Is there a specific onboarding process I need to complete?"
3. "Once provisioned, how do I register my domain for Apple Pay?"

### Your account details:
- Business type: Corporate
- Primary email: edward@osakacastletours.com
- Website: osakacastletours.com
- Live Client ID: Abg1QYF6QoF1HzMkLGYDCj2GcV9sju-maZDEZmxEVs17oVpysCC8dZMxVAOQ6lGr2IXWl4BBuQGTBeSY
- Merchant ID: XJ3WTELBFU9W2

## After Provisioning - Steps to Enable

### 1. Enable in Developer Dashboard
- Go to https://developer.paypal.com (Live mode)
- Apps & Credentials → your app
- Features → check Apple Pay checkbox → Save
- Features → check Google Pay checkbox → Save

### 2. Register Domain (Apple Pay only)
- In your app, find Apple Pay section → click Manage
- Add Domain → enter `osakacastletours.com` → Register Domain
- Domain file already deployed at: `https://osakacastletours.com/.well-known/apple-developer-merchantid-domain-association`

### 3. Switch to Production
```bash
echo "live" | npx wrangler secret put PAYPAL_MODE
npm run deploy
```

### 4. Test
- Apple Pay: Open on iPhone/Safari → checkout page → Apple Pay button should appear
- Google Pay: Open on any browser → checkout page → Google Pay button should appear

## Domain Association File
- Current file is sandbox version
- Need to replace with live version after provisioning
- Download from: https://paypalobjects.com/devdoc/apple-pay/well-known/apple-developer-merchantid-domain-association
- Host at: `/.well-known/apple-developer-merchantid-domain-association`

## Code Changes Needed (when ready)
- Re-add `PayPalPaymentV6.tsx` component
- Re-add Google Pay script tags to booking pages
- Re-add `paypalMode` prop to booking pages
- The v6 SDK handles Apple Pay and Google Pay internally
