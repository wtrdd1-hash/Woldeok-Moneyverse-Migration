# P0 Localized Route Rewrite Recovery Plan

## Requirement and evidence
Restore existing multilingual public routes that return HTTP 500 only when an internal locale-prefix rewrite is required. `/tools` and physical `/en/blog` already work. The locale header and canonical route must stay correct; do not change auth, DB, API or financial behavior.

## Alternatives
1. Add physical routes for every localized path: extensive, error-prone, duplicates routing.
2. Change all rewrites to HTTP: unsafe for legitimate public HTTPS rewrites.
3. Correct only the loopback internal Next listener scheme: minimal, targeted; choose this. Test public HTTPS preservation and locale/query parity.

## Implementation
1. Add `frontend/src/lib/locale-loopback-rewrite.test.ts` with real `NextRequest`/proxy invocations; reproduce incorrect `https://localhost` header (RED).
2. Add a narrow helper to `frontend/src/proxy.ts` to normalize the scheme only when rewrite origin is loopback, never external; keep locale rewrite query and SSR request headers (GREEN).
3. Verify focused tests, lint/typecheck, build and locale E2E on an isolated local port; record exact SHA and any gates that cannot be run.
4. Re-fetch main, inspect collision with open PRs, document results and create Draft PR. No automatic deployment.

## Rollback
Revert the isolated proxy commit or close Draft PR. No stateful rollback is needed; Production is unchanged until an approved GitOps release.
