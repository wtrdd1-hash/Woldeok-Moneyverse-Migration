# Backend B v561 — Stock League Copy-Trading Ledger Hold

## Before work — 2026-10-26 19:35 KST
- Baseline main: `1c5b84a1c45baafcca83f375a6f99698121e9bb5` (fetched and verified).
- Branch: `auto/hourly-b-copy-trading-ledger-hold-v561-20261026-1935` in an independent worktree.
- Scope: P1 issue #1169. The NestJS copy-trade subscribe route and repository currently record an active subscription without authoritative ledger reservation/execution receipts. The cancel path decrements follower counts on repeated calls, including already cancelled rows, in separate SQL statements.
- Coordination: frontend hold PR #1168 and related QA PR #1412 remain separate; no other worktrees/branches will be changed.
- Plan: (1) write RED regression tests for controller/repository subscription denial and atomic idempotent cancellation; (2) implement fail-closed 503 with repository guard, and single-statement cancellation; (3) run tests, lint, typecheck, build, security and isolated PostgreSQL where feasible; (4) inspect updated main and CI; (5) create Draft PR only, with all unresolved gates.
- Invariants: no WLD balance/ledger mutation; do not activate copied trading, fabricate receipts, or change API route names; retain auth/consent/CSRF guards; preserve cancellation for existing subscriptions.
- Release gate: HOLD until real ledger-backed implementation, full CI and exact-SHA Test authentication/finance E2E.

## In progress
- Pending RED/GREEN evidence.

## Finished
- Pending final SHA and verification.

### TDD checkpoint — 19:36 KST
- RED: 4/4 new regression cases failed against baseline. Direct subscribe queried balance; controller returned success; cancel executed two statements and repeated cancellation returned success.
- GREEN candidate: NestJS subscribe returns 503 `COPY_TRADING_LEDGER_UNAVAILABLE` without repository access; direct repository subscribe rejects before SQL; legacy cancellation uses one writable CTE with `status='active'` and conditional follower decrement.

### Mid-run — 2026-10-26 19:37–19:44 KST
- Re-fetched main; still `1c5b84a1c45baafcca83f375a6f99698121e9bb5`. EN/KO plan file hashes unchanged. Open frontend Draft #1168 still holds copy-trading gateways; QA Draft #1412 has passing checks but is not merged.
- Preserved legacy `StockLeagueInputError` input validation after two old tests initially failed. Final focused tests 10/10 PASS, including session/authenticated/consent/CSRF guard metadata.
- Isolated PostgreSQL 17.11 (no network, no exposed port, temporary storage): 100 concurrent cancellation SQL executions => 1 `cancelled=true`, 99 `cancelled=false`; one subscription becomes cancelled and follower_count 1 -> 0. A forced follower update constraint failure returned SQL error and preserved both original rows (`active:1`). Fixture container removed.
- Initial frontend build failed only because a linked dependency tree resolved outside Turbopack's worktree root. Replaced this worktree's dependency symlinks with an offline frozen-lockfile install; subsequent complete builds PASS. No other worktree was modified.

## Finished — 2026-10-26 19:48 KST
- **Scope:** Actual Backend source changed: `stock-league.controller.ts`, `stock-league.repository.ts`; new regression test `stock-league.copy-trading-hold.test.ts`. No DB migration or money movement.
- **API contract:** Existing guarded `POST /stocks/league/copy-trade/subscribe` now fails with HTTP 503 and `COPY_TRADING_LEDGER_UNAVAILABLE` instead of reporting a live subscription. Existing `POST /stocks/league/copy-trade/cancel` remains available to authorized members and returns `cancelled=false` on repeat/no-active-subscription; DB status/follower count update is atomic.
- **Unit/integration:** focused 10 PASS; Backend 1,318 PASS / 398 SKIPPED; Contract 38 PASS; DB package 15 PASS / 3 SKIPPED; 179 mobile API contract endpoints generated and checked.
- **Build and quality:** full typecheck PASS; lint PASS with 0 errors and 1,132 warnings; full production build PASS; repository security, control-byte and Prisma migration guards PASS; bot tests 8 PASS.
- **Blocking failures:** full `pnpm test` FAIL with 6 existing Frontend tests (SEO 3, login mobile touch 1, calculator registration link 1, admin M2 text 1; Frontend 1,397 PASS / 6 FAIL). Production dependency audit FAIL: 2 High. Full audit FAIL: 2 Critical, 10 High, 11 Moderate, 3 Low.
- **Database limitation:** Isolated fixture exercised exact cancellation SQL, not complete project migration parity, app-role grants, or authenticated end-to-end copy-trading; no shared/live DB was changed. Backend hold does not revoke direct database DML. Existing browser cancellation route remains held by separate frontend PR #1168; coordinate a safe cancellation UX before claiming complete user flow.
- **Release:** Draft PR only. Official Test exact-SHA, authenticated core-user-flow/finance E2E, complete required CI and GitOps gates NOT PASS; main merge and Production deployment prohibited. No other branches/worktrees cleaned up.
- **Environment versions (read-only):** Test `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; Production `6a989b5ac0c6155587d43426d64f6def6b62c917`. Root disk 98% / 2.0 GiB free, data disk 88% / 25 GiB free.
- **Candidate branch:** `auto/hourly-b-copy-trading-ledger-hold-v561-20261026-1935`; final commit SHA is recorded in the PR and internal end log after push.
