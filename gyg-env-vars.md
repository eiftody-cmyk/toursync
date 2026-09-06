# GetYourGuide Environment Variables for Vercel

Set these in your Vercel project settings → Environment Variables.

## GYG Integration (Required)

| Variable | Value | Notes |
|----------|-------|-------|
| `GYG_USERNAME` | `OsakaCastleWalkswithEdward` | From GYG Integrator Portal |
| `GYG_PASSWORD` | *(your password from GYG)* | From GYG Integrator Portal |
| `GYG_NOTIFY_URL` | *(from Integrator Portal)* | GYG's notify availability endpoint URL |

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
