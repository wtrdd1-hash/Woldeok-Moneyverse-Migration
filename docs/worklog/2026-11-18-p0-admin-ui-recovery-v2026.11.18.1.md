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
- [ ] Identify the safest server-side Next.js candidate and test it on an isolated loopback port.
- [ ] Implement a reversible route/runtime recovery with test-first evidence.
- [ ] Verify admin login protection, CSS/JS assets, API health, and frontend usability.
- [ ] Recheck origin/main and release gates before any production modification.

## Finished
- Not yet; production unchanged by this task at initial checkpoint.
