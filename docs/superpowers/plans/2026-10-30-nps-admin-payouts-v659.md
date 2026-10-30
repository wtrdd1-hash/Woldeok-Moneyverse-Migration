# Admin Pension Payout Read ACL Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans; execute each RED/GREEN step and verify the result.

**Goal:** Restore the existing administrator's recent pension payout receipt read without granting the application direct access to the payout table.

**Architecture:** A forward-only migration creates an active-admin-scoped `SECURITY DEFINER` read function. The guarded Nest controller passes its authenticated session actor through the service to the repository. The function rejects missing/inactive/non-admin actors and invalid limits, returning up to 100 immutable historical rows. No monetary writes or public API additions.

**Tech Stack:** PostgreSQL 17, NestJS, TypeScript, Vitest, isolated Docker PostgreSQL.

**Spec:** `AGENTS.md` database least-privilege contract and existing `/api/v1/admin/pension/recent-payouts` route.

## Global Constraints
- Preserve all previously applied migrations 002–309, money and audit immutability, existing response shape, 1–100 limit.
- Database function has `SET search_path = pg_catalog, pg_temp`; revoke PUBLIC and app direct table rights, grant app only EXECUTE.
- Read only; do not change active financial operations, Production or Test.

## Review Focus
- Missing/invalid actor must fail before SQL.
- Inactive/roleless actor must be refused by PostgreSQL even if route guard is bypassed.
- One active admin can read up to 100 ordered historical receipts with exact numeric precision.
- Application role must not SELECT/UPDATE/DELETE the table directly; PUBLIC must not execute the function.
- No historical receipt or WLD balance may change.

### Task 1: Red/Green actor-bound API contract
- [x] Write repository/controller tests asserting authenticated actor, no direct table SQL and 1–100 limit.
- [x] Run tests RED against existing code.
- [x] Pass actor through controller/service/repository; validate before querying.
- [x] Run tests GREEN.

### Task 2: Forward-only SQL ACL and real PostgreSQL
- [x] Add migration 310 with scoped active-admin function and table privilege revoke.
- [x] Add isolated PostgreSQL 17 test for active admin, inactive/non-admin, invalid limit, row preservation and app privileges.
- [x] Run isolated PostgreSQL test and migration parity.

### Task 3: Verification and release hold
- [x] Run lint/typecheck/build/contract/database/security/unit/full tests, record exact failures and SHA.
- [x] Fetch latest main/planning again; create dependent Draft/HOLD PR only if safe.
- [x] Never merge or promote with failing gates; preserve other worktrees and existing reservations.
