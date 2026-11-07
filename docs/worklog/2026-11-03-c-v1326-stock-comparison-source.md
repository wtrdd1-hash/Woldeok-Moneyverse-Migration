# C v1326 — Stock comparison source integrity

## START — 2026-11-03 08:19 KST
- Connected to Debian 13.6 miniPC; seven services active and development PostgreSQL connected. Root filesystem 97% used; preserve all other worktrees and avoid unnecessary build artifacts.
- Base `origin/main`: `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`. Original shared checkout is dirty; independent worktree created from fetched main.
- Reviewed AGENTS.md, README.md, README/README.ko.md, both canonical project plans, QA v1484, latest planning v1688, recent A/B/C work, open PRs and CI. No open stock-comparison source-validation PR identified; existing #2356 dashboard, #2427 watchlist, #2462 alerts and #2431 notification preference are out of scope.
- P1 evidence: `/stocks/compare` passes unvalidated `GET /api/v1/stocks` payload into client BigInt calculations; malformed numeric fields can crash comparison or masquerade as empty/valid data. Global SEO header indexes the member-only route despite noindex page metadata.
- Existing backend route `StockController.list` uses `StockService.list` -> `StockRepository.list` -> PostgreSQL `stock_market_overview()` SECURITY DEFINER; no new DB or financial writes needed.
- Stages: [ ] RED tests [ ] verified data UI + HTTP privacy [ ] focused GREEN [ ] full gates [ ] isolated PostgreSQL/HTTP [ ] main refetch + PR [ ] release gate decision.
- Never merge or promote without all required gates PASS; preserve A/B/Gemini/QA branches and five schedules.

## IN PROGRESS — RED/GREEN — 2026-11-03 08:20 KST
- TDD RED: 3 test suites failed as expected (missing parser, unverified comparison rendered, no member-only HTTP headers). Existing API data was not validated before BigInt calculations.
- Implemented bounded all-or-nothing source parser: PostgreSQL bigint integer strings (including >2^53), UUID, symbol/name, unique IDs/symbols and coherent high/low. Invalid/unavailable response never becomes verified empty; accessible retry displayed. Existing Nest stock list read path reused, no backend or DB writes.
- Applied direct and supported localized private/no-store, noindex/nofollow, no-referrer HTTP policies.
- Focused GREEN: 22/22 tests PASS in 3 suites. Re-fetched origin/main at midpoint; unchanged from initial base.
- Next: full exact-SHA gates, isolated PostgreSQL/HTTP and remote CI; no release without full proof.
