# Reminders

## 🔑 Rotate GYG passwords — AFTER API integration is finished

**Status:** pending  
**Trigger:** GYG API integration / live testing fully done and working  
**Why:** passwords were once committed to git (docs scrubbed; still in history)

**When the trigger hits:**
1. Change passwords in the GYG supplier portal
2. Update secrets: `wrangler secret put GYG_PASSWORD`, `GYG_INBOUND_PASSWORD`, `GYG_PROD_PASSWORD` (and Vercel/env if used)
3. Optional later: purge old values from git history with `git-filter-repo`

Related: see STATUS.md → Next Move / REMINDERS.
