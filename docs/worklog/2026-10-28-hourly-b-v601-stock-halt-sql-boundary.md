# B v601 — P0 stock halt SQL boundary containment (HOLD)

## Before work
- Baseline: `b1cd54fda1123fb07ca81b6e5b3ead70f59f556c` (`origin/main`), issue #1553.
- Read AGENTS.md, README.md, English/Korean project plans, QA v1334, open PRs, CI and B v585 containment.
- Backend halt is already disabled, but legacy `stock_halt_and_settle` and `treasury_fund_stock_halt` remain callable at the database boundary. Legacy funding has no replay receipt and can debit twice.
- The main migration list has duplicate 283; QA #1610 reserves 285, B #1627 reserves 286. This candidate reserves 287 but MUST NOT deploy or merge before coordinated contiguous lineage and checksums are verified.
- Planned: RED source tests; forward-only fail-closed SQL; isolated PostgreSQL function/ACL/rollback tests; complete gates and CI; no production or live development DB mutation.

## In progress
- Pending.

## Finished
- Pending.

### Implementation checkpoint
- RED: four Vitest regressions failed on missing migration (source baseline).
- GREEN: four focused regressions pass after forward-only 287 SQL hold.
- Real isolated PostgreSQL 17.11: legacy grant baseline, SQL replacement and replay-safe failure, app/PUBLIC EXECUTE revocation, receipt DML revocation, reapply, 100 concurrent denied owner calls and unchanged synthetic vault/ledger/receipts all PASS.
- The migration intentionally does NOT revoke shared treasury vault/ledger DML: other backend banking, pension, FX and SWF consumers still directly write them. This separate P0 security debt must not be concealed.
- Work remains HOLD because main has duplicate 283, missing 285/286, existing QA and B PRs are not merged, and no exact-SHA Test validation is available.

## Finished — PARTIAL / RELEASE HOLD
- Change: forward-only migration 287 replaces `stock_halt_and_settle(uuid,uuid,uuid)` and `treasury_fund_stock_halt(uuid,text)` with SQLSTATE `55000` guards. Removes PUBLIC/app EXECUTE and app DML on stock halt receipt rows; leaves status and receipt reads intact. No new API routes, no balance mutation, no live DB migration.
- RED 4/4 expected failures; GREEN 4/4 focused tests. Isolated PostgreSQL 17.11 passes twice-applied migration, app/PUBLIC role negatives, owner SQLSTATE and 100 concurrent denied calls with unchanged synthetic vault/ledger/receipts.
- Backend: 1,688 PASS / 430 SKIPPED. Frontend: 1,681 PASS. Typecheck PASS; Build PASS; 180 API contracts PASS; Discord bot after offline dependency installation 8 PASS; repository security, Prisma guard, control-byte guard, changed-file lint PASS.
- Full lint FAIL: pre-existing `frontend/src/app/blog/blog-data.ts` two `no-useless-escape` errors (issue #1600). Root tests/DB package FAIL: duplicate migration 283 and missing 285/286 (issue #1605). Root audit FAIL (2 Low, 9 Moderate); bot audit FAIL (1 Critical, 5 High). Full CI runtime-check FAIL.
- Synthetic integration with QA PR #1610 (migration 285/blog lint), B PR #1627 (migration 286), and this migration 287: parity PASS but four source tests initially failed because `packages/database/test/space-finance-sql-hold.test.ts` still references renamed migration 283. Updating that test path **only in disposable integration worktree** produced 37 DB PASS / 3 SKIPPED and full lint PASS (0 errors, 1,108 warnings). QA PR needs to include this test-path correction before integration; no other branch was modified.
- Production-linked development DB was read-only for QA; no live DB writes, no applied migration edits, no financial transactions. Official Test SHA `6f697e74b7bf0cd1e4521d36534cfd9c140f8010` and Production SHA `6a989b5ac0c6155587d43426d64f6def6b62c917` differ from candidate. No official exact-SHA authenticated E2E, GitOps release gate or deployment. Production HOLD.
- Full atomic halt/refund/funding settlement with immutable event receipt is **not** implemented; this is SQL containment only. Broad treasury table DML remains separate P0 debt; do not call the stock halt feature complete.
- Initial and mid-run main `b1cd54fda1123fb07ca81b6e5b3ead70f59f556c`. Worktree isolated; other A/C/QA/Gemini worktrees untouched; no branch cleanup, merge or reservation changes.
