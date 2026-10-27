# Backend B v585 — Stock halt settlement safety hold

## Before work (2026-10-27 16:35 KST)
- Starting origin/main: `c2a9306ddc0424438bc0ab297ea9543bb167aee6`; branch `auto/hourly-b-stock-halt-atomic-hold-v585-20261027-1635`.
- miniPC Debian 13.6 reachable; AGENTS, README, English/Korean project plans, open PRs, QA v1318 and CI reviewed.
- Source defect: `PostgresStockRepository.halt` executes `stock_halt_and_settle` (ledger mutation) and then separately invokes `treasury_fund_stock_halt` (vault debit) with catch-and-ignore. Replaying a completed halt returns prior total and debits treasury again. There is no immutable idempotent funding receipt or atomic SQL boundary.
- P0 containment goal: deny all backend stock-halt and retry mutations before SQL until a forward-only, ledger-atomic, replay-safe funding implementation and exact-SHA Test acceptance exist. Preserve read-only halt status and receipts. Admin UI must not claim that settlement succeeded.

## In progress
- [x] RED regression reproduces unsafe call and replay.
- [x] Backend fail-closed 503 before any DB query; both halt/retry share repository method.
- [x] Frontend disable action and show explicit hold notice; do not claim settlement.
- [x] Focused tests, full gates, isolated PostgreSQL checks and GitHub CI.

## Finished
- Pending; no merge or deployment authorized.

## In progress — reproduced and contained
- RED: 3 backend tests showed first halt/retries returning successful settled totals instead of refusing, proving unsafe non-atomic SQL path reachable.
- GREEN: repository now refuses all halt/retry calls with HTTP 503 before any SQL; direct admin controller tests cover both routes and no queries. Read-only status/receipt methods unchanged.
- Frontend RED: dialog lacked financial hold warning and still exposed destructive submit; GREEN: dialog explains hold, removes submit and retry controls; status-unavailable no longer claims completed receipts. Next server actions also refuse without calling mutate.
- No DB migrations or real WLD/treasury changes.

## P0 issue and isolated PostgreSQL
- Source-backed defect issue: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1553. No claim of actual Production loss.
- Isolated PostgreSQL 17.11 (new temporary container, loopback-only port, no Production DB): 278 numbered migrations applied; real app-role negative checks for ledger INSERT and treasury UPDATE PASS; halt/retry 503 PASS; 11/11 focused tests PASS. Container removed.
- Local pre-final full test PASS (backend 1330 PASS/398 SKIPPED; frontend 1428 PASS; contract 38 PASS; database 15 PASS/3 SKIPPED), lint 0 errors/1132 existing warnings, default build PASS, typecheck PASS.
- Production dependency audit PASS; full pnpm audit FAIL (2 critical/8 high/11 moderate/3 low); Discord bot audit FAIL (1 critical/5 high). Bot tests PASS.
- Corrected repository security scripts all PASS. The first attempt used outdated .sh paths and exited 127; rerun using scripts/security/*.mjs passed.

## Finished — candidate verification and release HOLD
- Full final local typecheck PASS, lint PASS (0 errors, 1,132 warnings), default Turbopack build PASS, pnpm test PASS: backend 1,330 passed / 399 skipped; frontend 1,430 passed; contract 38 passed; DB package 15 passed / 3 skipped. Skips are not counted as passes.
- API contract 179 endpoints PASS; bot tests 8/8 PASS; repository security, control-byte, Prisma migration guard PASS. Production-only dependency audit PASS. Full pnpm audit FAIL: 2 critical / 8 high / 11 moderate / 3 low; Discord bot audit FAIL: 1 critical / 5 high.
- Real isolated PostgreSQL 17.11: 278 numbered migrations applied; app-role ledger INSERT and treasury UPDATE denied; 11 focused tests PASS. No Production-linked database writes.
- Both admin halt and retry return HTTP 503 before SQL. The admin UI disables mutation and explicitly explains the hold; existing read-only settlement status remains accessible.
- The SQL functions remain separately executable by privileged callers, and atomic idempotent funding is NOT implemented. The P0 issue tracks a forward-only migration, concurrency receipts and owner authorization; this PR is containment only.
- Main re-fetched during work and before PR: `c2a9306ddc0424438bc0ab297ea9543bb167aee6`, unchanged. English and Korean plans rechecked; latest planning v1364 is a separate unmerged Draft.
- GitHub CI and official Test exact-SHA auth/finance E2E are required before any merge. Existing Test identity has not been promoted to this candidate; Production is HOLD. No branch cleanup.
