# Backend B v724 — early-game owner-private HTTP responses (Draft / Release HOLD)

Date: 2026-11-01 KST. Base main: `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0`.

## Source-confirmed defect and scope

`EarlyGameController` has authenticated owner-only `GET /api/v1/early-game/today`, `GET /api/v1/early-game/first-day`, and `POST /api/v1/early-game/claims`. Its module previously had no pre-guard response privacy middleware. A real Nest HTTP RED test reproduced missing `Cache-Control`, `X-Robots-Tag` and `Referrer-Policy` on successful owner reads, claim receipts, 401/403 guard refusals, and HEAD. This is a cache/metadata privacy risk, not evidence of an actual member-data leak.

The `EarlyGameModule` now attaches `Cache-Control: private, no-store`, `X-Robots-Tag: noindex`, and `Referrer-Policy: no-referrer` to this controller *before* session/consent/CSRF guards. An unrelated public probe stays public. No API payload, DB schema, migration, session, CSRF, SQL function, WLD balance, or ledger change.

## RED / GREEN and regression evidence

- RED real HTTP: 5 failing / 1 passing tests before the middleware (missing headers).
- GREEN real HTTP: 6/6 tests PASS (two owner reads + their 401 refusals; claim receipt + 401; consent/CSRF 403; HEAD; unrelated public route).
- Full lint PASS (0 errors; 1,022 existing warnings), full typecheck PASS, full backend/frontend build PASS.
- Backend full: **2 FAIL / 2,967 PASS / 518 SKIP**, failures in `profile-private-response.http.test.ts` expecting 200 but receiving 401 (tracked separately under PR #2265). Not a full PASS.
- Frontend full: **496 FAIL / 2,373 PASS**; many `React.act is not a function` and additional independent assertion failures. Not a full PASS.
- Contract package 41 PASS; database package 62 PASS / 4 SKIP; mobile API contract artifacts match; targeted security middleware 2 PASS.
- Isolated PostgreSQL 17.11: 316 migrations applied, 30 real DB integration tests PASS (session 17 + early-game 13). `moneyverse_app` direct ledger DELETE and balance UPDATE remain denied. Disposable container removed; no shared DB mutation.
- Production-only dependency audit PASS (0 known); full dependency audit FAIL (9 advisories: 1 low, 8 moderate).

## Release decision

Draft/HOLD. Full test suites fail; official Test exact-SHA auth/core-flow E2E, final CI and GitOps release gates are not approved. No main merge, Test deployment or Production promotion. The HTTP privacy change alone does not certify the actual Next/edge cache policy.
