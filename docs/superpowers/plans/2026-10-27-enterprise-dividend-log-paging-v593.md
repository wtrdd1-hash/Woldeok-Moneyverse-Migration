# v593 — Bounded administrator SOE dividend history

**Scope:** P1 read-only financial-history pagination correctness, not dividend settlement.

## Evidence and requirements
At main `59cdc2e02f0e83e5401049309c4cb89ff57c2d4c`, `GET /admin/enterprises/dividend-logs` converts raw query input using `limit ? Number(limit) : 20`. Values such as `0`, `1e2`, `2junk`, repeated query parameters, and large limits are not rejected consistently. `EnterpriseRepository.listRecentDividendLogs` sends unvalidated `LIMIT $1` to PostgreSQL. The endpoint is administrator-guarded, but incorrect input can cause confusing results or an excessive financial-history query.

Preserve the default 20, require canonical decimal integer 1–100, reject malformed/duplicate/unsafe values with HTTP 400 before service or DB access, and enforce the same numeric range in the repository. Do not change the response shape, authorization, WLD, ledger, migrations, or other teams' branches.

## TDD and review
1. RED: add controller and repository negative/positive tests; run and record failures.
2. GREEN: minimal controller parser and repository guard; rerun tests.
3. HTTP integration: exercise actual Nest routing with explicitly mocked guards; do not claim production authentication proof.
4. Isolated PostgreSQL 17: synthetic readonly tables, 1/2/100 row limits, invalid direct repository calls and SQLSTATE 42501 for unauthorized UPDATE.
5. Run typecheck, lint, full tests, build, dependency audits and GitHub CI. Any failure means Draft/HOLD, no main merge or deployment.

## Dependencies and release gates
QA/main already contains duplicate migration number 280 (missing 282); A PR #1564 handles that separately. C PR #1540 changes only the enterprise admin frontend, and B PR #1556 concerns SOE dividend settlement; preserve both changes on eventual integration. Full dependency audit and exact-SHA official Test are mandatory before merge; no attempt to use the production-linked development DB for testing.
