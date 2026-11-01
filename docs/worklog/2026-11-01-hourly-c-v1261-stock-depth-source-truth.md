# C v1261 — Stock depth and trade source truth

## BEFORE WORK — 2026-11-01 13:46 KST
- Debian 13.6 miniPC seven services active; development PostgreSQL connected.
- Base `origin/main` `f13bbce273ffc65e8576170992d82ea00c27a1c9`; separate `auto/hourly-c-stock-depth-truth-v1261-20261101-1346` worktree. Existing root `implementation_plan.md` modification left untouched.
- Read `AGENTS.md`, README, Korean README, both planning master documents; checked active PRs, QA/A/B and recent CI. No active PR specifically covers synthetic stock orderbook and trade ticks.
- Evidence: `stock-orderbook.tsx` fabricates bid/ask volume, spread, intensity, recent executions from current price; `stock-market-toast.tsx` creates random trade notifications. `MarketBroadcast.publishOrderbook` has only test callers, no verified live producer.
- Security: never present generated volumes/trades as recorded orders; keep existing real stock trade API unchanged, do not touch ledgers or database grants.

## PLAN
- [x] RED: tests require an explicit unavailable depth contract and no synthetic rows, fake trades, or order entry based on fabricated quotes.
- [x] GREEN: NestJS 503 orderbook read contract; Next.js fail-closed read proxy; accessible responsive frontend showing quote-only with source status. Remove simulated trade toast.
- [ ] Verify: targeted frontend/backend/route tests; full lint, typecheck, build, unit, integration, app-api, isolated PostgreSQL, security, E2E/CI as feasible.
- [ ] Re-fetch main and plan, record exact SHA; draft PR only if blocked, no merge or deployment without all gates.

## IN PROGRESS — 2026-11-01 13:50 KST
- Worktree initialized; no production/Test changes.
- RED confirmed: backend `orderbook` method absent (1 failed / 55 passed); frontend depth role absent in standalone test (1 failed). Initial frontend run without `NODE_ENV=test` was invalid and rerun with the correct environment.
- GREEN implementation: Nest GET `/stocks/:id/orderbook` rejects unverified depth 503; Next proxy rejects missing/malformed/legacy upstream data and enforces private/noindex/no-referrer; UI displays quote-only, no synthetic volumes/pressure/recent trades; removed random trade toast.
- Backend focused controller 56/56 PASS. Frontend focused 14/15 PASS before quote grouping correction; latest rerun BLOCKED by `esbuild` service termination under simultaneous A/B lint/build pressure (memory available 603-780 MiB). Never terminate other workers.
- Mid-run fetch: origin/main advanced from `f13bbce27` to `561b78e74` via QA storage maintenance #2321, no overlapping source files; rebase before PR. Master planning docs unchanged in main.


## FINISHED
- Pending evidence.
