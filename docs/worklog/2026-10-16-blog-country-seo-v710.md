# Blog country edition and canonical integrity — v2026.10.16.710

## Before work — 2026-10-16 KST
- Request: audit Search Console's "Duplicate, Google chose different canonical" alert, review all blog features/images, diversify factual blog articles, and provide distinct country-focused KR/US/JP/CN content for SEO.
- Start authority: `origin/main=8ba6b442` (v697); read `AGENTS.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `docs/planning/PROJECT_PLAN.md`, `docs/findings/SEO_LIVE_SEARCH_PAGE_AUDIT_v2026.10.14.605.md`, and image provenance guidance.
- Isolated worktree `/srv/moneyverse-tasks/blog-country-seo-v710`, branch `fix/blog-country-seo-v2026.10.16.710`; concurrent v698 editorial planning and v701 optimization worktrees must remain untouched.
- Screenshot is an aggregate GSC notification without affected URLs, user-declared/Google-selected canonicals, or URL Inspection evidence. It does *not* prove which site path has a canonical error.
- Source findings: `/blog` and `/blog/[slug]` expose Korean-only SSR metadata and swap translations only in client state; daily generation repeats five Korean topic templates; unverified default macro snapshot is presented as fresh real-world readings; slug-substring fallback may return a distinct post at an unrelated URL; `sitemap-blog.xml` uses a continuously changing homepage lastmod. Generated items have no per-country translations. Existing sole hero asset is `/images/blog/compound-interest-72-rule.svg` and other posts generally have no hero images.
- References: Google Search Central canonical troubleshooting, localized URLs/hreflang, image SEO and people-first content; no indexing/ranking promise.

## Plan and gates
- [ ] Write regression tests for country editions, distinct local content, no duplicate slug fallback, SEO alternatives, asset existence and sitemap XML stability.
- [ ] Implement a conservative locale-specific educational editorial set (no fabricated live prices/tax results), retain Korean source, add US/JP/CN-specific, server-rendered canonical URLs only for complete articles.
- [ ] Update the generator, article/hub SSR metadata, image fallbacks and sitemap without disrupting persisted posts or existing APIs.
- [ ] Run lint/tests/typecheck/build, re-fetch origin/main at mid-work, check runtime/Test backend & release rules before any promotion.
- [ ] Record end state, internal/GitHub update logs, PR/CI and production gate.

## In progress
- Worktree exists and documentation examined. No application code, Test, Production, balances or live blog store has been modified.

## Finished
- Pending verification.
