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

## Finished — 2026-11-17 13:08 KST (upstream restoration only)
- PR #3237 merged on main b8e6b6c5852db9484d0170a481a4c4bd0278a2b5; GitHub policy CI passed.
- SEO Next upstream :4550 -> :4521; nginx -t PASS, zero-downtime reload PASS. Spring PID 3841715 and Next stage PID 3488515 unchanged.
- Immutable rollback: /srv/moneyverse-data/ops-backups/p0-admin-seo-v2026.11.17.14/moneyverse.nginx.before.
- After release /, /admin, /admin/security, /health, /api/version 200; SEO and audit anonymous 401/no-store/noindex; HTTPS /admin/seo 401; direct Next SEO pages 200; public CSS 200. No placeholder on changed route.
- Residual P0: RSC client navigation 503 caused by Next auth 307, tracked in #3238/v2026.11.17.15. Authenticated-positive browser E2E remains UNVERIFIED.


### In-progress checkpoint — 2026-11-17 13:05 KST
- Guarded patch candidate and localhost-only Nginx Test config written on isolated branch; no Production mutation.
- bash -n and patch --check PASS; candidate changes exactly the single SEO upstream reference.
- Isolated Nginx -t PASS; /health 200; /admin/seo 401; /admin/seo-audit 401; /__test-render 200 with real SEO HTML. Headers private/no-store, noindex; no Spring placeholder. Static CSS at public Nginx edge HTTP 200.
- Security follow-up: some actual /admin/seo RSC requests logged auth_request unexpected 307. Anonymous status 401 PASS; signed-in positive E2E cannot be inferred from this.
- Current main re-read dcc47a0b550492502b73421a45c681b9c482aa87. Stage Next release source SHA 20daef3f6f254f6a0e5b085756a08d4d0d874c9c.
