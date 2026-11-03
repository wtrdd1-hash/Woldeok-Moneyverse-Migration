# Worklog — v2026.11.03.1712 Blog SEO crawl-truth hardening

**Status: IN_PROGRESS / NOT DEPLOYED** · English canonical · [한국어](2026-11-03-blog-seo-crawl-v1712.ko.md)

## START — 2026-11-03 KST
- Owner instruction: improve Moneyverse blog organic search exposure without destructive edits. Scope is crawl signals, metadata and indexable-article consistency, not a ranking guarantee.
- Canonical authority consulted: AGENTS.md, docs/DOCUMENTATION_POLICY.md, docs/DOCS_INDEX.md, docs/planning/PROJECT_PLAN.md, docs/planning/INTEGRATED_PLANNING_MASTER.md, adopted v1405 two-hour publishing directive, v1108 no-timed-unpublish policy, v1415 blog QA and v1190 SEO audit. Latest main **8c5caae4e2999ea577ee4df342f8ef83c43582f8**.
- MiniPC primary checkout has unrelated uncommitted security edits; isolated task worktree created at `/srv/moneyverse-data/tasks/seo-blog-v1712/repo`, branch `fix/blog-seo-crawl-quality-v2026.11.03.1712`, rooted at latest main. Never alter the primary checkout or concurrent worktrees.
- Read-only live HTTPS: /blog and /en/blog, /ja/blog, /zh/blog HTTP 200 and index/follow. /robots.txt, /sitemap-blog.xml and /sitemap-index.xml HTTP 200. Blog sitemap has 6 unique locs (4 language hubs + 2 KR articles). Site index currently invents request-time `<lastmod>` for 5 unrelated sitemaps. The visible public hub lists a test-labeled article and source-verification quality is unproven. These are observations, not GSC indexing evidence.
- Independently verified automated publication and real Search Console/AdSense performance remain outside this change; no article, financial DB, migration or member balance modifications authorized.

## Implementation checklist
- [ ] RED regression tests for accurate sitemap index modification signals, SEO-disabled blog sitemap, deduplicated public canonicals, and unique blog title metadata.
- [ ] GREEN focused blog sitemap, sitemap-index, metadata changes; preserve owner no-auto-unpublish policy and existing published visibility.
- [ ] Source/TS/test verification; check official exact-SHA Test prerequisites and existing CI; no Production promotion absent real validation.
- [ ] MID re-fetch origin/main and compare against concurrent work. Update EN/KO worklog and internal/GitHub-facing changelog, open isolated PR.
- [ ] END exact status, test counts and Test/Production evidence and follow-ups.
