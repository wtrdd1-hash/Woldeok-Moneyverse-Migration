# v2026.09.14.85 — Preserve stock intent when creating alerts

- Fixed the stock-detail → conditional-alert handoff so `?stock=SYMBOL` preselects the referenced virtual stock.
- Symbol matching is case-insensitive, trims whitespace, accepts repeated query parameters by using the first value, and safely ignores unknown symbols.
- Existing server-evaluated alert conditions, cooldowns, WLD integer-string thresholds, API contracts, and database schema are unchanged.
- Added focused regression coverage for alert deep-link resolution.
- Production promotion remains gated on CI plus isolated Test exact-SHA verification.
