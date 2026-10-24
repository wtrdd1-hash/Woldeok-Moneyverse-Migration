# Development B v511 — KDIC Financial Settlement Containment (2026-10-24)

**Status:** PARTIAL / BLOCKED — code candidate only; no merge, official Test promotion, or Production deployment.

## Authority and isolation

- MiniPC MCP status and shell verified Debian 13.6, active backend/frontend/bot/Nginx/Docker, and a connected development-named DB. The latter must not be used for write testing because it may share Production data. `fs_read_file` was attempted and returned an empty result; shell read the required files instead.
- Starting and mid-run `origin/main`: `49788d09494fed3e463651945b83386e87dd47bc`.
- Independent worktree: `/home/debian/worktrees/mv-b-v511-20261024-1835`; branch `auto/hourly-b-kdic-safety-v511-20261024-1835`.
- Reviewed `AGENTS.md`, `README.md`, canonical `docs/planning/PROJECT_PLAN.md`, Korean counterpart, recent CI, QA v1231/v1235 evidence and open PRs. No existing open KDIC PR was found. A/C/QA and Gemini worktrees remain untouched.
- Work plan: `docs/superpowers/plans/2026-10-24-kdic-unsafe-mutations-containment.md`.

## Reproduced P0 issue and risk

`AdminKdicController` previously required a member session and admin role but **not** a separate admin console session, CSRF token or recent reauthentication. Its three financial mutation routes invoked repository-level SQL that could alter the KDIC fund and insurance records. Premium assessment lacked a replay-safe, unique per-quarter receipt and emergency liquidity altered fund/institution rows without an authoritative WLD settlement. The payout implementation used a random transaction key and did not verify that the selected institution had actually failed; a duplicate SELECT alone is not a concurrency-safe idempotency guarantee. This is a code-level risk, **not** evidence that a Production exploit or financial discrepancy occurred.

## Actual code changes

- Add `AdminSessionGuard` to `admin/kdic` controller, and `CsrfGuard` plus `ReauthGuard` to each of `POST /admin/kdic/assess-premiums`, `/liquidity-loan`, and `/payout`.
- Return HTTP **503** for those three operations from the service and repository layers, before any database query, notification or financial mutation. Preserve the routes and response error semantics. Do **not** silently treat disabled operations as success.
- Remove unsafe direct-SQL KDIC financial write code, obsolete fallback actor resolution, and obsolete notification side effects from KDIC mutation methods. Read-only `GET /admin/kdic/overview`, `GET /kdic/portal`, and authenticated `GET /kdic/my-coverage` remain available.
- Admin KDIC UI displays an explicit operational hold, disables all three mutation controls and removes browser POSTs/fake success notifications. Read-only refresh reloads the authenticated server-rendered page. Missing fund/ratio data is displayed as unavailable rather than fabricated defaults.
- DB schema, migration files, WLD balances and audit/ledger records were **not** changed. No data was written to any existing development, Test or Production database.

## TDD and verification evidence

- RED: backend 10 expected failures across controller/service/repository guard and containment tests; frontend 1 expected failure before the hold UI.
- GREEN: backend focused **14/14 PASS**; frontend focused **2/2 PASS**.
- Full workspace ESLint: **PASS (0 errors; 1,129 pre-existing warnings)**. Changed-file ESLint: PASS (0 errors). Workspace typecheck and build: PASS. API contract check: PASS (179 endpoints).
- Disposable PostgreSQL **17.11-alpine** container bound only to `127.0.0.1:55497`, with **278** migration files applied from 002 through 279 and recorded in `schema_migrations`. `SET ROLE moneyverse_app` checks verified no direct UPDATE on `account_balances`/`deposit_insurance_funds` and no direct INSERT on `deposit_insurance_payouts`. This is a narrow ACL check, not full application-role integration.
- Full root test was run against the **isolated database using the migrator role** because the test application's dedicated login was not provisioned. Backend: **1,840 PASS / 59 FAIL / 34 SKIPPED**; many failures are role-sensitive and this is not an authoritative application-role PASS. Frontend: **1,396 PASS / 5 FAIL** (locale, SEO and login touch-target tests, separately owned by QA/A). Database package: **15 PASS / 3 SKIPPED**.
- Production dependency audit: **FAIL (2 High)**. Bot audit: **FAIL (1 Critical / 5 High)**.
- Authenticated HTTP E2E, official isolated Test exact-SHA, finance/ledger and GitOps release gates: **BLOCKED / NOT VERIFIED**.

- Official Test public SHA (read-only check): `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; Production public SHA: `6a989b5ac0c6155587d43426d64f6def6b62c917`. Neither contains this candidate.
- Follow-up P0 issue: [#1157](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1157).

## Required follow-up and release contract

1. Design and test a database-owned, transactionally atomic KDIC settlement function for premiums, emergency liquidity and depositor payout, including institution eligibility, actor authorization, immutable receipts, deterministic idempotency, unique constraints, fund accounting, ledger postings, concurrency and rollback. No re-enablement before these pass isolated app-role PostgreSQL tests.
2. Coordinate with A/C for administrator UI re-enablement only after real backend receipts and tested reauthentication. The current hold is intentionally user-visible.
3. Resolve the five unrelated frontend regressions and outstanding high/critical dependency findings with QA, then rerun full CI on the final SHA.
4. Confirm official Test serves the exact candidate SHA and pass backend/API/DB/auth/core-user-flow E2E before any approved main merge or GitOps Production release.

**No main merge, no Production promotion, no cleanup of other branches.** Preserve this independent Draft PR and worktree while release gates are blocked. The existing five critical automations remain enabled.
