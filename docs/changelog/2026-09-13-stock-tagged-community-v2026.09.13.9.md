# v2026.09.13.9 — Stock-tagged community first runtime slice

- Reconciled the latest `main` stock/community integrity specification with the newest Account Security Center runtime chain before development.
- Added an immutable PostgreSQL migration for stock-linked board context with a foreign key to active virtual stocks.
- Added an atomic stock-tagged board create path that preserves existing board APIs and idempotency.
- Added category, stance and position-disclosure inputs to the member composer; analysis posts require position disclosure in this first slice.
- Added public read support for board rows with optional stock context without changing legacy public board functions.
- No stock price, trade, ranking, recommendation or economy outcome is changed by community metadata.
- Production remains blocked until CI and exact-SHA isolated Test validation succeed.
