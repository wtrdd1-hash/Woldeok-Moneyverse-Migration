# v2026.09.13.14 — Portfolio Analysis

- Added a member-only `/stocks/portfolio` analysis surface on top of the newest reconciled runtime chain.
- Reuses the authoritative `/api/v1/stocks/portfolio` contract instead of introducing duplicate holdings state.
- Calculates total valuation, cost basis, unrealized gain/loss, and per-holding allocation with `BigInt`/integer-string money arithmetic.
- Adds focused regression coverage for values above JavaScript's safe integer range, allocation math, empty portfolios, and malformed authoritative values.
- Adds a Portfolio entry to the virtual-stock tools navigation.
- No database migration, ledger mutation, holding mutation, price rule, recommendation engine, or economy-policy write is introduced.
- Baseline: Personal Dashboard PR #214 head `90fdeb47c5a5de95404a4e8778433db3080d0ad9`, already synchronized with `main` `e023c15927035d58b67b76d3765535adc1d2ded0`.
- Production remains blocked until CI and exact-SHA isolated Test validation succeed.
