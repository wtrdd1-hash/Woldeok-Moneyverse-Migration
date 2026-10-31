# Member support conversation KST date search

Authenticated members can filter the **latest 100 owner-scoped support conversations** by last-message date, inclusive in Asia/Seoul, up to 366 days. The result is capped at 50 rows and can be combined with literal subject search, status, and oldest-first sorting. This is **not** an all-time archive search.

`GET /api/v1/support/threads?from=YYYY-MM-DD&to=YYYY-MM-DD` requires both dates and rejects invalid, duplicate or reversed values. The repository filters the existing `public.support_my_threads(actor,100)` result, never raw support tables. No migration or ledger mutation is required. The member page uses a keyboard-accessible GET form; Android `/app-api/v1/support/threads` verifies the returned owner-private date window and fails closed on invalid HTTP 200 responses. Both channels retain no-store/noindex protections.

**Release state:** candidate only. Full CI, exact-SHA isolated Test authenticated flow, production provenance, independent rollback and release gates must pass before merge or promotion. Disable by reverting the candidate commit or retaining the previous verified deployment; no data rollback is required.
