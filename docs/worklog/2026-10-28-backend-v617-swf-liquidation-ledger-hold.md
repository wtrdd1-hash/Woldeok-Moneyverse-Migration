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

### Integration checkpoint — 22:46 KST
- QA v1350: main stable, +18,000 WLD balance projection drift, 5 applied migration checksum mismatches, 20 unapplied, 235/243 app-role DML grants, data disk 98%, Test exact-SHA and authenticated finance E2E missing.
- Prior Draft #1265 (closed without merge during the mass PR closure) already proposed an internal SWF liquidation hold. This run restores the missing main-line containment with an additional actual HTTP 503 test and aligns its error code with #1265/#1245: `SWF_LEDGER_SETTLEMENT_UNAVAILABLE`. Neither closed branch is deleted or overwritten. The unmerged B v616 coupon hold edits an earlier region of the same service; integration must reconcile both.
- Focused TDD: 4/4 RED on base, then 5/5 GREEN including HTTP. Backend suite 1944 PASS / 440 SKIPPED on implementation checkpoint; DB package 46 PASS / 4 SKIPPED; API 180 endpoint artifacts matched; OpenAPI 9 PASS; policy/security 23 PASS; full workspace typecheck PASS; root lint 0 errors / 1099 warnings; backend build PASS.
- `pnpm audit --prod` FAIL: `qs@6.16.0` Moderate (patched >=6.16.1; QA Draft #1687 already owns remediation). Do not duplicate that PR.
- Initial typecheck failure was an incomplete isolated worktree node_modules link; repaired only this worktree links, then full typecheck passed. Initial ad-hoc check-secrets command was not present in this repository; actual root security test suite passed.
- Real isolated PostgreSQL, full Frontend/Next.js build, authenticated app-api/E2E and official Test exact-SHA NOT RUN / BLOCKED due 98% shared disk, release preconditions and existing QA findings. No release or Production mutation.
- Required UI coordination: admin SWF liquidation must display explicit unavailable/hold state rather than claim success. Existing closed #1245 had proposed the web proxy/UI hold, not merged; A/C should integrate or replace it before claiming complete user flow.
