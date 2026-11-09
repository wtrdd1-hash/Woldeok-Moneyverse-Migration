# v2026.11.09.1778 — Blog production/runtime vs GitHub main audit

## Before work — 2026-11-09 KST
- Owner requested a fresh inspection and comparison of the actual miniPC blog implementation against GitHub `main`, with corrective action where supported.
- Priority read: `AGENTS.md`, `docs/DOCUMENTATION_POLICY.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `DOCS_INDEX.md`, v1405 2-hour blog specification, and v1625 blog runtime worklog. The planning authority predates many later runtime releases; runtime facts require fresh evidence.
- Local web checkout and fetched `origin/main` are **b2980de529eaea505f1387d2bd05e45b7c1c064a**. Existing main worktree has another agent's `implementation_plan.md` edit; leave untouched. This task uses isolated `fix/blog-runtime-audit-20261109-v1778` worktree.
- Read-only host inspection: v1777 backend/frontend systemd services active. Legacy v1419 blog publisher's last attempts on 2026-11-09 failed (`ARTICLE_QUALITY_HOLD:NUMERICAL_CLAIMS_NEED_INDEPENDENT_PROOF`, then timeout). Legacy v1419 timer disabled; legacy v1625 blog frontend unit failed. These facts do not by themselves prove current public-route failure; current Nginx and HTTP probes are pending.
- No database writes, user money changes, deployment, restart, scheduler enable, or article status changes authorized by this checkpoint.

## In progress
- [x] Map actual Nginx upstreams, current live backend/Next app identities, and publication job scheduling.
- [x] Probe actual public-host local Nginx, isolated preview blog hubs, article pages, verified APIs, sitemap, canonical, robots, and ad loader. External HTTPS edge not independently verified.
- [x] Compare code and runtime artifacts to `origin/main` and inspect the Android app GitHub repository; local Android checkout remains incomplete.
- [x] Root-cause confirmed failures, add RED→GREEN tests before focused source correction, validate independent miniPC preview including official Test backend read-only data.
- [x] Recheck main, rebase without clobbering concurrent work, open PR #2982, record CI/official Test/Production state. Official exact-SHA Test release and Production promotion remain pending.

## Finished — source and isolated acceptance complete, official Test/Production HOLD
- GitHub PR [#2982](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/2982) opened from isolated task branch on main `8db59f535d`. Candidate source `2f322cffff64f35b3bc54a200f379a7e80ae209c`; CI run `42590789314` in progress when last checked (classify and policy PASS; runtime-check in progress). No merge/Production deploy asserted.
- Exact candidate SHA `2f322cffff64f35b3bc54a200f379a7e80ae209c` Next build PASS (BUILD_ID exact SHA). Standalone isolated frontend 127.0.0.1:4605 using **official Test backend 127.0.0.1:3100** (2 PUBLISHED receipts) passed nine local-host HTTP 200 routes: 4 hubs, 2 actual verified article pages, blog+index sitemaps, robots. Preview stopped. Earlier isolated preview against existing backend 3000 (12 PUBLISHED receipts) passed twelve HTTP 200 checks. Live Production backend 4504 also returns 12; no writes performed.
- The live **Test** `test-main-backend/frontend.service` on 3100/3101 is independently healthy and serves historical Test app versions, **not this PR's exact SHA**; local candidate preview is not the official Test release. The public Production v1777 blog still redirects to `/tools`. No authenticated signed-in continuity, full CI, official exact-SHA Test promotion, new immutable deployment, edge TLS or zero-downtime public release has been proven. These remain release blockers under `docs/RELEASING.md`.
- Owner's no-mandatory-review/verified automatic publication and no-auto-withdraw policy remains unchanged; v1419 timer remains disabled, generator quality/timeout failures unresolved. No DB schema, ledger, accounts, blog receipts, statuses, Nginx, production systemd or scheduled service changed.
- Full notes: `docs/updates/v2026.11.09.1778-blog-internal.md`, `docs/updates/v2026.11.09.1778-blog-github.md`, `docs/changelog/2026-11-09-blog-visibility-v1778.md`; English/Korean paired and indexed.


## Midpoint 1 — verified running-route regression
- Current Nginx config proxies public blog routes to current v1777 frontend **127.0.0.1:4505** and production backend to **127.0.0.1:4504**. Active frontend `/api/version` reports b2980de529, exactly the freshly fetched `main` SHA. The old v1625 unit is not the current public blog upstream; its failure is historical, not proof of a current proxy outage.
- Four live, local public-host HTTP hub probes `/blog`, `/en/blog`, `/ja/blog`, `/zh/blog` return **308 → `/tools`**. `/sitemap-blog.xml` redirects to `/sitemap.xml`. This behavior comes directly from commit `cb56f71c79` v1774 in `frontend/next.config.ts`, not Git drift. Blog metadata explicitly `noindex` and canonical `/tools`; its sitemap file is empty, and index omits blog. Product authority v1405/v1108 still calls for verified published content to remain visible, so record `AUTHORITY_DRIFT` pending coordinated resolution.
- Legacy publisher API `127.0.0.1:3000/api/v1/blog/verified`: HTTP 200, 12 `PUBLISHED` receipt-backed posts (including 2026-11-09 CN computer and JP coding). Runtime timer `moneyverse-verified-blog-v1419.timer` disabled; recent manual publisher attempts failed due numerical-evidence quality hold and generation timeout. No broad automatic generation success can be asserted.
- Proposed focused source fix: restore discoverability only for genuinely discoverable posts, preserve legacy unreviewed AI `noindex`, ensure verified-only native locale sitemap, restore canonical/hreflang and link accessibility. Production scheduler and deployment only after independent gates.

## Midpoint 2 — source RED/GREEN and independent staging
- Source TDD: 7 failing initial SEO/advertising tests before code, 52 GREEN after focused repair. A further global-indexing-switch test first failed, then passed after restoring an explicit sitemap fail-closed gate.
- Final focused run: 10 files / **80 tests PASS**, frontend `tsc --noEmit` PASS, focused ESLint 0 errors / 1 existing warning (`sitemap-static.xml/route.ts` `any`), Next production webpack build exit 0.
- Isolated standalone port 4605 staging (stopped after check), blog API origin 127.0.0.1:3000: HTTP 200 across 4 hubs, 4 native verified details, dedicated/index sitemaps, robots and homepage (12/12); proper native canonicals, no AdSense loader observed. Current production v1777 backend 4504 additionally independently answered verified API 200; both 3000 and 4504 return 12 published posts.
- GitHub `main` advanced mid-work to `8db59f535dc425a86b6fd96ce7068f2a3411210e` (v1781 documentation-only changes, no overlapping files). Rebase once source/docs committed; recheck again before integration.
- Android app GitHub main `ee97ddfc5a93`; miniPC local Android checkout missing `.git/HEAD` and most source files, so full mobile parity is unverified and no mobile code was changed.
