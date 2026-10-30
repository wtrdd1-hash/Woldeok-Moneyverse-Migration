# B v662 — Account identity response privacy headers (DRAFT / HOLD)

## Before work
- Source: current origin/main, AGENTS.md, README.md, English and Korean living plans, QA v1393, open PRs and CI reviewed.
- Scope: `GET /account/identities`, `DELETE /account/identities/:id`, `DELETE /account` success payloads. Account identity linkage and deletion receipts are owner-sensitive.
- Invariants: session, consent, CSRF and recent reauthentication unchanged; no DB migration, ledger or WLD write; no deployment.
- Plan: RED HTTP response-header tests; minimal NestJS controller change; GREEN HTTP regression; build/lint/typecheck and wider gates; record exact SHA and release blockers.

## In progress
- [x] HTTP regression RED reproduced — 3 failed: missing Cache-Control
- [x] Backend privacy policy implemented — per-route Nest response headers
- [ ] Focused tests GREEN
- [ ] Mandatory validation recorded

## Finished
- Pending.

## In-progress verification (2026-10-30 17:39 KST)
- RED: three real Nest HTTP requests returned no Cache-Control; all 3 assertions failed before the fix.
- GREEN: 3/3 new HTTP tests passed; broader account tests 11/11 passed after contract build.
- Root cause: `AccountController` did not set response privacy headers on identity listing, unlink receipt or account-deletion acceptance. Fixed only successful route responses with Nest `@Header`; guard-rejected/error responses and edge proxy headers remain unverified.
- Lint: PASS (0 errors, 1,043 existing warnings). Workspace typecheck: PASS. Backend build: PASS.
- Contract: 41 PASS. Mobile API contract: 183 endpoints PASS. Database static: 56 PASS / 4 SKIP. Security policy: 14 PASS.
- Backend full suite: 2,566 PASS / 119 FAIL / 495 SKIP. Failures prevent release; do not attribute to this patch without isolation.
- Frontend build: TIMEOUT at 115 seconds during build trace collection, not PASS. Frontend full suite, real PostgreSQL and official Test exact-SHA not yet verified.
- Database schema, API paths and response JSON unchanged. No production deployment, no financial mutation, no DB migration.
- Main SHA unchanged at midpoint: `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`.

## Finished
- [x] HTTP regression RED reproduced
- [x] Backend privacy policy implemented
- [x] Focused tests GREEN
- [x] Validation recorded with remaining failures
- Release status: DRAFT / HOLD. No merge, no Test or Production promotion.
