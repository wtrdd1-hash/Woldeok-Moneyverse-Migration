# Backend B v533 — public enterprise disclosure DB read boundary (P0 #1287)

- Date: 2026-10-25 KST. Base main: `1c5b84a1c45baafcca83f375a6f99698121e9bb5` (start and mid-run). Branch: `auto/hourly-b-soe-public-disclosure-v533-20261025-1535`.
- Scope: unblock public `GET /api/v1/enterprises/public` **without** granting `moneyverse_app` direct `SELECT` on `state_enterprises` or `private_enterprises`. No ledger writes, migration application to shared 5433, Test promotion or Production change.
- Preflight: Debian 13.6 miniPC status/exec/file MCP invoked; main, AGENTS, README, both project plans, open PRs and latest CI inspected. Root disk at 92% (8.4 GiB free), data volume at 56%.
- Coordination: A Draft #1288 replaces fabricated `/enterprises` fallback with a strict `source=DATABASE_SNAPSHOT`, `settlementStatus=NOT_VERIFIED`, max-20 SOE validator. This PR supplies those exact fields, canonical integer-string projections and a bounded read. **Both PRs modify the enterprise controller/repository and require integration with A's tests and frontend**. Other A/C/Gemini/QA branches and schedules were not modified.

## Actual code / contract

1. New forward-only, **unapplied** `281-enterprise-public-disclosure.sql`: `SECURITY DEFINER`, pinned `search_path=pg_catalog,pg_temp`, fully qualified source tables, explicit selected public fields, bounded 20 SOEs and 100 private companies, `REVOKE ... FROM PUBLIC`, narrow `GRANT EXECUTE` to `moneyverse_app` only. No app table DML or `SELECT` grant.
2. Backend repository executes only `SELECT public.enterprise_public_disclosure()` for the public endpoint. Missing migration, permission errors, connection errors and missing rows fail closed with 503 without SQL details. Existing admin methods remain separate and are not certified here.
3. Public endpoint keeps the existing `overview`, `soes`, `privateEnterprises`, `disclosed_at` fields and adds `source=DATABASE_SNAPSHOT`, `settlementStatus=NOT_VERIFIED`, `financial_data_status=PROJECTION_ONLY_UNVERIFIED`, `ledger_confirmed=false`. `Cache-Control: no-store`. Financial figures are estimates/reported amounts, **not ledger-posted treasury receipts**.
4. Backend unit/contract and optional real PostgreSQL ACL regression tests added. The DB test **requires** `MONEYVERSE_ISOLATED_PG_URL` on a loopback host with an `_isolated` database and explicitly refuses the known shared 5433/official 5585 ports; it never uses the repo `.env` fallback.

## Verification evidence (before PR)

- TDD: initial RED 3/3, GREEN 3/3; A frontend compatibility RED then GREEN; SQL connection-error RED then GREEN 7/7.
- Isolated PostgreSQL 17.11 (`mv_b_v533_isolated`, own Docker container and data volume): migration parsed and applied to a disposable schema; empty read, populated read, max-20 cap, app function EXECUTE, app direct table SELECT denial (SQLSTATE 42501), outsider function EXECUTE denial (42501) verified. Optional DB Vitest 4/4 PASS; final enterprise-focused suite 13/13 PASS. **This is not official Test exact-SHA.**
- Contract build PASS; Backend typecheck/build PASS; Backend unit-only 1,320 PASS, 29 SKIPPED; API contract 179 endpoints PASS; ESLint 0 errors / 1,128 warnings; Frontend typecheck PASS; default Frontend build PASS.
- Database package: 14 PASS, 1 FAIL, 3 SKIPPED. Failure is **required contiguous migration numbering**: main ends at 279 and this Draft uses 281 while five open PRs conflict on 280. No fake 280 migration was inserted; resolve the stack before integration.
- Frontend tests: 1,397 PASS, 6 FAIL (SEO/i18n, login touch target, calculator registration, M2 telemetry). Security audit: FAIL, 2 High (`body-parser`, `multer`). Exact-SHA official Test, authenticated E2E, migration parity, final CI and Production gates: BLOCKED/UNVERIFIED.

## Release / cleanup

**Draft/HOLD**. Do not merge until 280 migration conflict resolved, A #1288 reconciled, all full CI/security/frontend/isolated Test exact-SHA and release gates PASS. Production promotion prohibited. No other branch/worktree deletion. No shared database writes.
