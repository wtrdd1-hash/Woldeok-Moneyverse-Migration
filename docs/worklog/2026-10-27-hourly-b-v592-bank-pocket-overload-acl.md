# Backend B v592 — Bank pocket legacy overload privilege containment (DRAFT / HOLD)

## Before work
- Base: `main` `59cdc2e02f0e83e5401049309c4cb89ff57c2d4c`; QA v1325 P0 #993.
- Live-connected **development-named** PostgreSQL read-only catalog evidence: three
  migrator-owned `SECURITY DEFINER` text-key overloads
  `bank_archive_pocket(text,uuid,uuid)`,
  `bank_customize_pocket(text,uuid,uuid,text,text)`, and
  `bank_transfer_pocket(text,uuid,uuid,bigint,text)` have PUBLIC and app EXECUTE.
  Three distinct UUID-key overloads exist and are app-executable, not PUBLIC-executable.
- No claim of exploitation, historical loss or Production ACL parity. Do not modify
  the live-connected database; no direct REVOKE there.
- Concurrent A Draft #1585 changes bank loan ACL/credit facts and proposes migration
  283. B Draft #1576 also proposes migration 283. Coordinate migration ordering;
  do not merge this candidate while duplicate 280 and unresolved 282/283 remain.

## Implementation
- `backend/src/bank/bank.repository.ts`: explicit parameter casts for
  pocket transfer/customize/archive. The first three inputs resolve to UUID,
  not an untyped text-key overload; transfer amount resolves to bigint.
  Existing request/response contracts and UUID validation remain unchanged.
- `packages/database/migrations/284-bank-pocket-legacy-overload-acl.sql`:
  forward-only, conditional REVOKE of EXECUTE from PUBLIC and moneyverse_app
  on precisely three legacy text-key overloads. A fresh installation without
  those functions is a no-op. No grants, DML, balance, posting or audit changes.
  Modern UUID-key overloads are intentionally untouched.
- Regression: typed routing unit tests, static migration contract, optional
  read-only real-PG catalog ACL test (requires MIGRATOR_DATABASE_URL).

## Evidence and limitations
- RED: 3 bank SQL routing assertions failed; 4 SQL migration assertions failed.
- GREEN: bank focused 4 PASS, migration focused 4 PASS; optional live DB
  catalog test skipped when MIGRATOR_DATABASE_URL is absent.
- Isolated PostgreSQL 17.11, no host port/network: synthetic six-function
  fixture reproduces legacy PUBLIC execution; apply migration twice; verify
  app and guest cannot execute legacy overloads, app can execute UUID-key
  modern overloads and guest cannot. All checks PASS. Synthetic functions
  do not model actual financial settlement or prove official Test E2E.
- Full local typecheck PASS; lint 0 errors/1,122 warnings; build PASS;
  API contract 179 endpoints PASS; backend 1,548 PASS/413 SKIP;
  frontend 1,485 PASS; contract 38 PASS; bot 8 PASS after offline install.
- Root test/database parity FAIL on existing duplicate 280 and missing 282/283.
  Full audit FAIL (Critical 2/High 8/Moderate 11/Low 3);
  bot audit FAIL (Critical 1/High 5). These are release blockers.
- **Release HOLD**: independent exact-SHA official Test PostgreSQL/auth/finance
  E2E, full security audit, migration-number reconciliation, approved PR and
  GitOps gates are not satisfied. No main merge, Test or Production promotion.

## Integration and rollback
- Review A #1585 and B #1576 for migration-number collision before integration.
  Migration 284 is not to be applied before a unique, contiguous 282/283 history.
- Rollback of an unapplied candidate: discard branch. Once applied, never edit
  its bytes; any privilege change must use a new forward migration and separate
  security review. Do not re-grant PUBLIC access to legacy definer functions.
