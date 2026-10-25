# P1 Stock depth availability truth — implementation plan

1. Verify backend stock list is database-backed and has no authoritative open-order depth read. Do not synthesize bids, asks, volume, spread or trade executions.
2. RED: add backend route tests for a known and unknown UUID and fail-closed repository errors; add frontend test for explicit unavailable state and no selectable synthetic depth; add Android gateway contract coverage.
3. GREEN: add public GET `/api/v1/stocks/:id/depth` returning `{status:'UNAVAILABLE', bids:[], asks:[], source:'NO_VERIFIED_OPEN_ORDERS'}` only for listed IDs, 404 otherwise. Reuse stock catalogue, no DB migration.
4. In stock trading console, replace rendered synthetic orderbook with a verified availability component driven by the server response, preserving real quoted price and manual orders. Never render `StockOrderbook` without an authoritative orderbook source. Update SEO text to avoid claiming 10-depth live orders.
5. Run unit, integration, app-api, typecheck, lint, build, audit, isolated PG ACL and official exact-SHA Test; only integrate if all mandatory gates pass. Rollback by reverting candidate commit, not by mutating ledger or schema.
