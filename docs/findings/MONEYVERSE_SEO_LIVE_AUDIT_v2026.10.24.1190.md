# Moneyverse Production SEO Evidence Audit — v2026.10.24.1190

**Date:** 2026-10-24 KST · **Status:** VERIFIED READ-ONLY FINDINGS / REMEDIATION NOT IMPLEMENTED · **Baseline:** `origin/main 54d5140d`.
**Authority:** `docs/planning/PROJECT_PLAN.md` > `docs/planning/INTEGRATED_PLANNING_MASTER.md` > adopted v1108 policy; this audit does not supersede planning.
**Production:** https://easy-scraping.com · **Caution:** HTTP/indexability checks do NOT establish actual Google indexing, rankings, impressions, CTR, search demand, or revenue.

## Directly reproduced observations
1. Public homepage returned HTTP 200, HTML `robots=index,follow`, HTTP `X-Robots-Tag=index,follow`. `/robots.txt` allows public paths. `/sitemap.xml`, `/sitemap-index.xml`, `/sitemap-blog.xml` returned 200. This verifies the previously documented v1106 all-site noindex regression is not currently reproduced on these public samples.
2. Root sitemap: **1,018 unique URLs**, no duplicate `loc` among those entries. Index sitemap: **6 entries**. Blog sitemap: **28 entries**: 4 locale hubs plus 6 article slugs in each of KO/EN/JA/ZH. Static sitemap: 63; stocks sitemap: 19; board: 2; announcements: 2. Segment counts may overlap the root sitemap and must not be summed as unique site-wide pages.
3. Root sitemap contains **581** routes under `/tools/stock-calculator` (including its index; **57.1%** of root URL entries). The inflated route volume is NOT proof of thin content; uniqueness, CTR, indexed/excluded state and helpfulness need sampled review before admission/retirement decisions.
4. All **1,018** root sitemap entries observed had `lastmod=2026-10-13`, matching a hardcoded `RELEASE_TIMESTAMP` in `frontend/src/app/sitemap.ts`. It is not a verified per-page material-change timestamp, especially with subsequent source/content activity. Follow Google accurate `lastmod` guidance; do not replace with request-time `new Date()`.
5. `/arcade`, `/work` and `/seasons` appeared in root sitemap and delivered HTTP 200 but HTML `robots=noindex,nofollow` (indexability/sitemap mismatch). Conversely, `/admin` and `/login` served HTML `noindex,nofollow` but HTTP `X-Robots-Tag=index,follow`. This is contradictory metadata, not proof those private pages are indexed.
6. Homepage locale paths `/`, `/en`, `/ja`, `/zh` each returned rendered HTML without an `h1` in the sampled server response (the homepage has `h2` headings). `/tools` and sampled calculators had `h1`; treat homepage H1 as a semantic improvement rather than a ranking guarantee.
7. `/blog`, `/en/blog`, `/ja/blog`, `/zh/blog` served localized HTML, self-canonicals, and four locale hreflang alternates. Selected child post `/zh/blog/country-guide-compound` also had correct self-canonical and four alternates. No complete 1,018-URL reciprocal hreflang audit was performed.
8. Selected calculator pages expose repeated `FAQPage` and/or `WebApplication` JSON-LD across inherited and page-level payloads. Consolidate after schema validation, but DO NOT claim a structured-data penalty. Google discontinued FAQ rich results in 2026; FAQ markup is not an expected CTR feature.
9. Public title strings include duplicated branding on some pages (e.g. `/en/blog`, `/tools`); the homepage title uses third-party-brand styling language (“토스 스타일”) rather than service search intent. Review title/helpfulness and avoid unsupported instant precision/returns assertions.
10. `/en/tools/compound-calculator` redirects to `/en/tools/compound-interest-calculator`, which is a valid canonical target (HTTP 200); do not report it as a broken canonical.
11. Latest GitHub main commit describes KR/US/JP/**VN** additional article catalogue, while adopted v1108 four-country editorial scope is KR/US/JP/**CN** and live indexable blog alternates are KO/EN/JA/ZH. Reconcile optional VN expansion versus CN preservation before any SEO rollout. New source commit is not proof of deployed new publication.
12. Search Console/Naver owner data, actual indexed/excluded totals, query-level impressions/clicks/CTR, real organic sessions and conversions were **not accessed**; no search volume or performance uplift estimates are asserted. Shared Nginx access logs are not a reliable property-specific GSC substitute.

## Prioritized remediation / acceptance
- **P0 SEO1190-01:** Production automated crawl contract checks: homepage, 4 blogs, representative calculators, robots, sitemap; `2xx` plus indexability consistency, canonical success, sitemap-only indexable URLs. Auth/admin responses must have matching noindex meta/header and stay excluded from sitemaps; Test stays noindex.
- **P0 SEO1190-02:** Audit `581` calculator candidates by real search demand, independent numerical value, correctness, jurisdiction/year, content uniqueness, internal links and user-task completion. Consolidate low-value variants only after GSC evidence; do not bulk-delete or bulk-noindex.
- **P0 SEO1190-03:** Collect authorized Google Search Console + Naver search results: last 7/28 days by landing page, query, country, device, impressions, clicks, CTR, average position, indexed/excluded reasons; track search landing → calculator completion → related blog → return, privacy-safe.
- **P1 SEO1190-04:** Store genuine material-update timestamps per URL. Remove sitewide fabricated identical `lastmod`. Validate all localized hreflang pairs, including self/reciprocity and published availability.
- **P1 SEO1190-05:** Keep v1108 country-original KR/US/JP/CN editorial and no automatic unpublication. Publish GREEN only on reviewed source/claim/locale/idempotent gates; AMBER human preapproval; RED blocked. Never re-enable unsafe legacy writer to chase volume. Target 2 substantiated, differentiated posts/week initially as an operational experiment; measure quality not post count.
- **P1 SEO1190-06:** Restore semantic homepage H1 for all four locales, unique title/description, useful internal cross-links blog↔calculator↔guide, careful WLD/real-finance distinctions, source dates, transparent author/reviewer. Deduplicate JSON-LD only after Rich Results Test/schema checks.
- **P2 SEO1190-07:** Verify mobile LCP, INP, CLS and 320px task completion with CrUX/PageSpeed and field data rather than inferring from curl or HTML payload.

## Evidence and constraints
Read-only external HTTP on 2026-10-24 KST; XML via stdlib parser and server-rendered HTML parser; sample paths recorded above. Code inspected at baseline SHA. Source: `frontend/src/app/sitemap.ts`, `frontend/src/app/robots.ts`, `frontend/src/app/blog/blog-country-editorial.ts`, current v1108 policy. Google references:
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/specialty/international/localized-versions
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content

**No application code, deployment, DB, published article, Search Console settings, or financial state was modified. This evidence does not authorize Production promotion.**
