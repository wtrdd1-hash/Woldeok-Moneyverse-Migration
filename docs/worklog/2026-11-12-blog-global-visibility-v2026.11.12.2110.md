# Blog global publication visibility recovery — v2026.11.12.2110

**Task status:** CODE VERIFIED / RELEASE HOLD (closeout 2026-11-12). **Owner directive:** 2026-11-12 08:29 KST, restore blog article writing and analyze code/system. English canonical; Korean companion will be created with final release summary.

## Baselines and authority
- Read `docs/INDEX.md`, `docs/CURRENT_DOCUMENTATION_STATUS.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `docs/planning/BLOG_UNVERIFIED_PUBLICATION_OWNER_ADDENDUM_v2026.11.09.1946.md`, `docs/DOCUMENTATION_POLICY.md` and `AGENTS.md` (relevant portions); task branch from fresh `origin/main` 53fb23cd2c.
- Dedicated worktree avoids changes to Gemini or the existing `main` checkout. Financial APIs, balances, source approvals, existing JSON stores and the publisher are out of scope for frontend-only fix.

## Reproduction before change
- Blog publisher timer active; 2026-11-12 08:07:44 KST `CN/CODING` PUBLISHED/UNVERIFIED to `/srv/moneyverse-data/shared/blog-unverified-posts.json`.
- Nginx `/zh/blog` and its canonical CN article return HTTP 200; `/ja/blog`, `/en/blog`, `/api/blog`, and blog sitemap also expose 2026-11-12 native articles. `/blog` (Korean hub) does not show those native-only publications. Source `countryBlogPosts(...)` intentionally filters them out, with no cross-market latest publication discovery.
- Publisher occasionally fails model section verification (2026-11-12 02:08), then retries successfully at 02:48; the 2-hour schedule itself is active. A missing specific locale posting is not proof of worker downtime.

## Plan and gates
- [x] START: inspect runtime, repo authority, main, output store, canonical routes.
- [x] RED: add regression test covering recent native-language public articles in cross-country feed while preserving withdrawn/legacy exclusion.
- [x] GREEN: add read-only worldwide recent-post panel with native permalink and AI-unverified disclosure, without SEO false translations or opening write APIs.
- [x] MIDPOINT: fetch/recheck `origin/main`, compare concurrently modified files, run targeted tests and typecheck.
- [x] TEST: isolated frontend canary and backend read-only health, native links/SSR/sitemap, root and finance smoke checks.
- [x] RELEASE: checked official Test and CI status; **Production promotion BLOCKED** pending official exact-SHA Test+CI and remaining release gates. Logged and closed without claiming deployment.

## MIDPOINT — 2026-11-12 08:42 KST
- Re-fetched `origin/main`; unchanged at `53fb23cd2c`, no conflicting edits to the blog source in this worktree.
- RED: two initial regression tests failed because global latest resolver did not exist. GREEN: five relevant suites **19/19 pass**, frontend TypeScript `tsc --noEmit` PASS, Next full production build PASS.
- Deployed a dedicated **Test-only** transient frontend instance at loopback port `4391`, using Test backend `3100` for verified blog reads. Runtime is independent of Production Nginx, balances, services and DB writes.
- E2E via actual SSR: `/`, `/blog`, `/en/blog`, `/ja/blog`, `/zh/blog`, `/api/blog`, `/sitemap-blog.xml`, native CN article all HTTP 200. Incorrect Korean CN article URL HTTP 308 to `/zh/blog/...`.
- Read-only `scripts/qa/blog-global-visibility-check.mjs` yields PASS in isolated Test (`articleCount=14`, freshest CN article within 1 hour) and expected FAIL against pre-change Production (`KOREAN_HUB_MISSING_WORLDWIDE_ARTICLE`). This establishes the observed frontend regression without claiming the publisher itself stopped.
- `moneyverse-blog-v1946.3-publisher.timer` active and 08:07 CN slot inserted; 11/12 02:08 model verification error was recovered at 02:48 retry. The original unverified JSON and financial records were not modified.
- Remaining release gates: commit/PR, CI, exact-SHA official Test identity, Production authorization/gates, exact source revalidation. No Production cutover at this checkpoint.


## END / CLOSEOUT — 2026-11-12 08:46 KST
- **GitHub PR:** [#3088](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3088) (draft, mergeable); first candidate commit `0b6f749f71b4a0125bc6bdd37fc90abc43c3feee`. Branch pushed. Independent Test canary remains at loopback 4391 for review.
- **Required project gate:** official Test frontend/backend currently report SHA `cfc178ab55d95fd4f1e34a62f2d3cf17b932c12a`, **not the candidate**. Therefore full official exact-SHA acceptance did **not** pass. GitHub Actions CI run 43122048660 was `in_progress` at the last check. No approval of merge or Production promotion is implied.
- Final main refresh: origin/main still `53fb23cd2cb86a2cc1029523f557ce312d1d5dba`, and the PR is mergeable; main was not changed by this task.
- Isolated QA rerun PASS: 14 published API entries, newest `2026-11-12-cn-coding-2-unverified` within 0.65h; country-native URL/sitemap confirmed. Public pre-change Production Korean hub still lacks cross-market latest-panel; Production code remains unchanged.
- **Safety:** persisted articles and database were not reset, edited or reclassified; finance/treasury modules and global scheduler untouched; existing Production frontend/backend and Nginx upstreams were not restarted or switched. No Promotion receipt.
- **Next gate before release:** CI success, integrate with freshly checked main, official Test exact SHA, sessions/auth, finance safety, rollback, then zero-downtime Production canary and native/hub/site-map acceptance. Do not infer all-site recovery from this isolated frontend test.
