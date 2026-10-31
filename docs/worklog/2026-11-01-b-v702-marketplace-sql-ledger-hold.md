# Backend B v702 — P0 marketplace SQL settlement hold

## BEFORE — design and scope

- Baseline: origin/main at task start; QA v1424 confirmed Production `moneyverse_app` can invoke three unjournaled marketplace `SECURITY DEFINER` monetary functions and directly update account balances. Issue #2191. Previous B v701 protects the NestJS service only (Draft #2221), which is not a SQL-level barrier.
- Goal: forward-only SQL change that blocks the three unsafe functions for all callers, revokes application EXECUTE and direct balance/ledger mutations, without editing applied migration 232 or existing balances.
- Scope: one migration and regression tests. Preserve marketplace read/cancel functions, existing data and app SELECT rights; no settlement implementation or UI claim. SQLSTATE 55000 for explicitly held functions; 42501 for app-role EXECUTE denial.
- Alternatives: (1) controller-only 503 (bypassable), (2) EXECUTE revoke alone (migration owner can still call unsafe body), (3) **chosen** replace bodies with fail-closed and revoke grants plus direct DML. No SQL changes in Production this run.
- RED: new regression tests fail on main. GREEN: migration, focused tests, isolated PG17.11 replay, negative app-role privileges and positive read boundary. Then full gates/CI, exact-SHA Test if available.
- Release: Draft/HOLD, no merge or deployment until all required gates and independent Test attestation pass.

## IN PROGRESS

- [ ] Write failing regression tests and observe RED.
- [ ] Add forward migration and verify GREEN.
- [ ] Validate isolated PostgreSQL, workspace gates, CI, and latest main.

## FINISHED

Pending verification; not approved for release.

### Checkpoint 1 — isolated implementation

- RED: 7/7 new tests failed before the migration. GREEN: 7/7 passed after migration 318.
- Disposable PostgreSQL 17.11: 317 migration files replayed; app-role 3 unsafe EXECUTE and 24 DML privileges denied; balance SELECT preserved; owner calls return SQLSTATE 55000. No shared DB changes.
- Full workspace and CI gates pending. RELEASE HOLD.
