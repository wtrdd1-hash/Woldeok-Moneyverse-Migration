# v2026.10.29.1512 — Treasury service incident / validation log

## BEFORE WORK — 2026-10-29 22:19 KST
- User-directed scope: repair malfunctioning Treasury-related services; no fake financial success or unsupported ledger mutation.
- Source of truth: `docs/planning/PROJECT_PLAN.ko.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.ko.md`, `docs/planning/CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.ko.md`, `AGENTS.md`, v1401 audit, and treasury v633/v1159 notes.
- Started from fetched `origin/main` 0a4327f73e0d2d4dc5deb614a1bb9b8cb04ee6d2 in independent worktree; existing checkout has other agents' uncommitted work and is untouched.
- Production Nginx points to v1502 on 127.0.0.1:3564/3565, backend `/health`=HTTP 200, `/api/version` source c2129625aa66; this is NOT proof that Treasury money movement works.
- Historical findings: canonical Treasury funding / ledger links not independently reconciled, original public synthetic metrics were replaced with explicit unverified state in main, B v633 and C v1159 fail-closed revenue/expenditure work. Keep grants/dividends/donations/bonds/SWF fail-closed unless independently proven.
- Disk capacity: root 79%, second data disk 78%; do not alter others' workspaces. Authorization: existing app finance DML grants explicitly accepted; do not use that alone as release blocker.

## IN PROGRESS
- [ ] Compare current main and live production Treasury routes and inspect operational errors (read only).
- [ ] Isolate one reproducible defect and add a regression test; fix only a bounded contract without financial balance modification.
- [ ] Re-fetch main and integrated plan midway; test isolated source, backend health, no-store/auth contracts, and candidate test server where feasible.
- [ ] Write versioned internal/GitHub update, register PR and track CI / release evidence.

## FINISHED
- Pending verified outcome and deployment decision.

### RED checkpoint — 22:24 KST
- Verified two frontend regressions with local pinned-lockfile Vitest against exact branch: 12 passed, **2 failed as expected**.
- `AdminTreasuryPage`: a failed `/overview` hides separately valid `/swf` data; user cannot see independent SWF health.
- `TreasuryView`: null ledger response crashes on `.filter`, and the page currently supplies `[]` on API failure, silently misreporting an unavailable ledger as zero transactions.
- No production mutation or service restarts. Next step: preserve independent SWF rendering, explicitly display ledger unavailable state, keep verified-empty truth and auth/SEO behavior.

### MAIN advanced / GREEN and read-only production evidence — 22:30 KST
- Midpoint remote main advanced `0a4327f73` → `3a34fe170` (Telegram alerts v1511), with no overlap in changed source paths. The Treasury release number is reallocated to **v1512**, preserving the historical initial v1511 branch/checkpoint commits.
- GREEN: focused frontend tests 14 PASS (12 baseline + 2 regressions), `pnpm typecheck` PASS, ESLint on changed frontend files PASS, Next production frontend build PASS.
- Full repository lint FAIL due three preexisting `no-empty` rules in `frontend/src/components/stale-tab-notice.tsx` (outside Treasury scope). `api:contract:check` FAIL because generated mobile API contract and two schema-reference files drift from tracked sources (no Treasury API modifications). Build generated files reverted within this isolated worktree.
- Live Production public `/api/treasury/overview` HTTP 503 with explicit `PUBLIC_TREASURY_RECONCILIATION_PENDING` as designed; `/treasury` 200 with unverified disclosure. Production backend v1502 health/version HTTP 200. Anonymous admin route is not an authenticated end-to-end test.
- Production-connected PostgreSQL read-only BEGIN/ROLLBACK: 5 Treasury vaults, 552 historical Treasury ledger rows, **0/552 linked via `ledger_transaction_id` to canonical `ledger_transactions`**, 891 canonical transactions / 1829 postings; projected canonical TREASURY account 0 WLD vs legacy Treasury-vault sum 220,923,528 WLD. This difference is substantive and must not be repaired by invented entries. Original 18,000-WLD MINT source concern remains separately unresolved. No DB mutation executed.
- Latest hourly QA v1374 baseline also reports many preexisting Treasury/SWF backend test failures; focused frontend fix does not make historic movement safe.

### Release decisions
- Scope of patch: preserve separately verified SWF telemetry when overview fails, correctly represent unavailable audit-ledger reads rather than inventing empty transactions. Existing verified empty ledgers still render as empty. No new money-moving route, no schema migration, no switch changes.
- **Release HOLD** until full green source gates, exact-SHA isolated Test authenticated admin/mobile validation, finance provenance and zero-downtime Production release acceptance. No claim of full Treasury recovery or Production promotion.
- Full frontend test run, GitHub PR and final integration status: pending at this checkpoint.
