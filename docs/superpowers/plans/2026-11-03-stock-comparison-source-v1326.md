# C v1326 — Stock comparison source verification plan

1. Reproduce invalid `/api/v1/stocks` response acceptance with failing Vitest parser and server page tests.
2. Add strict runtime parser for bounded, unique, integer-string market rows. Preserve BigInt precision and reject whole unverified response rather than silently dropping bad stocks.
3. Render verified-empty separately from unavailable, with accessible retry; do not change comparison selection behavior.
4. Apply member-only private/no-store, noindex/nofollow, no-referrer headers on direct and supported locale routes; test policy and isolated HTTP.
5. Verify existing Nest stock list contract and PostgreSQL SECURITY DEFINER ACL in an isolated database if possible; run exact-HEAD workspace gates and E2E; record every failure and do not merge/deploy on incomplete gates.
