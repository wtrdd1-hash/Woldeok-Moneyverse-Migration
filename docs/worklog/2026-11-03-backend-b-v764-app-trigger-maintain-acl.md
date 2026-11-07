# Backend B v764 — App table TRIGGER/MAINTAIN release prerequisite

## Before work — 2026-11-03 00:37 KST
- [x] Confirmed Debian 13.6 miniPC, backend/frontend/DB services active; independent worktree from `origin/main` `9cade11af53db9f27c2b9f0ea9d39005ea8d0387`.
- [x] Reviewed AGENTS.md, README, English/Korean PROJECT_PLAN, latest QA v1476, open A/C/B/Planning PRs and recent CI.
- [x] Read-only active DEV PostgreSQL 17 check: 264 public tables; `moneyverse_app` has effective TRIGGER on 214 and MAINTAIN on 214. These are *DEV evidence*, not Production compromise proof.
- [x] Avoid overlap: Draft #2546 checks TRUNCATE, #2535 future default ACL, #2500 DML; this change only checks existing-table TRIGGER and MAINTAIN rights.
- [ ] RED tests first; read-only fail-closed verifier, isolated PostgreSQL grant/revoke proof; full repository validation and release HOLD.

## In progress
- No shared DB writes, Production deploy or migration edits. Use an isolated PostgreSQL container for test fixtures only.

## Finished
- Pending validation. Production promotion prohibited without official exact-SHA Test, runtime CI, independent restore, ACL remediation and release approval.

### Implementation checkpoint — 2026-11-03 00:44 KST
- [x] RED: new 8-case test file failed because verifier module was absent (`logs/red.log`).
- [x] GREEN: 8/8 focused tests; added fail-closed read-only PostgreSQL 17 verifier and root `pnpm test` inclusion.
- [x] Disposable PostgreSQL 17.11 matrix: clean PASS; direct TRIGGER BLOCKED; direct MAINTAIN BLOCKED; PUBLIC TRIGGER BLOCKED; revoked PASS; wrong DB BLOCKED. First fixture attempt lacked Docker stdin and correctly failed closed; fixed fixture, no verifier code change.
- [x] Active DEV database read-only: 264 tables, 214 effective TRIGGER, 214 effective MAINTAIN; status BLOCKED, exit 2. No Production privilege claim.
- [x] Added release instructions; no DB schema, migration, API, ledger, member balance, Test or Production writes.
- [ ] Full tests/build, dependency audit, remote CI, exact-SHA Test, restore and deployment verification remain separate gates.
