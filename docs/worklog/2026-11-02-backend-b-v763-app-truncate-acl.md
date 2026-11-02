# Backend B v763 — Existing-table TRUNCATE release gate

## Before work — 2026-11-02 23:35 KST
- [x] Read AGENTS.md, README.md, EN/KO planning, QA v1475 and open B/A/C/Planning PRs.
- [x] Confirmed main 9cade11af53db9f27c2b9f0ea9d39005ea8d0387; isolated branch.
- [x] Reproduced QA evidence: Production app role has TRUNCATE on 213 public tables; separate #2535 checks future defaults and #2500 checks other DML.
- [x] RED: module-missing test failure captured; GREEN: 8/8 tests.
- [x] Added read-only verifier, root test runner integration, release instructions and implementation plan.
- [x] Disposable PostgreSQL 17.11: clean PASS, direct app TRUNCATE BLOCKED, PUBLIC TRUNCATE BLOCKED, revoked PASS, wrong DB BLOCKED.
- [x] Read-only active backend DB: 264 public tables, 213 effective TRUNCATE rights, gate correctly BLOCKED (exit 2).
- [x] `pnpm lint`: 0 errors, 1,027 existing warnings; `pnpm typecheck`: PASS.
- [x] `NODE_ENV=test pnpm test`: PASS; backend 2,983 PASS/518 SKIP, frontend 2,938 PASS; database-backed skipped tests not represented as passing.
- [ ] Full build exit status, remote CI, official Test exact SHA, independent restore and Production remain unverified.

## In progress
- No shared DB, Production or Test writes permitted.

## Finished
- Pending.
