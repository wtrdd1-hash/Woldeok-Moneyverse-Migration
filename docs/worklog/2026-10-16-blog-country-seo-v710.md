# Blog country edition and canonical integrity — v2026.10.16.710

## Before work — 2026-10-16 KST
- Request: audit Search Console's "Duplicate, Google chose different canonical" alert, review all blog features/images, diversify factual blog articles, and provide distinct country-focused KR/US/JP/CN content for SEO.
- Start authority: `origin/main=8ba6b442` (v697); read `AGENTS.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `docs/planning/PROJECT_PLAN.md`, `docs/findings/SEO_LIVE_SEARCH_PAGE_AUDIT_v2026.10.14.605.md`, and image provenance guidance.
- Isolated worktree `/srv/moneyverse-tasks/blog-country-seo-v710`, branch `fix/blog-country-seo-v2026.10.16.710`; concurrent v698 editorial planning and v701 optimization worktrees must remain untouched.
- Screenshot is an aggregate GSC notification without affected URLs, user-declared/Google-selected canonicals, or URL Inspection evidence. It does *not* prove which site path has a canonical error.
- Source findings: `/blog` and `/blog/[slug]` expose Korean-only SSR metadata and swap translations only in client state; daily generation repeats five Korean topic templates; unverified default macro snapshot is presented as fresh real-world readings; slug-substring fallback may return a distinct post at an unrelated URL; `sitemap-blog.xml` uses a continuously changing homepage lastmod. Generated items have no per-country translations. Existing sole hero asset is `/images/blog/compound-interest-72-rule.svg` and other posts generally have no hero images.
- References: Google Search Central canonical troubleshooting, localized URLs/hreflang, image SEO and people-first content; no indexing/ranking promise.

## Plan and gates
- [x] Add regression tests for unique four-country content, canonical slug, localized alternates, sitemap and summary-only browser payload.
- [x] Add a six-subject four-country educational editorial set; serve SSR locale URLs only when complete regional content exists.
- [x] Improve article/hub metadata, image fallbacks, canonical redirects, locale proxy, sitemap and client list serialization without touching live persisted posts.
- [ ] The legacy daily auto-generator was **audited but not replaced**. Publication integrity (unverified market numbers and five recycled templates) remains a P0 gate; separate reviewed publishing workflow is required before release.
- [x] Re-fetch origin/main at mid-work (advanced from v697 to v701), run 14 tests, preview HTTP cases, production build, and check Test backend/frontend read-only. Re-run all on updated main before release.
- [x] Prepare bilingual update notes and record testing/release blockers.
- [ ] Create PR and check CI, then complete Test full verification and required Production gate.

## In progress — checkpoints
- 2026-10-16 01:06 KST: Branch and initial worklog pushed to GitHub; country-specific tests specified before implementation.
- 2026-10-16 01:16 KST: Added 24 complete country editorial bodies, server-rendered country pages, reciprocal locale metadata, merged duplicate slug correction, sitemap, image checks. Tests/typecheck/lint initially pass.
- 2026-10-16 01:23 KST: Next build initially blocked by temporary cross-worktree module symlink; rebuilt dependencies via offline pnpm install and compiled contracts, then successful full frontend production build.
- 2026-10-16 01:25 KST: Standalone HTTP preview on port 4147: /blog, /en/blog, /ja/blog/country-guide-compound, /zh/blog/country-guide-tax, /sitemap-blog.xml returned 200; non-localized legacy article /en/blog/2026-10-12-virtual-stock-value-investing-guide returned 404; known duplicate alias 308. SSR lang/canonical/hreflang sample inspected. Main moved to 1eb65c68 then be0335f3; no other worktrees touched.
- 2026-10-16 01:29 KST: Optimized list payload to summaries (instead of full multilingual article bodies), isolated test data to temp path, updated legacy test to use canonical URL and Node environment. Blog unit suite 14/14 green. Frontend Test/backend Test services active and public Test endpoints respond 200, but exact v710 candidate NOT installed.
- Full security/editorial status: original daily automatic publishing path remains unreviewed and may make unsourced live quantitative claims. The new static regional guides do not use this path. Real GSC URL Inspection evidence is not available from screenshot; do not claim indexing resolution.

## Finished
- Awaiting final exact-main CI, PR and Test release gates. No member balances, Production site, shared live blog store or Test release mutated by this work. Development preview process is temporary and must be stopped.
