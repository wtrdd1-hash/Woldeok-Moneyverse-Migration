# Backend B v617 — SWF liquidation financial safety hold

## Before work — 2026-10-28 22:36 KST
- Base: `origin/main` `35971c600f25869c96f1c666d4b9f58927202730`; independent branch/worktree.
- Reviewed AGENTS, README, EN/KO project plans, QA v1350 evidence, recent A/C/QA/planning PRs, CI, and previous B v616.
- P0 candidate: `POST /api/v1/admin/treasury/swf/liquidate` delegates to `liquidateToTreasuryVault`, which updates portfolio valuation and `system_treasury_vaults.balance_wld` without canonical economy postings or a replay receipt. It bypasses the SWF autonomous runtime execution gate. No live misuse asserted.
- Do not touch DB, migrations, WLD balances, other worktrees, or production. Read-only SWF status stays available.

## Plan
- [ ] RED: add tests for service-level fail-closed, no DB connection, and HTTP 503 controller delegation.
- [ ] GREEN: remove direct portfolio/vault mutation path; return explicit typed 503 safety code.
- [ ] Run focused tests, backend test suite, typecheck, lint, backend build, security/CI as resources permit.
- [ ] Re-fetch main/plans; open Draft/HOLD PR and record exact-SHA validation and release blockers.

## In progress
- Initial source inspection complete. Existing direct vault credit and portfolio decrement are not canonical ledger settlement.

## Finished
- Pending verification. No merge or deployment authorized.

### TDD checkpoint — 22:38 KST
- RED: `vitest run src/admin/treasury/auto-swf-liquidation-hold.test.ts --maxWorkers=1` produced **4 expected failures** on main, including DB-client access before any safety gate and retained direct portfolio/vault SQL.
- GREEN: removed the manual liquidation implementation and replaced it with a typed `ServiceUnavailableException` (`SWF_LIQUIDATION_LEDGER_UNCERTIFIED`, HTTP 503). The endpoint propagates 503. **4/4 focused tests PASS**; neither a feature flag nor a caller can enable the old SQL path.
- Existing SWF read APIs and autonomous-cycle code are unchanged; the separate autonomous cycle still needs canonical ledger review. No live DB mutation or deploy.
