# Personalized FROM Address — Option A (Per-Operator Domain Verification)

## Overview
Each Experiencerelay operator verifies their own domain in Resend. Emails are sent from their domain, not from Experiencerelay's.

## Benefits
- Better deliverability (emails come from operator's domain)
- Operator branding (customers see the operator's name/domain)
- No shared reputation risk between operators

## Operator Setup Steps (Required)

### 1. Create a Resend Account
- Go to https://resend.com and sign up
- Choose the **free tier** (100 emails/day, 3,000/month)

### 2. Add and Verify Domain
- Go to https://resend.com/domains → Add Domain
- Enter their domain (e.g., `osakacastletours.com`)
- Resend provides DNS records to add:
  - **DKIM:** `resend._domainkey` → TXT record
  - **SPF:** `send` → MX record + TXT record
  - **Return-Path:** `send` → CNAME record
- Add these records in their DNS provider (Cloudflare, Namecheap, etc.)
- Wait for verification (usually 5-15 minutes)

### 3. Generate API Key
- Go to https://resend.com/api-keys → Create API Key
- Name it (e.g., "ExperienceRelay")
- Copy the key (starts with `re_`)

### 4. Enter in ExperienceRelay Dashboard
- Go to Settings → Email Configuration
- Enter:
  - **Resend API Key:** `re_...`
  - **From Name:** Their company name (e.g., "Osaka Castle Walks with Edward")
  - **From Email:** `noreply@their-domain.com`

## Technical Implementation

### Database Changes
Add to `profiles` table:
```sql
ALTER TABLE profiles ADD COLUMN resend_api_key text;
ALTER TABLE profiles ADD COLUMN from_name text;
ALTER TABLE profiles ADD COLUMN from_email text;
```

### Code Changes
1. **`src/lib/email/client.ts`** — Make `sendEmail()` accept `from` parameter:
   ```ts
   export async function sendEmail({ to, subject, html, from }: SendEmailParams & { from?: string })
   ```

2. **`src/app/api/paypal/capture-order/route.ts`** — Look up operator's Resend credentials before sending:
   ```ts
   const { data: profile } = await supabase
     .from("profiles")
     .select("resend_api_key, from_name, from_email")
     .eq("id", tour.user_id)
     .single();
   
   const resend = new Resend(profile.resend_api_key);
   await resend.emails.send({
     from: `${profile.from_name} <${profile.from_email}>`,
     to: payerEmail,
     ...
   });
   ```

3. **`src/components/settings/EmailConfigCard.tsx`** — Add settings UI for operators to enter their Resend credentials

### Important Notes
- Operators must have a verified domain before emails will work
- The `send` subdomain approach (`send.theirdomain.com`) is recommended for better deliverability
- Operators should use `noreply@send.theirdomain.com` or `bookings@send.theirdomain.com`
- The API key is sensitive — store it encrypted or as a Cloudflare secret per operator

## Current State (osakacastletours.com)
- Domain: `osakacastletours.com` verified in Resend
- FROM: `Osaka Castle Walks with Edward <noreply@osakacastletours.com>`
- API Key: Stored as `RESEND_API_KEY` in Cloudflare secrets
- Status: Working (403 errors were due to using unverified `send` subdomain)
