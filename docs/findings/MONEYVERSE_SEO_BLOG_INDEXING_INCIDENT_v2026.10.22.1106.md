# v2026.10.22.1106 — Production SEO indexing and blog publication incident

**Evidence date:** 2026-10-22 KST · **State:** `PRODUCTION_VERIFIED` for indexing recovery; `BLOCKED` for AI editorial publication · **Korean:** [translation](MONEYVERSE_SEO_BLOG_INDEXING_INCIDENT_v2026.10.22.1106.ko.md).

## Impact and verified cause

Before repair, actual HTTPS `https://easy-scraping.com/robots.txt` answered `User-Agent: * / Disallow: /`; `sitemap.xml` contained zero URLs; `sitemap-index.xml` contained zero children; public home and blog returned `X-Robots-Tag: noindex, nofollow` plus HTML `noindex` metadata. Exact Production frontend v1083 PID environment and `/etc/moneyverse/v1083-prod-frontend-release.env` explicitly set `SEO_INDEXING_ENABLED=false`. The 2026-10-21 v1083 release smoke checked SEO endpoint **HTTP 200 only**, not indexing semantics. This is a concrete release-gate defect, not evidence Google had deindexed pages.

The frontend `robots.ts`, `sitemap.ts`, `sitemap-*.xml` handlers, metadata, and Next header configuration respect this flag; restoring it requires a fresh frontend build because metadata and Next headers are built with the setting. App/API source SHA was already CI-approved `6a989b5ac0c6155587d43426d64f6def6b62c917`; rebuilding with the corrected config changes artifacts but not tracked source or live backend.

## Blog separately blocked

Production `/api/blog` exposes **six** discoverable educational articles, latest dated 2026-10-15. `sitemap-blog.xml` has 28 four-locale hub/post URLs. Shared legacy `/srv/moneyverse-data/shared/blog-posts.json` contains **181 records but only 12 unique titles**, and has mode **0664**, not the documented emergency 0444; two stored legacy entries bear 2026-10-21 timestamps. No claim is made that they became public or were indexed. Legacy `/api/blog/generate` remains admin 403 / editorial 503 as designed. The verified AI drafting/source ingestion, immutable human approval, publisher, idempotent outbox and scheduled publication path in v975 is **not complete**. Never bulk-release the 175 historical/non-discoverable items, re-enable the old unsourced generator, or chmod the JSON to permit posting without writer ownership and audit.

## Fixed and independently checked

- Incident start / mid logs: `/srv/moneyverse-tasks/Moneyverse-SEO-Blog-{Start,Mid}-v2026.10.22.1106.md`; frontend build: `seo-blog-v1106-build/`; focused Vitest evidence: `seo-blog-v1106-focused-tests.log`; release cutover: `Moneyverse-SEO-Blog-Cutover-v2026.10.22.1106.log`.
- Detached clean worktree of v1083 source; rebuilt Next with `SEO_INDEXING_ENABLED=true` and exact original `BUILD_ID`; helper staged immutable `/srv/moneyverse-data/releases/prod-v2026.10.22.1106-seo-6a989b5ac0c6`. Version number is an operations sequence, not a new application source commit.
- Isolated frontend localhost `:3354` before switching; existing Production backend `:3343 /health` 200; Test backend `:3100 /health` 200. Focused frontend SEO/blog suite **17/17 PASS**. Full authenticated UI/regression and financial gates were not rerun/certified by this frontend-only repair.
- 2026-10-22 06:57:44 KST Nginx **one frontend upstream** changed `3344 -> 3354`; backend upstreams on `3343` and Test mappings stayed unchanged; nginx syntax + reload passed; old frontend remains active as rollback. `production-current` symlink atomically advanced. Existing backend and production DB unchanged.
- Post-cutover public HTTPS probes: `/`, `/blog`, `/en/blog`, `/ja/blog`, `/zh/blog`, `/robots.txt`, `/sitemap.xml`, `/sitemap-index.xml`, `/sitemap-blog.xml`, `/api/blog`, `/api/version`, `/tools`, `/admin/blog`, `/wallet` all HTTP 200. Root/blog published metadata and HTTP headers now `index, follow`. `robots.txt` allows public pages, while excluding account/admin/API paths; root sitemap **1,018 unique loc URLs**, index sitemap **6 unique loc URLs**, blog sitemap **28 unique loc URLs**; sampled XML contained no admin/wallet/account/API locs. Private admin/login/wallet HTML meta remains `noindex, nofollow`.
- Original source SHA reported by public `/api/version` unchanged. Public search engine indexing or Search Console impression increase is **not claimed**.

## Known follow-ups (not fixed by this release)

1. **P0:** old JSON file was writable (0664), old frontend/background services coexist, two unsupervised legacy records were written 2026-10-21. Identify actual writer, coordinate concurrent agents, compare content hashes, retire redundant writers safely, and restore publisher-controlled immutable storage. Do not treat holding old `/api/blog/generate` as proof no legacy writer exists.
2. **P0:** implement v975 source provenance, country-specific verified editorial draft, human revision approval, publisher/outbox and scheduler, targeting **two reviewed useful posts per week initially**; never claim automated publishing until a publish receipt exists.
3. **P1:** Next config globally sends `X-Robots-Tag: index, follow` when enabled, even on `/admin/blog`, `/login` and `/wallet`; page-level metadata still says `noindex`, and robots disallows relevant private paths. Add route-specific HTTP `noindex` to eliminate contradictory signals before declaring complete crawler-policy parity.
4. **P1:** make `robots.txt`, public meta/header and *nonempty index sitemap* semantic probes **mandatory production release gates**, separately preserving Test `noindex`. Confirm crawler accessibility, canonical and 200/404 across sampled sitemap pages, monitor GSC/Naver impressions/CTR, not only HTTP success.
5. **P1:** existing finance ledger/API grants and v530 authenticated UI full QA remain unaccepted; this frontend-only configuration restoration does not certify them.

**Rollback:** protected pre-cutover Nginx config `Moneyverse-SEO-Blog-Nginx-Before-v2026.10.22.1106.conf` plus original immutable `prod-v2026.10.21.1083-6a989b5ac0c6`; restore one frontend upstream, reload nginx and point `production-current` back, without DB restore or stopping serving backend. The scripted cutover protects the rollback path and records its evidence.
