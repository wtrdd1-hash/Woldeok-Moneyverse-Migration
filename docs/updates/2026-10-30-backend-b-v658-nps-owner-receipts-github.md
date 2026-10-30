# Backend B v658 — Owner-private NPS receipts (Draft/HOLD)

## Why
Member contribution/payout receipt repository reads used raw pension table SELECT, incompatible with app-role least privilege and prone to SQL 42501. Frontend C #1982 separately identified false empty/zero UI fallback on API errors.

## Change
- Migration 309: revoke direct access to both pension receipt tables from PUBLIC and moneyverse_app; create two owner-filtered SECURITY DEFINER read functions with safe search_path, bounded 1–50 limit, and EXECUTE only for moneyverse_app.
- Nest repository: call the two functions with authenticated actor ID; reject malformed actor and limit before DB.
- TDD and isolated PostgreSQL regression; no WLD mutations, ledger writes, schema data changes, or response field changes.

## Gates
- RED 3 / GREEN 3; focused pension 15 PASS; isolated PostgreSQL 17.11 PASS.
- Lint, Typecheck, Backend/Frontend Build, app-api 183, Contract 41, DB 58 PASS / 4 SKIP, security/release 25 PASS, production dependency audit zero known vulnerabilities.
- Backend full 2,568 PASS / 119 FAIL / 496 SKIP; Frontend full 2,607 PASS / 53 FAIL. No official Test exact-SHA/authenticated E2E or complete 002–309 migration verification.

## Release HOLD
Stacked on unmerged Draft #1992, itself dependent on #1987. Parent CI, full tests and exact-SHA Test/Production gates are not satisfied. Do not merge, apply migration to shared DB, or promote. Existing account creation/read and admin payout paths remain outside this change; coordinate with Frontend C #1982.
