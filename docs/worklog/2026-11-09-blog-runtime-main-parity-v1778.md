# v2026.11.09.1778 — Blog production/runtime vs GitHub main audit

## Before work — 2026-11-09 KST
- Owner requested a fresh inspection and comparison of the actual miniPC blog implementation against GitHub `main`, with corrective action where supported.
- Priority read: `AGENTS.md`, `docs/DOCUMENTATION_POLICY.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `DOCS_INDEX.md`, v1405 2-hour blog specification, and v1625 blog runtime worklog. The planning authority predates many later runtime releases; runtime facts require fresh evidence.
- Local web checkout and fetched `origin/main` are **b2980de529eaea505f1387d2bd05e45b7c1c064a**. Existing main worktree has another agent's `implementation_plan.md` edit; leave untouched. This task uses isolated `fix/blog-runtime-audit-20261109-v1778` worktree.
- Read-only host inspection: v1777 backend/frontend systemd services active. Legacy v1419 blog publisher's last attempts on 2026-11-09 failed (`ARTICLE_QUALITY_HOLD:NUMERICAL_CLAIMS_NEED_INDEPENDENT_PROOF`, then timeout). Legacy v1419 timer disabled; legacy v1625 blog frontend unit failed. These facts do not by themselves prove current public-route failure; current Nginx and HTTP probes are pending.
- No database writes, user money changes, deployment, restart, scheduler enable, or article status changes authorized by this checkpoint.

## In progress
- [ ] Map actual Nginx upstreams, current live backend/Next app identities, and publication job scheduling.
- [ ] Probe public/localhost blog hubs, article pages, verified API, sitemap, canonical, robots, and ads.
- [ ] Compare code and runtime artifacts to current `origin/main`; inspect the Android application's separate repository.
- [ ] Root-cause confirmed failures, add regression test before any focused source correction, validate in isolated environment.
- [ ] Recheck main and avoid concurrent agent changes; record source CI, Test, Production, and release state accurately.

## Finished
- PENDING.

## Midpoint 1 — verified running-route regression
- Current Nginx config proxies public blog routes to current v1777 frontend **127.0.0.1:4505** and production backend to **127.0.0.1:4504**. Active frontend `/api/version` reports b2980de529, exactly the freshly fetched `main` SHA. The old v1625 unit is not the current public blog upstream; its failure is historical, not proof of a current proxy outage.
- Four live, local public-host HTTP hub probes `/blog`, `/en/blog`, `/ja/blog`, `/zh/blog` return **308 → `/tools`**. `/sitemap-blog.xml` redirects to `/sitemap.xml`. This behavior comes directly from commit `cb56f71c79` v1774 in `frontend/next.config.ts`, not Git drift. Blog metadata explicitly `noindex` and canonical `/tools`; its sitemap file is empty, and index omits blog. Product authority v1405/v1108 still calls for verified published content to remain visible, so record `AUTHORITY_DRIFT` pending coordinated resolution.
- Legacy publisher API `127.0.0.1:3000/api/v1/blog/verified`: HTTP 200, 12 `PUBLISHED` receipt-backed posts (including 2026-11-09 CN computer and JP coding). Runtime timer `moneyverse-verified-blog-v1419.timer` disabled; recent manual publisher attempts failed due numerical-evidence quality hold and generation timeout. No broad automatic generation success can be asserted.
- Proposed focused source fix: restore discoverability only for genuinely discoverable posts, preserve legacy unreviewed AI `noindex`, ensure verified-only native locale sitemap, restore canonical/hreflang and link accessibility. Production scheduler and deployment only after independent gates.
