# Backend B v702 — P0 marketplace SQL settlement hold

## BEFORE — design and scope

- Baseline: origin/main at task start; QA v1424 confirmed Production `moneyverse_app` can invoke three unjournaled marketplace `SECURITY DEFINER` monetary functions and directly update account balances. Issue #2191. Previous B v701 protects the NestJS service only (Draft #2221), which is not a SQL-level barrier.
- Goal: forward-only SQL change that blocks the three unsafe functions for all callers, revokes application EXECUTE and direct balance/ledger mutations, without editing applied migration 232 or existing balances.
- Scope: one migration and regression tests. Preserve marketplace read/cancel functions, existing data and app SELECT rights; no settlement implementation or UI claim. SQLSTATE 55000 for explicitly held functions; 42501 for app-role EXECUTE denial.
- Alternatives: (1) controller-only 503 (bypassable), (2) EXECUTE revoke alone (migration owner can still call unsafe body), (3) **chosen** replace bodies with fail-closed and revoke grants plus direct DML. No SQL changes in Production this run.
- RED: new regression tests fail on main. GREEN: migration, focused tests, isolated PG17.11 replay, negative app-role privileges and positive read boundary. Then full gates/CI, exact-SHA Test if available.
- Release: Draft/HOLD, no merge or deployment until all required gates and independent Test attestation pass.

## IN PROGRESS

- [x] Write failing regression tests and observe RED.
- [x] Add forward migration and verify GREEN.
- [x] Validate isolated PostgreSQL and workspace gates; remote CI and release checks remain tracked below.

## FINISHED

- Initial code checkpoint `e3d941899f9847365d78731217c21b293151efff`; expanded ACL regression RED then GREEN on final branch head; baseline main `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`; origin/main unchanged at mid/final recheck.
- Focused regression 7 PASS; isolated PostgreSQL 17.11 replay 317 files PASS. Additional Production-like privilege-drift simulation: injected 36 app financial DML/DDL privileges and three app EXECUTE grants after migration 317, applied migration 318, then verified all removed; migrator function calls all SQLSTATE 55000. Both disposable containers removed.
- Local lint PASS (0 errors, 1,016 existing warnings), typecheck PASS, full build PASS, backend 2,944 PASS / 517 SKIP, database 69 PASS / 4 SKIP, contract 41 PASS, mobile API contract 184 PASS, security/release 22 PASS, production dependency audit PASS.
- Frontend first run exceeded 210-second single-worker budget (EXIT 124), then rerun with two workers 2,901 PASS / 0 FAIL (EXIT 0).
- Full dependency audit at low threshold FAIL: 9 advisories (8 moderate, 1 low); high threshold exit 0 does not override this.
- Remote CI classify/policy/runtime/verify-runtime passed on code SHA; build and final SHA CI pending at last checkpoint. No official Test exact-SHA deployment, authenticated cross-user E2E, independent restore or GitOps approval.
- Public Test `/api/version` still `bc8cd8a6...`, Production `/api/version` `353c6d5d...` (read-only 2026-11-01 00:55 KST), neither equals candidate. No main merge or Test/Production deployment.
- No API surface changes; marketplace monetary SQL functions now explicitly unavailable (55000 to privileged caller, 42501 to app role). Existing NestJS 503 hold is separate Draft #2221; coordinate UI unavailability with A/C. No historical reconciliation or direct SQL role grant cleanup beyond six listed tables.
- **Final decision: PARTIAL / RELEASE HOLD.** PR remains Draft. Never apply migration to shared environments without release review and exact-SHA Test verification.

### Checkpoint 1 — isolated implementation

- RED: 7/7 new tests failed before the migration. GREEN: 7/7 passed after migration 318.
- Disposable PostgreSQL 17.11: 317 migration files replayed; app-role 3 unsafe EXECUTE and 36 DML/DDL privileges denied; balance SELECT preserved; owner calls return SQLSTATE 55000. No shared DB changes.
- Full workspace and CI gates pending. RELEASE HOLD.

### Final ACL extension

- Fresh RED 1/7 exposed remaining Production app REFERENCES/TRIGGER grants on core financial tables. Migration 318 now revokes both in addition to INSERT/UPDATE/DELETE/TRUNCATE; GREEN 7/7. Synthetic broad-grant PG17.11 replay confirms 3 EXECUTE and 36 table privileges denied, balance SELECT preserved. No shared database touched.
