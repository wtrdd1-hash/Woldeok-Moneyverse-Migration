# Worklog — v2026.11.03.1712 Blog SEO crawl-truth hardening

**Status: IMPLEMENTED IN ISOLATED SOURCE / LOCAL TEST VERIFIED / OFFICIAL TEST & PRODUCTION NOT DEPLOYED** · English canonical · [한국어](2026-11-03-blog-seo-crawl-v1712.ko.md)

## START — 2026-11-03 KST
- Owner instruction: improve Moneyverse blog organic search exposure without destructive edits. Scope is crawl signals, metadata and indexable-article consistency, not a ranking guarantee.
- Canonical authority consulted: AGENTS.md, docs/DOCUMENTATION_POLICY.md, docs/DOCS_INDEX.md, docs/planning/PROJECT_PLAN.md, docs/planning/INTEGRATED_PLANNING_MASTER.md, adopted v1405 two-hour publishing directive, v1108 no-timed-unpublish policy, v1415 blog QA and v1190 SEO audit. Latest main **8c5caae4e2999ea577ee4df342f8ef83c43582f8**.
- MiniPC primary checkout has unrelated uncommitted security edits; isolated task worktree created at `/srv/moneyverse-data/tasks/seo-blog-v1712/repo`, branch `fix/blog-seo-crawl-quality-v2026.11.03.1712`, rooted at latest main. Never alter the primary checkout or concurrent worktrees.
- Read-only live HTTPS: /blog and /en/blog, /ja/blog, /zh/blog HTTP 200 and index/follow. /robots.txt, /sitemap-blog.xml and /sitemap-index.xml HTTP 200. Blog sitemap has 6 unique locs (4 language hubs + 2 KR articles). Site index currently invents request-time `<lastmod>` for 5 unrelated sitemaps. The visible public hub lists a test-labeled article and source-verification quality is unproven. These are observations, not GSC indexing evidence.
- Independently verified automated publication and real Search Console/AdSense performance remain outside this change; no article, financial DB, migration or member balance modifications authorized.

## Implementation checklist
- [x] RED regression tests for accurate sitemap index modification signals, SEO-disabled blog sitemap, deduplicated public canonicals, and unique blog title metadata.
- [x] GREEN focused blog sitemap, sitemap-index, metadata changes; preserve owner no-auto-unpublish policy and existing published visibility.
- [ ] Source/TS/test verification; check official exact-SHA Test prerequisites and existing CI; no Production promotion absent real validation.
- [ ] MID re-fetch origin/main and compare against concurrent work. Update EN/KO worklog and internal/GitHub-facing changelog, open isolated PR.
- [ ] END exact status, test counts and Test/Production evidence and follow-ups.

## MID — v1712.2
- Created regression tests before code and witnessed **4 expected failures / 9 passes** on the original implementation. Then changed article-sitemap serialization to de-duplicate canonical slugs, omit malformed modification timestamps, and emit zero URLs when `SEO_INDEXING_ENABLED=false`. The index sitemap no longer invents request-time lastmod on five unrelated child sitemaps; its blog date is based on discoverable articles only. Locale hub titles now opt out of duplicated root-brand templates.
- Focused GREEN: 13/13. Broader blog, SEO sitemap and public sitemap submit tests: **52/52 (12 test files)**, contract build PASS, frontend `tsc --noEmit` PASS, changed-file ESLint PASS, `git diff --check` PASS. Full Next production build and official candidate Test/Production smoke NOT RUN at this checkpoint.
- **MID main refetched** and unchanged: `8c5caae4e2999ea577ee4df342f8ef83c43582f8`. Unrelated security worktree remains untouched.
- Host RAM about 1.8 GiB available, with multiple pre-existing long-running Next/pnpm builds. Avoiding an additional concurrent production build on the shared active host; defer that gate to GitHub CI or later isolated resources, not a pass.
- Current official Test front/backend services are active, and public Test serves `noindex,nofollow`; however it serves a previous source identity, **not v1712**. Production remains unchanged and is not credited with this change.

## END — v1712.3 source handoff
- Scope: safe frontend-only SEO source/tests; no new article, publication status, SQL, money, service config or advertisement changed. No SEO rank/impression/CTR/revenue claim. The 2026-10-29 public blog test-labeled article and apparent overlapping generic financial copy require separate owner editorial/source-integrity review; no automatic withdrawal performed under v1108/v1405.
- Local verification: **52 passed, 0 failed** in scoped suite; frontend typecheck, ESLint and contract build PASS. No exact-SHA GitHub CI result or official Test deployment attested as of this record.
- **Gate:** Candidate must pass CI build/full applicable tests, official exact-SHA Test frontend/backend/API/DB/edge + security/session/rollback checks, authoritative financial and migration gates, before no-downtime Production. Current operational environment status is not evidence for this uninstalled candidate.
