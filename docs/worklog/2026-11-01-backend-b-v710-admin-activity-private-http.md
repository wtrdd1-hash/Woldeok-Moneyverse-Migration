# Backend B v710 — Private admin activity HTTP responses

## Before work
- Baseline origin/main: `f13bbce273ffc65e8576170992d82ea00c27a1c9` (fetched 2026-11-01 07:00 KST).
- Reviewed AGENTS.md, README, English and Korean living plans, QA v1430, open PRs, B v709 #2273, and CI.
- Candidate P1: admin activity logs include sensitive per-user telemetry. The `ActivityModule` lacks pre-guard cache, robots, and referrer headers; the public `POST /activity/events` must remain unaffected.
- Scope: only the admin activity traffic/logs routes; no DB, auth, ledger, API payload, or public telemetry change.
- Design: Nest middleware on the two admin paths, applied before guards; assert actual HTTP 200/401/403 and unrelated public route behavior.

## In progress
- [x] RED: reproduce missing headers in real Nest HTTP test.
- [x] GREEN: minimal scoped middleware.
- [x] Run focused and full project gates; record PostgreSQL and exact-SHA blockers.
- [x] Re-fetch main/plan, review, push Draft PR #2277 with HOLD.

## Finished — 2026-11-01 07:20 KST
- Code commit: `a478be54c85e29b1b3ed3444ddaa8e91b1a52fd8` on `auto/hourly-b-v710-admin-activity-private-http-20261101-0700`. Draft/HOLD PR #2277 created.
- API: `GET /api/v1/admin/activity/logs` and `/traffic` now carry private/no-store, noindex, no-referrer on 200/401/403/HEAD; `POST /api/v1/activity/events` remains unaffected.
- DB/migration/ledger: no schema, data, permissions, migration or WLD modifications. Disposable PostgreSQL full replay BLOCKED by fixture role privilege setup at migration 020; container removed. No real DB pass claimed.
- Full gates: Backend 2,958 PASS / 517 SKIP; Frontend 2,901 PASS; Contract 41 PASS; DB static 62 PASS / 4 SKIP; security/release 34 PASS; focused HTTP 8 PASS plus 2 guard PASS. Lint, typecheck, build, app-api 184 endpoints and production audit PASS. Full dependency audit FAIL: 9 vulnerabilities (1 low, 8 moderate).
- Runtime identity observed: official Test `bc8cd8a6c654af0336f550643f23049a58ee1d16`, Production `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`. Neither executes this candidate. Official Test exact-SHA/authenticated E2E NOT VERIFIED.
- Remote CI: pending at final documentation checkpoint. No approval, merge, Test deploy or Production deploy. RELEASE HOLD. No other branch or schedule modified.
- Source main SHA unchanged at re-fetch: `f13bbce273ffc65e8576170992d82ea00c27a1c9`. No PR merge attempted; branch retained because it has unique code.


### TDD evidence (07:02 KST)
- RED: six actual Nest HTTP 200/401/403 cases failed on absent `Cache-Control` (`red.log`); public ingestion control passed.
- GREEN: scoped controller middleware plus path guard; nine initial focused cases passed. HEAD/query-string regression added before final verification.
- First string-only `.forRoutes` attempt did not match URI-versioned paths; switched to controller-bound middleware and exact admin path guard, preserving public telemetry behavior.

### Validation checkpoint (07:19 KST)
- Focused real HTTP 200/401/403, HEAD and public-ingest isolation: 10/10 PASS.
- Backend suite: 2,958 PASS / 517 SKIP (four fork workers, 57.65s). One earlier single-worker run timed out after 175s; rerun passed.
- Frontend suite: 2,901 PASS (two workers, 122.81s). One earlier four-worker run timed out at 130s; rerun passed.
- Contract: 41 PASS; database static: 62 PASS / 4 SKIP.
- `pnpm lint`: exit 0, 0 errors / 1,022 pre-existing warnings. `pnpm typecheck`: exit 0 after linking existing isolated package dependencies. `pnpm build`: exit 0.
- Mobile API contract: 184 endpoints verified, exit 0. Production dependency audit: no known vulnerabilities; full dependency audit: FAIL, 9 (1 low, 8 moderate).
- Disposable PostgreSQL 17.11: isolated container started and removed, but full 316-migration replay did not pass. Fixture role ownership/membership setup failed migration 020; this is NOT evidence that the schema or app-role ACL passed. No shared/Production DB changes.
- Official Test exact-SHA and authenticated live E2E: NOT RUN; release remains BLOCKED.
