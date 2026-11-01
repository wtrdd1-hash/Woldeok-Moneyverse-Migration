# A 18:25 Published Announcement Image Discovery — QA (2026-11-01)

**Base main:** `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0`. **Code checkpoint:** `d4902dfba5b3e9b754fbe52673ba14af0aefaec7` (later type/API-contract and SSR evidence changes recorded by the final PR SHA). **Status:** DRAFT / RELEASE HOLD.

## User-facing implementation
- `GET /api/v1/announcements?withImage=1`, `GET /api/v1/content/announcements?withImage=1`, Android `/app-api/v1/content/announcements?withImage=1`, and `/announcements?withImage=1` expose an image-only view.
- The PostgreSQL query filters the rows returned by `public.content_list_published_announcements(20)`; **not** the full announcement history. The database function remains the authoritative published-only boundary; no migration or new table grant.
- The server accepts only exact `withImage=1`, rejects duplicate/unknown query keys, and supplies `filterApplied=with-image`, `sourceLimit=20` proof on filtered responses. Default API shape remains compatible.
- Web GET checkbox has an explicit label, keyboard submit, reset, 44px target, verified-empty/error states, and `robots` noindex for filtered URLs. Android rejects unverified HTTP 200 payloads (missing proof, nonimage row, malformed/duplicate ID, >20 rows, wrong content type) and uses no-store/noindex/no-referrer for filtered results.
- OpenAPI query annotation, 184-endpoint Android contract JSON and EN/KO schema references updated.

## Evidence and gate outcomes
- RED→GREEN: Backend three new tests RED then 3 PASS; Frontend/Android ten new tests RED then 12 PASS. Additional SSR regression 3 PASS; app gateway/SEO/accessibility-targeted 27 PASS. Evidence files are under task `evidence/` on the miniPC.
- Backend full with `NODE_ENV=test`: **2,966 PASS / 518 SKIP** (407 files pass, 103 files skip). Frontend full with `NODE_ENV=test` before adding three SSR tests: **2,914 PASS** (557 files); final SHA rerun pending. Database unit: **62 PASS / 4 SKIP**. Skipped DB cases are not a pass.
- Typecheck PASS after linking existing workspace dependencies into isolated worktree. Backend build PASS; Frontend build PASS, 603 static pages generated, `/announcements` dynamic SSR due to searchParams. Lint 0 errors / 1,022 warnings. API contract check PASS (184 endpoints). Security/advisory tests 12 PASS; production dependency audit found no known vulnerabilities.
- Initial full runs without `NODE_ENV=test` failed (Backend 2 profile HTTP 401, Frontend 496 test failures / 8 suites); re-ran both with the project's test environment and obtained zero failures. Initial security shell script paths were obsolete; corrected to `scripts/security/*.mjs`, 12 PASS. Initial typecheck missed workspace package symlinks; corrected and passed. These failed attempts are retained, not mislabeled PASS.
- Actual DEV PostgreSQL 17.11, `BEGIN READ ONLY; SET LOCAL ROLE moneyverse_app`: exact parameterized application SQL returns 1 published row without filter and 0 image rows with filter; ROLLBACK. No real positive image row available, so positive image filtering is supported by unit/API tests, not by a live positive fixture.
- **Existing P0 ACL violation:** DEV `moneyverse_app` has direct `SELECT` on `announcements` and `users`, direct `UPDATE` on `account_balances`, and direct `DELETE` on `user_items`; app role function EXECUTE is allowed. These findings do not establish Production privileges. Issue #993 remains blocking.

## Integration and release blockers
- Main unchanged at start/mid/final re-fetch before candidate; 110 open Draft PRs at audit, 22 conflicting; 121 non-main remote branches excluding symbolic origin HEAD (115 with unique commits, six main ancestors). No branches deleted, because ownership and outstanding changes must be preserved.
- Announcement overlaps: Draft #2347 (publication day), #2272 (pinned), #2243 (title search). Reconcile before merge; no independent green integration claim.
- Official Test backend/frontend `bc8cd8a6c654af0336f550643f23049a58ee1d16`; Production backend `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`, frontend timestamp `1793450413898`. None proves the candidate SHA. Official Test exact-SHA auth/user-flow E2E, independent backup restore, production executable provenance, DEV ACL hardening and GitOps release gates are BLOCKED.
- **HOLD:** No main merge, Test/Production deploy, DB writes, service restart, rollback or branch deletion. Final GitHub CI is not counted PASS until exact SHA evidence is available.
