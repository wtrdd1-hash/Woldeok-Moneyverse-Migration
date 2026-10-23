# Backend B v481 — change summary

- Scope: privacy-preserving SEO crawler status (Backend and Next.js BFF).
- Public GET /api/v1/seo/status: eight aggregate fields, canonical bot/status distribution labels; never expose individual logs, IP addresses, user agents or IndexNow key.
- Public GET /api/seo/status: reject malformed or unsafe aggregate payloads with HTTP 502 and no-store; return 503 on upstream outage rather than invented metrics.
- Admin GET /api/v1/seo/status/admin: existing session, authenticated, consent, admin role and admin-session guards. Frontend admin BFF verifies operator session.
- DB schema/migrations/ledger: unchanged.
- Verification: focused regression cases added; exact SHA CI, PostgreSQL, authenticated E2E and Test gates pending. Draft only; do not merge or deploy.
