# A0950 — Work route privacy/SEO CI repair plan

## Problem and decision
`/work` calls `requireMember()` and exports `robots: {index:false, follow:false}`. Main `b9746298` correctly removed it from sitemap, but `seo-routes.test.ts` still expects it to be indexed, while route metadata continues to call it public and unauthenticated. CI 40046356805 fails two assertions. Treat `/work` as a protected member route throughout the route registry, robots and tests; keep public guide pages indexable. No finance/API/DB changes.

## Tasks (TDD)
1. Add regression assertions that `/work` has `isPublic:false`, `authRequired:true`, `indexable:false`, is absent from sitemap and is disallowed by robots; replace stale positive expectations. Confirm RED on main for classification and crawler restriction.
2. Change only `frontend/src/config/routes.config.ts` to reflect the existing `requireMember()`/noindex contract and add the robots disallow entry. Confirm GREEN focused SEO suite, lint and typecheck.
3. Recheck latest main and all open PRs; run full build/tests/security checks on exact SHA if feasible. Record remaining blockers and Test/Production HOLD. Never write to Production-linked DB, merge, delete branches or promote without all gates.

## Rollback
Revert this isolated branch commit; no migrations, financial writes, runtime restarts or persistent data are involved. Preserve other workers' branches.
