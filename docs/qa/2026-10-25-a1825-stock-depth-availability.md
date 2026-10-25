# QA — Stock depth provenance / Development A1825 (2026-10-25)

**Disposition: PARTIAL / BLOCKED — RELEASE HOLD.** PR #1311 is Draft. The candidate implements a truthful unavailable-depth state; it does not implement a real executable orderbook.

## Source and isolation
- Start/mid/pre-integration remote main: `1c5b84a1c45baafcca83f375a6f99698121e9bb5` (unchanged). Isolated worktree `a-stock-depth-truth-1825`, branch `auto/hourly-a-stock-depth-truth-20261025-1825`, code SHA `2e65d12c73df7bbf45da238334fd80575da4b764`.
- Canonical main `AGENTS.md`, `README.md`, `docs/planning/PROJECT_PLAN.md`/`.ko.md` and `INTEGRATED_PLANNING_MASTER.md`/`.ko.md` re-read. No root-level project plans. P1 #1273 source-backed synthetic depth; C #1272 modifies `stock-orderbook.tsx`, which this branch deliberately does not touch.
- Remote branches: 173 at start, 174 after new branch; 173 non-main all contain unique unmerged commits; 0 identical trees, 0 deletable. Open PRs: 169 -> 170; 3 conflicting (#1107, #1110, #1143) preserved. All unmerged and Gemini/other worker changes protected.

## Implementation / provenance
- `StockDepthController`: public GET `/api/v1/stocks/:id/depth`, UUID validation, stock existence from existing DB-backed `stock_market_overview()` catalogue via `StockService.list()`. Returns only `UNAVAILABLE`, `NO_VERIFIED_OPEN_ORDERS`, empty bids/asks; unknown stock 404, unavailable service 503, DB failure propagates, no-store.
- Stock detail SSR fetches the status; verified no-depth state is shown as an accessible notice with the actual listed quote. Failure is a distinct alert; synthetic bid/ask volume, pressure, spread, recent trades and clickable fabricated ladder no longer mount in the live stock detail console. Removed the separate quick-orderbook simulator and misleading 10-depth SEO claim. Manual order UI remains separate; no claim of actual liquidity.
- Android `/app-api/v1/stocks/:id/depth` forwards the backend response and no-store headers. No DB schema or ledger mutation, no direct app DML or monetary precision conversion.

## RED / GREEN and required gates
- RED observed: backend 3 missing-method assertions; frontend new component missing. GREEN: backend 4 PASS, frontend+Android 14 PASS. Exact code SHA checks: shared contract 38 PASS, database 15 PASS/3 SKIP, backend 1,316 PASS/398 SKIP, frontend 1,401 PASS/6 FAIL. The six failures are SEO 3, login accessibility 1, calculator registration CTA 1, admin M2 telemetry 1; these exist on main and are tracked by QA #1306. Android contract generation/check PASS.
- Typecheck PASS; lint PASS (0 errors, 1,130 warnings); backend/frontend build PASS.
- Production dependencies audit **FAIL** (2 High). Full dependency audit **FAIL** (2 Critical, 10 High; 26 total). No exemption applied.
- Real isolated PostgreSQL 17 test container, `woldeok_moneyverse_ci` (214 applied migrations), read-only `BEGIN`, `SET LOCAL ROLE moneyverse_app`, 3 stocks from `stock_market_overview()`, private stock trades direct SELECT=false, ledger postings UPDATE=false; `ROLLBACK`. This is not a successful official Test exact-SHA authenticated E2E. No writes to the production-connected port 5433.
- GitHub CI and Test Candidate not counted PASS until complete. Official Test exact-SHA backend/API/DB/auth/user-flow and authorized GitOps release gate are **BLOCKED**. Production RELEASE HOLD. No merge, rollout, restart, migration, WLD mutation or branch deletion.

## Rollback and remaining work
- Rollback candidate code by reverting PR #1311; no database rollback required. Do not use this rollback to re-enable fabricated liquidity: a verified depth source and safe fallback are prerequisites.
- Follow-up P1 #1273 remains open for actual persisted orderbook depth, ownership/executable order proof, verified socket feed, isolated PostgreSQL/HTTP E2E and full release gates.
- Evidence: `/srv/moneyverse-data/a1825-*-focused.log`, `a1825-full-test.log`, `a1825-typecheck.log`, `a1825-lint.log`, `a1825-build.log`, `a1825-audit-{prod,full}.log`, `a1825-postgresql-acl.log`; branch worklog.
