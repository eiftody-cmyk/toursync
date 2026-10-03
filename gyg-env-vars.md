# GetYourGuide Environment Variables for Cloudflare Workers

Set these as Worker secrets: `npx wrangler secret put <NAME>`.

**Do not commit real passwords here.** Use password manager / `wrangler secret`.
Values below are placeholders.

## GYG Integration (Required)

| Variable | Value | Notes |
|----------|-------|-------|
| `GYG_USERNAME` | `OsakaCastleWalkswithEdward` | For calling GYG's notify endpoint (outbound) |
| `GYG_PASSWORD` | `<set-in-secrets-manager>` | For calling GYG's notify endpoint (outbound) |
| `GYG_NOTIFY_URL` | `https://supplier-api.getyourguide.com/sandbox/1/notify-availability-update` | Sandbox for testing. Change to production URL when live |
| `GYG_INBOUND_USERNAME` | `ExperienceRelay` | GYG uses this to authenticate when calling YOUR endpoints |
| `GYG_INBOUND_PASSWORD` | `<set-in-secrets-manager>` | GYG uses this to authenticate when calling YOUR endpoints |

## How to Set

1. Run `npx wrangler secret put <NAME>` for each secret above
2. Verify with `npx wrangler secret list`
3. Redeploy after setting (`npm run deploy`)

## Testing

Once set, GYG will test by calling:
- `GET https://osakacastletours.com/1/get-availabilities/?productId=T-1221780&fromDateTime=...&toDateTime=...`
- `POST https://osakacastletours.com/1/reserve/`
- `POST https://osakacastletours.com/1/book/`
- `POST https://osakacastletours.com/1/cancel-reservation/`
- `POST https://osakacastletours.com/1/cancel-booking/`
