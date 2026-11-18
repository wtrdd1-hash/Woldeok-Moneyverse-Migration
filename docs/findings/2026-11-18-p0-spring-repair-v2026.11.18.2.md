# Spring platform P0 incident recovery audit — v2026.11.18.2

**Status: PARTIAL SECURITY CONTAINMENT / SOURCE CANDIDATE / RELEASE HOLD.** 2026-11-18 KST. [Korean](2026-11-18-p0-spring-repair-v2026.11.18.2.ko.md).

## Authority and source identities
Canonical PROJECT_PLAN and INTEGRATED_PLANNING_MASTER retain Spring migration release gates; a prior 100% controller inventory is not authenticated end-to-end certification. Remote main was `0590fac4e8a82bc986ba1b8c64f014d18daca9e9` at start, mid and pre-push. MiniPC shared main `f45ddcbad9b687a1eae9d3d3b1f3d6180c17545a` has 15 commits published on feature branch but not on `main`; no shared-worktree edits occurred. Dedicated branch `repair/p0-platform-20261118-v2` derives from the feature head. Candidate commit `72de60d999c193a0cc83556ec9bf7aabbeb481c5`; draft PR #3267 is based on that feature branch, not merged main.

## Root-cause evidence
1. Admin `users`, `stocks`, and `economy` formerly accepted unvalidated bearer/cookie presence and/or a fixed system actor. The new code requires a nonrevoked database session and current admin DB role, passes actual actor into actor-scoped reads; global admin API gate requires session and checks CSRF on writes. Previous fabricated user portfolio and stock-halt success were changed to explicit unavailable outcomes pending canonical receipts.
2. Java shop catalogue invoked an invalid zero-argument function and wrong columns. PostgreSQL has `shop_catalog_list_v2(p_actor uuid)`. New Java catalogue uses canonical fields, returns actual rows and fails with 503 on source error, never invented objects. Private inventory requires valid session actor, ignores forged client user headers. Purchase requires CSRF, caller UUID idempotency key, and the canonical DB purchase function; fabricated purchase/crafting receipts are removed. Purchase mutations have NOT been positively tested on real PostgreSQL, so not certified for release.
3. Static Spring-rendered admin pages still contain baked-in error states from Next server exports. The user-list page is NOT restored. Historical 100%-complete frontend claim is not a functional acceptance test.
4. Previously observed official Test `test.easy-scraping.com` returned HTTP 502 for functional routes due unserved old web upstream, whereas health/version alone returned 200. Independent local staging is not equivalent to officially routed Test.
5. New read-only 101-route OpenAPI GET sample: 68 HTTP 200, 16 HTTP 401, 16 HTTP 503 (including intentional holds), 1 HTTP 500. The anonymous pension my-account path returned 500 with an actual database privilege denial, while its controller trusts a caller user-ID header. Financial user identity and actual read functions remain unresolved; private pension routes now fail closed at Nginx.
6. Discord Gateway reconnects were observed previously with voice-client errors; actual voice-channel success is NOT certified.

## Red/green and broader QA
- Protected admin endpoints: 4 focused tests; 3 RED before fix, focused suite GREEN after fix.
- Shop actor and catalog: 3 RED before fix, focused suite GREEN after fix.
- Global admin boundary: test failed to compile before implementation, focused suite GREEN after implementation.
- Offline Spring bootJar build: PASS.
- **Full Spring suite: 136 tests, 17 FAIL**, including obsolete internal-header positive assumptions, OTP/Treasury E2E, profile and previously fabricated shop assertions. Not green. No production application promotion.
- Isolated Spring canary binds only localhost port 4610, test-only PostgreSQL 5585 with read-only JDBC options and no Discord bot. Health 200, DB catalogue 146 real products 200, public stocks 200, bad admin credential/session 401, forged shop actor 401; HTML `/admin/users` still has baked error text. Candidate JAR SHA256 `768ae03b4ef552e6c45c59770c1bab5f3316255667712848ef14e667dbc2013e`.

## Operational containment and safeguards
A versioned, reversible production Nginx temporary guard was gracefully reloaded after `nginx -t`: admin users/stocks/economy exact and nested routes 403, and pension private account/contribute/retirement paths 403. Home, health and public stock reads remained 200. Original Nginx files have private rollback copies. This does not close other unreviewed endpoints. Running production Spring process was not replaced or restarted, and no Production PostgreSQL/ledger mutation took place. No account rows, credentials, sessions or sensitive reproduction mechanics are published.

## Gate to resume production promotion
P0 complete server-side session/roles, strict CSRF/MFA and member-owner scope across all routes; exact-SHA official independent Test; signed-in positive admin and member API/browser/mobile E2E; zero full-suite failures; eliminate static exported admin failures; DB canonical finance function/ledger receipts and isolated rollback-only verification; Discord voice; immutable signed release and independently reversible zero-downtime Nginx switch. **Release HOLD until measured gates pass.**
