# Public Health Probe Evidence - 2026-11-25

- Captured at: 2026-11-25T00:25:48Z
- Method: read-only unauthenticated HTTPS HEAD-equivalent header retrieval using curl `-D - -o /dev/null`
- Safety: no cookie, authorization, request body, mutation, credential, or financial operation was sent

## Test

- URL: `https://test.easy-scraping.com/health`
- Result: `HTTP/2 404 `
- Selected headers:
- `content-type: text/html; charset=utf-8`
- `cache-control: private, no-cache, no-store, max-age=0, must-revalidate`
- `server: cloudflare`
- `x-moneyverse-test-frontend: next-v20261124`
- `x-robots-tag: noindex, nofollow, noarchive`

## Production comparison

- URL: `https://easy-scraping.com/health`
- Result: `HTTP/2 200 `
- Selected headers:
- `content-type: application/json`
- `cache-control: no-cache, no-store, max-age=0, must-revalidate`
- `server: cloudflare`

## Interpretation

This is a point-in-time public-edge observation only. It does not prove that the Test backend is absent, that Test and Production use different application SHAs, or that the documented Test release gate is invalid. An operator must verify the intended Test service path and exact SHA before any release decision.
