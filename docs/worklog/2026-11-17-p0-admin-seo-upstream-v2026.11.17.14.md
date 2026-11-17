# v2026.11.17.14 — P0 SEO admin route upstream restoration
Issue: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3236

## Before work — 2026-11-17 13:01 KST
- Read AGENTS.md, project and integrated planning masters, releasing guidance, Spring strangler and verification skills.
- Baseline origin/main dcc47a0b550492502b73421a45c681b9c482aa87; isolated task branch fix/p0-admin-seo-upstream-v2026.11.17.14. Existing main has unrelated untracked Spring static artifacts; do not touch.
- Production Nginx SEO virtual frontend upstream points to Spring :4550. Spring returns 200 and the exact 479-byte placeholder for /admin/seo; SEO Next immutable stage on :4521 returns real admin SEO UI (200). Existing auth_request to Next /api/admin/seo/status anonymously returns 401. Production public anonymous /admin/seo 401, so no bypass is permitted.
- /admin/stocks and /admin/settings 404 independently; separate route inventory needed. /health Spring 200. No account or finance mutation authorized.

## In progress
- [ ] Add reviewed, guarded upstream patch source in task branch.
- [ ] Isolated test virtual host and existing Next backend route; preserve anonymous 401/403 and admin cookies.
- [ ] Check current main again before integration.
- [ ] GitHub PR, checks, main merge, and only then zero-downtime production Nginx reload.
- [ ] Record backup and rollback file; verify public authenticated SEO UI if safe authorized session is available.
- [ ] Monitor edge, backend, frontend and incident log.

## Finished
- **NOT YET COMPLETE.** Deployment and success claims require fresh evidence. Document current production state precisely.
