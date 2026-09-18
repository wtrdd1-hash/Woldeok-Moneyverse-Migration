# v2026.09.18.214 — v213 Production release evidence

This is a documentation-only evidence version. Runtime remains v213 exact main `24b85df1e0e5f922e461b1dcea82ec291bf54e48`.

## GitHub gate
- PR #467
- CI #1279 / run `35292212685`: success
- Runtime tree: v213 exact main

## Test
- Frontend release: `/srv/moneyverse-data/releases/test-24b85df1e0e5-ui213`
- Edge service/upstream: `moneyverse-test-ui-v213-main.service` / 3115
- Critical routes: HTTP 200
- Browser: 280/320/390 px responsive/CSP/title/input checks passed; one transient network-change event passed three clean reruns
- Backend PID `1282208` remained unchanged
- Rollback config: `/etc/nginx/backups/moneyverse.before-v213-test-20260918-094530`

## Production
- Frontend release: `/srv/moneyverse-data/releases/prod-24b85df1e0e5-ui213`
- Persistent service/upstream: `moneyverse-frontend.service` / 3001
- Canary 3202 passed before cutover and was stopped after persistent promotion
- Public browser: 27/27 on canary and 27/27 after persistent promotion
- Backend `moneyverse-backend-v196-canary.service` PID `1286971` was not restarted
- Frontend/backend warning journals after promotion: 0 entries
- Rollback anchor remains active on 3201: `moneyverse-frontend-v196-canary.service`

v214 must not trigger a runtime redeploy.
