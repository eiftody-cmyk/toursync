# GetYourGuide Environment Variables for Vercel

Set these in your Vercel project settings → Environment Variables.

## GYG Integration (Required)

| Variable | Value | Notes |
|----------|-------|-------|
| `GYG_USERNAME` | `OsakaCastleWalkswithEdward` | For calling GYG's notify endpoint (outbound) |
| `GYG_PASSWORD` | *(your password from GYG)* | For calling GYG's notify endpoint (outbound) |
| `GYG_NOTIFY_URL` | `https://supplier-api.getyourguide.com/sandbox/1/notify-availability-update` | Sandbox for testing. Change to production URL when live |
| `GYG_INBOUND_USERNAME` | `ExperienceRelay` | GYG uses this to authenticate when calling YOUR endpoints |
| `GYG_INBOUND_PASSWORD` | `P421105x#` | GYG uses this to authenticate when calling YOUR endpoints |

## How to Set

1. Go to https://vercel.com/edwardiftody-osaka-castle-walks-with-edward/toursync/settings/environment-variables
2. Add each variable above
3. Set scope to **Production** and **Preview**
4. Redeploy after setting

## Testing

Once set, GYG will test by calling:
- `GET https://toursync1.vercel.app/1/get-availabilities/?productId=T-1221780&fromDateTime=...&toDateTime=...`
- `POST https://toursync1.vercel.app/1/reserve/`
- `POST https://toursync1.vercel.app/1/book/`
- `POST https://toursync1.vercel.app/1/cancel-reservation/`
- `POST https://toursync1.vercel.app/1/cancel-booking/`
