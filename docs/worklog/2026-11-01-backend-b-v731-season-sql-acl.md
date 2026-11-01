# Backend B v731 — season settlement SQL EXECUTE lockdown

**State:** IN PROGRESS — 2026-11-01 21:12 KST.
**Priority:** P0, issue #2357; separate v727 HTTP hold PR #2358.
**Start and mid-work main SHA:** `3d5e321c3d1221febff677469fecdfcb3cf42e7d`.
**Branch:** `auto/hourly-b-v731-season-db-acl-20261101-2106`.
**Environment:** miniPC Debian 13.6; Backend/Frontend/Nginx/Docker active. No shared DB writes.
**Reviewed:** AGENTS.md, README.md, PROJECT_PLAN.md and PROJECT_PLAN.ko.md, QA v1445, current A/C/QA/Planning PRs, main CI and P0 #2357. Latest main contains migrations through 320. Recheck numbering before any integration.

## Before work
- [x] Confirm SQL function `public.season_settle_rewards(uuid)` defined in migrations 231/265 and granted to `moneyverse_app` by 265.
- [x] Confirm API hold in Draft PR #2358 does not revoke DB execution; app role remains a SQL attack path.
- [x] Choose minimal forward-only migration. Do not change financial data, function body, applied migrations, or shared DB.

## In progress
- [x] TDD RED: source contract 2 tests fail before migration 321 exists (exit 1).
- [x] TDD RED: fresh isolated PostgreSQL 17.11 applied 319 numbered migrations (002–320), then `P0: moneyverse_app can still execute season settlement` (exit 3). Container auto-removed.
- [x] Migration 321: revoke `EXECUTE` from PUBLIC and `moneyverse_app` only.
- [x] TDD GREEN: source contract 2/2 PASS.
- [x] TDD GREEN: fresh isolated PostgreSQL 17.11 applied 320 numbered migrations (002–321), app EXECUTE=false, PUBLIC EXECUTE=false, migrator owner retained, direct app invocation denied. Container auto-removed.
- [x] Mid-work origin/main and both plans unchanged.
- [ ] Repository lint/typecheck/build/test, security/app API/DB gates and official exact-SHA Test.
- [ ] Re-fetch main, inspect migration number conflicts and PR/CI status before any integration.

## API/DB contract
No HTTP route, DTO, or payload change in this PR. Existing season-settlement HTTP hold #2358 remains Draft. Database function body, owner, signature and settlement rows remain unchanged; web application role cannot invoke the privileged settlement function. No replacement operator API or season-end/idempotency/ledger implementation is claimed.

## Release gate
**HOLD** until full CI, exact-SHA Test, auth E2E, independent restore, and GitOps gates pass. Do not merge or deploy merely on focused tests.
