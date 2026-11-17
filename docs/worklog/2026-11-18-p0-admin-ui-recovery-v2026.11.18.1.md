# v2026.11.18.1 — P0 admin frontend loading-screen recovery

## Before work — 2026-11-18 07:07 KST
- Request: restore `/admin/` stuck at `페이지를 불러오는 중입니다...` on Android browser.
- Inspected AGENTS.md, living project plan (Korean), master development reference, frontend anti-clash specification, 2026-11-17 postmortem, previous SEO upstream repair, and current Nginx/Spring runtime.
- Reproduced: public `/admin/`, `/login`, `/` HTTP 200 but all return the same 475-byte placeholder HTML with no client scripts; `/health` and `/api/version` return JSON 200.
- Nginx `prod_frontend` and `prod_spring` point to the same port 4550. Spring listener is active; no Next.js server is listening on historical frontend ports. Recent frontend Next static artifacts exist at `/srv/moneyverse-data/frontend-static` and a prior Next standalone release is available on disk.
- Root cause category: frontend runtime lost/routed to API fallback; no evidence of database failure.
- Do not alter authentication, financial state, DB, or third-party agent working trees. Preserve existing Nginx and release rollback bytes before changes.
- Workflow: isolated task branch, test on loopback, negative auth/asset/API probes, fresh main recheck, GitHub PR and documented promotion only after passing gates.

## In progress
- [x] Identify the safest server-side Next.js candidate and test it on an isolated loopback port.
- [x] Implement a reversible route/runtime recovery with test-first evidence.
- [x] Verify anonymous admin rejection, CSS/JS assets and API health; authenticated operator/browser positive E2E remains pending.
- [x] Recheck origin/main and release gates; official Test frontend remains 502, so PR integration withheld.

## Finished
- Not yet; production unchanged by this task at initial checkpoint.

### In-progress checkpoint — 2026-11-18 07:24 KST
- Created task branch `fix/p0-admin-ui-recovery-v2026.11.18.1`, pushed worklog and protected runtime patch; PR #3252 opened. `origin/main` rechecked unchanged at `e96e8f81f4`.
- Most recent Nov 17 Next bundle did not boot (stale `next` symlink), then returned 500 because of missing Next server modules. Do not deploy that unverified build.
- Last-known approved frontend release `prod-v2026.11.14.1217-43ab5a5110` runs correctly when using bundled standalone Next 16.4.2 module via `NODE_PATH`, existing private frontend env file and proper Host / X-Forwarded-Proto; validated `/admin`, `/admin/logs`, `/login`, `/api/viewer` 200 on isolated port 4524.
- **Critical access-control finding:** directly requesting standalone Next `/api/v1/admin/users` as anonymous yielded 200 user data; therefore strictly isolate Next to UI only, keep all Spring `/api/v1/*` routes, and enforce `auth_request` to Spring `/api/v1/admin/me` at Nginx for all `/admin*` UI routes. Loopback test gave 302 for unsigned admin and 401 for admin API, with full login HTML and signed-out viewer JSON.
- Isolated Nginx regression: 8/8 PASS (anonymous admin 302, login 200, viewer 200, admin/me 401, CSS 200, JS 200); CSS/JS MIME verified. Runtime service `moneyverse-p0-admin-ui-recovery.service` active on loopback :4524, without stopping Spring or updating database.
- Promoting only after production Nginx config backup, syntax validation, and repeat smoke. Authenticated administrator E2E is not available; do not claim it passed.


### Finished checkpoint — 2026-11-18 07:27 KST (bounded mitigation only)
- **Version v2026.11.18.1:** Protected UI routes in Production Nginx now serve an isolated, persistent Next :4524 (enabled), with prior Nginx bytes retained and graceful reload. No Spring/DB restart, no financial writes.
- **Public HTTP evidence:** Anonymous `/admin`, `/admin/`, `/admin/logs` return 302 login; `/login` 200 actual HTML; `/api/viewer` 200 signed-out; `/api/v1/admin/me` and `/api/v1/admin/users` 401; `/health` 200; CSS/JS 200 including 11/11 browser-UA login assets; canonical private no-store/noindex. All three service units active.
- **References:** PR #3252; backup `/srv/moneyverse-data/ops-backups/p0-admin-ui-v2026.11.18.1/`; [release evidence](../releases/v2026.11.18.1-admin-ui-recovery-prod.md), [internal changelog](../updates/v2026.11.18.1-admin-ui-recovery-internal.md), [GitHub changelog](../updates/v2026.11.18.1-admin-ui-recovery-github.md).
- **Remaining P0 and release hold:** Official Test frontend `/` 502, normal homepage and `/wallet` still placeholders, Discord/Google OAuth starts are still placeholders; authenticated administrator sign-in/browser E2E not observed. Do **not** assert complete application restoration or PR integration. Coordinate the parallel Spring-web worker before broadening the edge cutover.
