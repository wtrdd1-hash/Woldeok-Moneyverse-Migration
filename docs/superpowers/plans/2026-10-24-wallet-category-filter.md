# Wallet transaction category filter — implementation plan

Design: GET /api/v1/wallet?recent=50&category=transfer|bank|reward; no category means unchanged overview. Reject unknown category rather than silently displaying all. Map categories to a documented finite transaction type allowlist, use $3::text[] with ANY after owner scope and before ORDER/LIMIT. Existing PostgreSQL balances and ledger are read-only. The Next.js /wallet/activity page exposes a keyboard accessible GET form and shows the active selection; app-api forwards identical query and auth without caching.

1. Add RED backend validation, repository query parameter and service forwarding tests. Confirm failing baseline.
2. Implement minimal typed allowlist and owner-scoped parameterized SQL; ensure recentLimit is bounded and balances remain unfiltered.
3. Add RED frontend/activity and app-api parity tests, then add GET filter control and pass category to API.
4. Run focused tests and full gates, capture exact SHA, security findings, PostgreSQL read-only evidence; keep Draft PR if any required gate fails.
5. Re-fetch main and latest integrated plan; preserve every unmerged branch; no production changes.
