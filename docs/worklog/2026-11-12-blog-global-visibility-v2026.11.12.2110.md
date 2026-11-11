# Blog global publication visibility recovery — v2026.11.12.2110

**Task status:** INVESTIGATION / START. **Owner directive:** 2026-11-12 08:29 KST, restore blog article writing and analyze code/system. English canonical; Korean companion will be created with final release summary.

## Baselines and authority
- Read `docs/INDEX.md`, `docs/CURRENT_DOCUMENTATION_STATUS.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `docs/planning/BLOG_UNVERIFIED_PUBLICATION_OWNER_ADDENDUM_v2026.11.09.1946.md`, `docs/DOCUMENTATION_POLICY.md` and `AGENTS.md` (relevant portions); task branch from fresh `origin/main` 53fb23cd2c.
- Dedicated worktree avoids changes to Gemini or the existing `main` checkout. Financial APIs, balances, source approvals, existing JSON stores and the publisher are out of scope for frontend-only fix.

## Reproduction before change
- Blog publisher timer active; 2026-11-12 08:07:44 KST `CN/CODING` PUBLISHED/UNVERIFIED to `/srv/moneyverse-data/shared/blog-unverified-posts.json`.
- Nginx `/zh/blog` and its canonical CN article return HTTP 200; `/ja/blog`, `/en/blog`, `/api/blog`, and blog sitemap also expose 2026-11-12 native articles. `/blog` (Korean hub) does not show those native-only publications. Source `countryBlogPosts(...)` intentionally filters them out, with no cross-market latest publication discovery.
- Publisher occasionally fails model section verification (2026-11-12 02:08), then retries successfully at 02:48; the 2-hour schedule itself is active. A missing specific locale posting is not proof of worker downtime.

## Plan and gates
- [x] START: inspect runtime, repo authority, main, output store, canonical routes.
- [ ] RED: add regression test covering recent native-language public articles in cross-country feed while preserving withdrawn/legacy exclusion.
- [ ] GREEN: add read-only worldwide recent-post panel with native permalink and AI-unverified disclosure, without SEO false translations or opening write APIs.
- [ ] MIDPOINT: fetch/recheck `origin/main`, compare concurrently modified files, run targeted tests and typecheck.
- [ ] TEST: isolated frontend canary and backend read-only health, native links/SSR/sitemap, root and finance smoke checks.
- [ ] RELEASE: follow test and production gates; do not claim release without evidence; record internal and GitHub updates and closeout.

## MIDPOINT — 2026-11-12 08:42 KST
- Re-fetched `origin/main`; unchanged at `53fb23cd2c`, no conflicting edits to the blog source in this worktree.
- RED: two initial regression tests failed because global latest resolver did not exist. GREEN: five relevant suites **19/19 pass**, frontend TypeScript `tsc --noEmit` PASS, Next full production build PASS.
- Deployed a dedicated **Test-only** transient frontend instance at loopback port `4391`, using Test backend `3100` for verified blog reads. Runtime is independent of Production Nginx, balances, services and DB writes.
- E2E via actual SSR: `/`, `/blog`, `/en/blog`, `/ja/blog`, `/zh/blog`, `/api/blog`, `/sitemap-blog.xml`, native CN article all HTTP 200. Incorrect Korean CN article URL HTTP 308 to `/zh/blog/...`.
- Read-only `scripts/qa/blog-global-visibility-check.mjs` yields PASS in isolated Test (`articleCount=14`, freshest CN article within 1 hour) and expected FAIL against pre-change Production (`KOREAN_HUB_MISSING_WORLDWIDE_ARTICLE`). This establishes the observed frontend regression without claiming the publisher itself stopped.
- `moneyverse-blog-v1946.3-publisher.timer` active and 08:07 CN slot inserted; 11/12 02:08 model verification error was recovered at 02:48 retry. The original unverified JSON and financial records were not modified.
- Remaining release gates: commit/PR, CI, exact-SHA official Test identity, Production authorization/gates, exact source revalidation. No Production cutover at this checkpoint.
