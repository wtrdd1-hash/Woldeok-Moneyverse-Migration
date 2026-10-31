# Backend B v666 — burn draw statistics source truth

## Before work — 2026-10-30 21:40 KST
- Main: `bf8d0d48f810932b43783d8605dce53954c60cff`.
- P1: `BurnEventController.getEventStats` converts both SQL failures to successful zero or empty statistics. A revoked DB table permission is therefore presented as a valid empty event.
- Scope: one read-only endpoint, no new DB grant, migration, money write, route or response field.
- RED → GREEN regression, focused and required gates; release HOLD until exact-SHA Test and CI pass.

## In progress
- [ ] RED: database errors and malformed source responses must never be a success-shaped zero.
- [ ] GREEN: fail closed with generic 503, retain genuine zero from a successful SQL aggregate.
- [ ] Run focused, build, lint, typecheck, contracts, full tests, remote CI.

## Finished
- Pending validation; no main merge or deployment authorized.

### RED / GREEN checkpoint
- RED observed: 6 failing negative assertions, 1 legitimate-empty success on the original controller.
- Removed both error-to-zero/empty catches, validated aggregate row and canonical nonnegative WLD/count, bounded participant count to JS safe integer, returns generic HTTP 503 on unavailable or invalid source.

## Finished — 2026-10-30 21:51 KST
- **Code:** fail closed with generic HTTP 503 if either aggregate/recent SQL query fails or aggregate row/count is malformed; do not leak SQL details. Keep successful SQL zero/empty response and exact WLD string. No schema/API shape change, no financial mutation.
- **RED:** 6 failing negative cases on original source, 1 genuine-empty pass. **GREEN:** final 12/12 focused tests including 3 Nest HTTP checks, precision tests, and 7 source-truth cases.
- **Real DEV PostgreSQL 17.11 READ ONLY:** under `SET LOCAL ROLE moneyverse_app`, aggregate SQL returned 0 burned / 0 participants and the recent JOIN parsed with LIMIT 0. This is development data only, not official isolated Test or Production. No DB writes.
- **PASS:** changed-file ESLint 0 errors (2 existing warnings in unchanged participation code), full typecheck, Backend/Frontend builds, mobile API contract 184 endpoints / 675 controller methods, contract 41, DB static 62 pass / 4 skip, security 22, production dependency audit no known vulnerabilities.
- **FAIL/BLOCKED:** full lint 1 existing Frontend syntax error in `frontend/src/app/api/shop/purchases/route.search.test.ts:99` (1043 warnings); Backend full 2663 pass / 126 fail / 501 skip; Frontend full 2701 pass / 55 fail. Existing Draft #2038 owns Frontend syntax correction. Official Test exact-SHA, authenticated E2E, all CI and independent restore not PASS.
- **Main and plans:** origin/main `bf8d0d48f810932b43783d8605dce53954c60cff` unchanged at start/mid/end; English/KO main planning v1518 unchanged; newer v1522 remains separate Draft #2042.
- **Release:** Draft/HOLD only. No main merge, shared DB writes, Test or Production deployment, financial ledger changes, branch cleanup, or automation modifications. Production promotion BLOCKED.
