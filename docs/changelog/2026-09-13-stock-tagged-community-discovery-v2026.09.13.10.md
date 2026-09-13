# v2026.09.13.10 — Stock-tagged Community Discovery

- Continued the P1 Stock-tagged Community runtime slice from the newest reconciled candidate after synchronizing current `main`.
- Added optional `stock` filtering to the public stock-community API with server-side symbol validation.
- Switched the public board index to the stock-aware read model so tagged posts expose their virtual-stock context without changing untagged posts.
- Added `/board?stock=<SYMBOL>` filtering, a visible active-filter state, a clear-filter action, and stock-symbol badges on tagged posts.
- Added focused backend regression coverage for valid stock filtering and malformed-symbol rejection before PostgreSQL access.
- No stock price, order, ranking, recommendation, wallet, ledger, or economy-policy behavior is changed.
- Candidate development branch: `feat/stock-tagged-community-discovery-v2026.09.13.10`.
- Production remains unchanged until full CI and isolated Test exact-SHA validation pass.
