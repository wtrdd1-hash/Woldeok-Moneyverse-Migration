# Backend B v554 — PostgreSQL transaction pool quarantine (2026-10-26)

Status: **PARTIAL / RELEASE HOLD**. This is a defensive fix in the shared transaction helper, not a claim that disabled PvP settlement is enabled or that any financial flow was deployed.

## Authority and isolation

- Starting and mid-run `origin/main`: `1c5b84a1c45baafcca83f375a6f99698121e9bb5`.
- New independent branch: `auto/hourly-b-pg-transaction-quarantine-v554-20261026-1235`.
- Read AGENTS.md, README.md, both living project plans (English authoritative, Korean auxiliary), QA #1317, open PR/branch inventory and CI before modification. No other worker's branch/worktree modified.
- The only known production-adjacent caller (`pvp-arena.repository.ts`) currently throws a settlement HOLD before calling this helper. This fix is **latent pool-safety hardening**, not a released PvP feature.

## Reproduced defect and code

`withPgTransaction` previously called `client.release()` even if `BEGIN` failed, `ROLLBACK` failed, or `COMMIT` failed with an unknown outcome. A potentially poisoned pooled connection could therefore be reused by a later transaction.

- `backend/src/core/with-transaction.ts`: discard such clients with `pg PoolClient.release(true)`, preserve the original failure, and return healthy clients to the pool after successful commit/rollback.
- `backend/src/core/with-transaction.test.ts`: added 5 deterministic regression tests for BEGIN failure, ROLLBACK failure, COMMIT failure, original error preservation and normal pool reuse.
- `backend/src/core/with-transaction.pg.test.ts`: added 2 opt-in isolated real-PostgreSQL tests validating real pg.Pool eviction/reuse. The ROLLBACK transport failure is injected into the adapter after a real PostgreSQL BEGIN; no shared database is touched.
- API paths, DTOs, DB migrations, database grants, ledger balances and financial settlement algorithms: **unchanged**.

## Verification

- RED: 4/8 unit cases failed before fix. GREEN: 8/8 unit cases passed after fix.
- Isolated PostgreSQL 17.11-alpine: 2/2 integration cases passed; throwaway Docker container removed.
- Backend suite: **1,318 PASS / 400 SKIPPED**. Contract tests: 38 PASS. DB package: 15 PASS / 3 SKIPPED. Mobile API contract: 179 endpoints generated/checked.
- Root typecheck, full default build, lint (0 errors; 1,128 warnings), repository security/release policy tests (18 PASS), Discord bot tests after offline dependency install (8 PASS): PASS.
- Full root tests: **FAIL** on pre-existing frontend 6 cases (1,397 PASS / 6 FAIL); QA #1317 owns integration remediation.
- Dependency audit: **FAIL** (production: 2 High; full: 2 Critical, 10 High, 11 Moderate, 3 Low).
- Official Test exact-SHA authenticated Backend/API/DB/core-user-flow/E2E, required CI, merge gate and GitOps release: **BLOCKED / not certified**.

## Release and cleanup

No main merge, official Test promotion, Production deployment, schema changes, data writes or other-worker branch cleanup. Production is HOLD until all required gates pass. Existing hourly A/B/C/planning/QA reservations were not modified.
