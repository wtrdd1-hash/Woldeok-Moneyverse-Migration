# B v529 — SWF internal liquidation must fail closed

## Before work (2026-10-25 11:30 KST)
- Baseline main: `c9a868b1e622341e2daa8b936ddf0988eda9988e`; independent branch `auto/hourly-b-swf-internal-liquidation-hold-v529-20261025-1130`.
- Debian 13.6 confirmed; root `/` 100% used (356MiB free); separate data volume 51% used.
- Read AGENTS.md, README.md, English and Korean project plans; inspected open PRs, QA/release issues, recent CI. Related B #1245 protects HTTP entry only and is Draft. Do not modify its files or any other worktree.
- P0: `AutoSovereignWealthFundService.liquidateToTreasuryVault()` directly updates `system_treasury_vaults.balance_wld` and `treasury_swf_portfolios` without a DB-owned balanced ledger receipt; direct service invocations bypass controller-level hold.
- Scope: remove unsafe liquidation implementation and make the internal service method fail with HTTP 503 before any database or notification side effect. Preserve SWF read-only methods and all unrelated automation/finance code. No migration or live DB writes.
- Gates: TDD RED/GREEN, focused tests, lint/typecheck/build, CI, isolated real PostgreSQL and exact-SHA Test; never merge/promote without all required gates.

## In progress
- [x] RED regression test: 4/4 failed on main (TypeError after DB access, not 503)
- [x] Service-level fail-closed implementation: removed direct vault/portfolio writes and notification side effects
- [x] Rechecked main and EN/KO plans mid-run: main unchanged; #1245 only protects HTTP, no same-file overlap.
- [x] Focused SWF 13/13; backend 1317 PASS / 398 SKIPPED; DB package 15 PASS / 3 SKIPPED; API contract 179 PASS; backend build/typecheck PASS; frontend typecheck PASS; lint 0 errors; frontend tests 1397 PASS / 6 FAIL; production dependency audit 2 High.
- [ ] CI, exact-SHA isolated Test, authenticated E2E and Production release gates remain unverified.

## Finished
- Pending.
