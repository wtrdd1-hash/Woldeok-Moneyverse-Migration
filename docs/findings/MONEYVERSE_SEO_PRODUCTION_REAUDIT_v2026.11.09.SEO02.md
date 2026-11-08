# Moneyverse Production SEO Re-Audit — SEO02

**Version:** v2026.11.09.002 (documentation-only audit)  
**Status:** PRODUCTION_VERIFIED for sampled HTTP observations; REMEDIATION OPEN; GSC/CWV UNKNOWN  
**Observed:** 2026-11-09 01:05–01:10 KST  
**Repository main:** 5ac2dcfd84c6b2bc2bca7c8859b77f66070a1ced (checked at start and midpoint)  
**Public host:** https://easy-scraping.com  
**Observed release pointer:** production-current → prod-v2026.11.08.1773-5ac2dcfd84  
**Scope:** Read-only live HTTP inspection, local service/compiled-code inspection and authoritative document review; no runtime/DB/financial changes, no deploy.

[한국어](MONEYVERSE_SEO_PRODUCTION_REAUDIT_v2026.11.09.SEO02.ko.md) | [Prior SEO01 audit](MONEYVERSE_SEO_PRODUCTION_AUDIT_v2026.11.08.SEO01.md)

## Method and exact evidence
Read docs/planning/PROJECT_PLAN.md and INTEGRATED_PLANNING_MASTER.md, docs/DOCUMENTATION_POLICY.md, docs/standards/SEO_SITEMAP_INDEXING_STANDARD.ko.md, prior SEO01 report, latest main commit/PR #2942, live sitemap XML, all 53 blog article HTML responses, key public routes and 12 calculator URLs. Evidence persisted on the MiniPC at /srv/moneyverse-data/tasks/seo-audit-20261109-0105/audit.json and summary.json. HTTP and application logs were read-only. This is not a Google Search Console index/ranking verification.

## Measured inventory
| Observation | November 9 result | November 8 SEO01 baseline |
| --- | ---: | ---: |
| Main sitemap entries / unique URL | 1,034 / 1,034 | 1,017 / 1,017 |
| Static sitemap entries / unique URL | 81 / 80 | 62 / not established |
| Sitemap index child sitemaps | 6 | 6 |
| Blog sitemap entries | 57 (4 hubs + 53 articles) | 57 at end of audit |
| Blog article HTTP 200 | 53/53 | 53/53 |
| Blog self-canonical, single H1, index/follow | 53/53 each | 53/53 each |
| Blog distinct rendered titles | 14 | 14 |
| Blog articles in duplicate-title groups | 50/53 across 11 groups | 50/53 across 11 groups |
| Blog descriptions above 160 characters | 51/53 | 51/53 |
| Duplicate URLs across main and static sitemap | 78 | 59 |
| Tool-family main sitemap URLs (including base hub) | 743 | 738 were recorded as tool paths |

Additional blog checks: 53/53 had Open Graph title/image, Twitter card, JSON-LD and at least one hreflang link. These checks confirm technical signals are served, not that Google accepted them. All 12 sampled calculator URLs returned HTTP 200 with one H1, indexable robots and self-canonical. Test hostname robots.txt still blocks all crawling, as required.

## P0 — Repeated blog titles remain in production
Across 53 live article pages, **50 repeat titles** in eleven exact-title clusters. Examples: Korean computer topic 7 pages, US coding 7 pages, Japanese coding 6 pages, US economy 6 pages. These are multiple distinct canonical URLs competing for similar queries; body similarity and source originality require separate editorial comparison. Avoid claiming an algorithmic penalty from duplicate titles alone.

PR #2942 (v1773) changed source to a six-element title-template pool for each country/topic, but the scheduled service moneyverse-verified-blog-v1419.service still runs WorkingDirectory /srv/moneyverse-data/releases/blog-worker-current/backend, which resolves to blog-worker-v2026.11.02.1624-pinned. Its compiled generator still contains the older countryTitles single-title map, not countryTitlesPool. Therefore deploying the v1773 web release pointer did **not** update the active editorial worker. Moreover, slotIndex is 0–11 and selecting a template by slotIndex modulo six is not a durable cross-day, content-aware uniqueness guarantee.

**Acceptance:** production worker provenance is the exact reviewed candidate; actual post generation uses per-article distinct search intent; source citation, title/H1/content novelty checks run transactionally before a publishing receipt; duplicate-title publications zero across a measured rolling period. Review previously published posts individually for unique substantive value rather than mass-renaming titles or deleting financial data.

## P0 — Publisher continuity
The worker timer is active, with its most recent observed trigger 2026-11-09 00:45 KST, but the worker service is failed. Log evidence for the 00:00 editorial slot: MODEL_SECTION_NOT_VERIFIED errors and nonzero exit. A November 8 22:00 JP coding slot did receive a PUBLISHED receipt after earlier quality hold; this is not proof all subsequent two-hour slots succeed. Never bypass source/quality validation merely to meet cadence. Build retry/observability and release worker from the same reviewed source identity without affecting financial services.

## P1 — Sitemap freshness and duplication
Every one of the 1,034 main sitemap URLs and 81 static sitemap entries reported lastmod 2026-11-08T00:00:00Z. Five of six sitemap-index children used that release timestamp, whereas blog updates reflected a real article timestamp. This is more consistent across sitemap files than SEO01, but a uniform release date does not establish the last significant page change for each URL. Verify truthfulness against page or deployment content changes. The static sitemap has one duplicate loc within itself; 78 locs occur in both main and static sitemaps. Normalize one authoritative inclusion strategy. These are quality/maintenance defects, **not automatic search penalties**. Google advises truthful lastmod and states sitemap submission does not guarantee indexing.

## P1 — Title templates and quality-risk sampling
English blog hub no longer has a duplicated site-name suffix. However titles rendered on /treasury, /tools, /stocks and /businesses/ventures still repeat the Korean brand suffix. Fix per-route absolute/title-template composition with regression assertions. A calculator title advertises “2026 latest” and numerical tax allowances; any finance/legal claim must be source-checked with an as-of date, locale/jurisdiction and limitations. The site has 743 tool-family sitemap URLs; only 12 were HTTP sampled. An evidence-based near-duplicate/body usefulness audit of the remaining programmatic SEO URLs is needed. Do not label all such pages spam without proof. AdSense revenue or Search impression improvements were **not measured**.

## Resolved / improved signals
- Live robots.txt explicitly allows /account-deletion and /businesses/ventures, reconciling the two previously reported path-prefix conflicts.
- The /en/blog title now contains the brand only once.
- /treasury, /enterprises and /pension serve canonical links and structured data; these are structural signals, not proof of index status.
- 53/53 article pages return 200, index/follow, self-canonical and a single H1.
- No article title containing the Korean word for “test” was observed in today's 53 title samples. Two older 2026-10-29 financial article URLs remain publicly indexable; editorial provenance and overlap still warrant checking. Do not claim they have been unpublished.

## Measurement gaps and release decision
**UNKNOWN:** actual Google indexed URLs, last 28/30 day clicks/impressions/CTR/query trends, Bing/Naver search visibility, Core Web Vitals p75 and ad RPM. Search engine site: queries cannot substitute for property-authenticated Search Console. Public page HTTP latency observed from the MiniPC is not Core Web Vitals.

**Decision:** SEO remains **PARTIAL / P0 CONTENT-OPERATIONS OPEN**. This report is documentation and server-side evidence only, with no new code, test rollout or production promotion. Remediation must occur on a fresh branch, reconcile concurrent collaborators and current main, pass full CI, isolated Test frontend/backend/DB and SEO regression checks, and then use controlled zero-downtime production promotion. Do not modify the current worker or production services as part of this audit.

References: [PR #2942](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/2942); [Google: title best practices](https://developers.google.com/search/docs/appearance/title-link); [Google: sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap); [Google: scaled content policies](https://developers.google.com/search/docs/essentials/spam-policies).
