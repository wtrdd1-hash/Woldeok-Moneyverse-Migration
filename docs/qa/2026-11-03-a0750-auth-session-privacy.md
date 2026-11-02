# A 07:50 — CSRF session response privacy QA (2026-11-03)

**Decision: DRAFT / RELEASE HOLD.** Branch `auto/hourly-a-20261103-0750-session-privacy`, main at start/mid `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`; implementation commit `00d26a0d9f3d2327be94e219fd54810517c96bce`. No schema, applied migration, ledger, service or operational database writes.

## Observed production regression and change
At 07:59 KST, unauthenticated `GET https://easy-scraping.com/api/v1/auth/session` returned HTTP **401** but `X-Robots-Tag: index, follow...` (Test 401: noindex,nofollow). Production `/ko` and `/en` both HTTP **500**, separate P0 #2262/#2552. The session route rotates a CSRF token when authenticated; this response must not be cached or indexed even if upstream sends public cache headers or a guard rejects the request.

Changes: Nest auth session success now sets private/no-store, noindex/nofollow and no-referrer; Next `headers()` overrides the public global indexing rule for both `/api/v1/auth/session` and `/app-api/v1/auth/session`; Android/Next gateway overrides upstream response headers on 200/401/errors. No authorization relaxation, no CSRF rotation semantics change. Revert this branch to roll back; there is no DB rollback or new migration.

## TDD and evidence
- RED: Frontend 3 failed; Backend 1 failed. GREEN: Frontend 3 passed; Backend 1 passed. Source: task evidence red/green logs.
- Workspace typecheck PASS; targeted ESLint PASS; full ESLint PASS, **0 errors / 1,026 warnings**.
- Backend full **2,984 PASS / 2 FAIL / 518 SKIP**. Failures are pre-existing `profile-private-response.http.test.ts` (expected 200, got 401), tracked in Draft #2265; not fixed by this change.
- Frontend full first attempt **TIMEOUT 145s**, no PASS; retry with `NODE_ENV=test` and 2 workers **2,950 PASS / 0 FAIL**. Database unit **72 PASS / 5 SKIP**; contract **41 PASS**; Android API contract **184 endpoints PASS**.
- Full dependency security audit **9 vulnerabilities (8 moderate, 1 low), FAIL**; prod-only audit 0. Concurrent security remediation Draft #2587 is isolated and not cherry-picked or overwritten.
- DEV PostgreSQL read-only check: 323 applied migrations, app role has UPDATE on `account_balances` and DELETE on `user_items`; P0 #993 remains. This is **not** an isolated real-PG auth user-flow E2E test.
- Full builds, authenticated exact-SHA Test, accessibility, production-edge verification of this candidate, independent restore, GitOps approval and rollback rehearsal are required; do not infer PASS from focused tests.

## Coordination, branch safety, release
Initial remote heads 333 (including main); 303 open PRs at 07:58, 29 conflicting. Prior QA v1483 classified 252 unique/59 conflict/17 merged among earlier 328 non-main branches; this run did not revalidate all merge ancestry. No branch deletion. Existing Drafts #2552, #2587, #2265 and B/C in-flight work are preserved. No main merge, official Test or Production deploy, service restart, DB role change or ledger write. Release remains HOLD pending all exact-SHA gates and owner-approved GitOps.
