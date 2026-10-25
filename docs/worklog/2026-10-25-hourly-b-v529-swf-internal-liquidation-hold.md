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

## Finished (2026-10-25 11:40 KST)
- Draft PR: #1265. Code commit: `8a6b8863d59bef90a36f79afeec5efe39c793dde`. Branch: `auto/hourly-b-swf-internal-liquidation-hold-v529-20261025-1130` (final branch HEAD may advance for this log).
- API contract: SWF internal liquidation and its existing controller path reject with HTTP 503 `SWF_LEDGER_SETTLEMENT_UNAVAILABLE`; no success or notification. No new endpoint. Read-only SWF functions unchanged.
- DB/migrations/ledger: no changes; old direct vault credit/portfolio update SQL removed from liquidation service. No real PostgreSQL or Production/dev DB writes.
- TDD: 4 RED on baseline; 4 GREEN on changed code. Focused SWF 13/13 PASS; backend 1,317 PASS / 398 SKIPPED; DB 15 PASS / 3 SKIPPED; API contract 179 PASS; backend/frontend typecheck PASS; backend build PASS; full ESLint 0 errors / 1,136 warnings; frontend tests 1,397 PASS / 6 FAIL; production dependency audit FAIL with 2 High (`body-parser`, `multer`).
- CI for code SHA: CI #40155203173 and Build Test Candidate #40155189864 still running at last inspection. Final candidate SHA must be checked separately; do not infer PASS from a workflow being started.
- Not executed/blocked: isolated real PostgreSQL least-privilege and ledger reconciliation; authenticated app-api/E2E; official Test exact-SHA, full frontend build (root filesystem 100%), Bot security audit, GitOps release gate. No release claim.
- Test public version: `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; Production: `6a989b5ac0c6155587d43426d64f6def6b62c917`. Neither is the candidate SHA. Production HOLD.
- Mid/final origin/main: `c9a868b1e622341e2daa8b936ddf0988eda9988e`, unchanged. EN/KO planning documents revisited. Related #1245 is controller/gateway/UI only; issue #1164 and PR #1245 received coordination notes.
- Other A/C/QA/Gemini branches/worktrees and all reservations untouched; no branch cleanup, no main merge, no deployment. Final classification: PARTIAL / BLOCKED, not a completed ledger settlement.
