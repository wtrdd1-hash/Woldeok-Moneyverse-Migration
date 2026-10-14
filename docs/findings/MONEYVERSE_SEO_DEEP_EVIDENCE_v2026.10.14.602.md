# Moneyverse Live Sitemap & Multilingual Search Audit — v2026.10.14.602

> **Status:** FINDINGS / READ ONLY. Not a Test or Production approval. October 14, 2026 KST. Baseline main `e1517e994daf2516d411597b64c2aae30ab4e1b5`. [Full Korean counterpart](MONEYVERSE_SEO_DEEP_EVIDENCE_v2026.10.14.602.ko.md).

## 1. Observable, reproducible data
Production `https://easy-scraping.com/sitemap.xml` returned HTTP 200. Parsed with Python ElementTree against sitemap and XHTML namespaces.

| Check | Observed | Meaning |
|---|---:|---|
| Sitemap `<loc>` entries | 1,012 | Submitted candidate URLs; **not** Google indexed count |
| Unique `<loc>` values | 1,012 | No duplicate sitemap primary URL |
| `hreflang` alternate links | 9,108 | All 1,012 primary entries have nine locale-code labels |
| Double locale prefixes | 1,026 | Directly malformed patterns: `/en/en/`, `/ja/en/`, etc. |
| Alternate links whose target is not separately a `<loc>` in this same sitemap | 5,766 | Includes duplicate language-code labels and URLs that do respond 200; **not** 5,766 broken links |
| Sample HTTP GETs | 36 / 36 returned 200 | Representative pages accessible, not exhaustive |
| General calculator EN/JA/ZH samples | HTML `lang` reflects locale but title remains Korean; canonical points to KO | Cross-language canonical/content conflict |
| Glossary EN/JA/ZH samples | Translated title and locale-specific canonical | Some routes implement locale contracts correctly |
| Duplicate prefix sample `/en/en/guide/glossary/per` | Returned 200; canonical `/en/guide/glossary/per` | Noncanonical route returned rather than a clean canonical redirect |

**Do not infer ranking impact, traffic loss, broken page count, complete crawl or GSC status from these observations.** Need query/page indexed coverage.

## 2. Root cause from source
In `frontend/src/app/sitemap.ts`, all paths are given an additional `/en`, `/ja`, `/zh` prefix in alternate URL assembly. The same module explicitly invokes `addEntry('/en/guide/glossary')` and counterparts. This creates double prefixes for already-localized paths. Global `RELEASE_TIMESTAMP` is reused for every `lastModified`, which does not guarantee page-specific significant modification.

Locale differentiation currently differs by route: `/en/tools/compound-calculator`, `/en/tools/salary-calculator`, `/en/tools/stock-calculator/chips-minus-20` returned Korean title and KO canonical, while `/en/guide/glossary/per` returned translated title and local canonical. Before modifying hundreds of URLs, classify actual localization, duplicate intent, target country, crawl and traffic performance per URL.

## 3. Truth-layer defects in SEO tooling
- `frontend/src/app/api/admin/seo-audit/route.ts`: hardcodes 99.4%, 99.8%, 100% indexed percentages, healthy crawler states/times, `VALID` schema and calls an URL registry length `totalIndexedUrls`. This cannot be presented as genuine observed Search Console, Naver, or Bing results.
- `frontend/src/app/api/admin/seo/indexing-submit/route.ts`: invokes the retired `www.google.com/ping?sitemap=` endpoint, conflates Promise settlement with successful submission, and uses "Google Indexing API" in the success message. Google's Indexing API supports qualified `JobPosting` or `BroadcastEvent` pages, not ordinary financial calculator indexing.
- **Nuance:** `backend/src/seo/gsc-client.ts` implements an authenticated Search Console client, and `frontend/src/app/api/admin/seo/gsc-sitemap-submit/route.ts` attempts genuine backend submission. The latter also has legacy Google/Bing ping fallback and an unconditional `success:true` response; *some* official API implementation exists. Consolidation and live property validation are the right remediation.
- Several calculator pages emit fixed `AggregateRating` 4.9+ JSON-LD without validated review provenance. Review snippet schema must be grounded in visible, genuine user data.

## 4. Proposed accept/reject contract
For each indexable URL, record `route_id, canonical, title, description, locale, jurisdiction, actual body language, indexability, robots, sitemap membership, hreflang alternates/reciprocity, content last updated, official formula source/effective date, schema eligible, observed GSC property/index inspection, owner, decision`. Decisions: `KEEP_INDEX`, `IMPROVE`, `MERGE_301`, `NOINDEX`, `DEFER`.

Automatic Test probes fail on duplicate locale prefixes, missing own/cross alternates where required, out-of-locale metadata, broken canonical target, source-inconsistent tax formulas, unsubstantiated rating markup, falsified telemetry, conflicting robots/indexability, unsupported FAQ/HowTo rich-result expectations. Do not auto-remove 1,012 pages merely because a check finds suspicious links; preserve a rollback and measured indexed traffic.

## 5. Measurement plan
Connect real authorized Search Console Search Analytics (`page,query,country,device,date`, past 90 days), Sitemap listing and representative URL Inspection; connect Naver collection/index reports separately and Bing Webmaster/IndexNow submission records. Every value must carry provenance, query period, property identity, source timestamp, error/partial status. Distinguish submitted, crawled, indexed and ranking. No GSC production tokens or user data in GitHub.

## 6. Public audit evidence
- [Sitemap count JSON](evidence/strategy-v602/sitemap-counts.json) and [36 public page samples JSON](evidence/strategy-v602/public-seo-sample-36.json), no secret or personal data.

## 7. Live reproduction notes
```sh
curl -fLsS https://easy-scraping.com/sitemap.xml -o /tmp/moneyverse-sitemap.xml
# Parse sitemap XML with sitemaps.org namespace and xhtml:link namespace.
# Inspect `/en/tools/compound-calculator` HTML title, link[rel=canonical], html[lang].
```
Google: [Sitemap ping retirement](https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping), [Search Console Sitemap API](https://developers.google.com/webmaster-tools/v1/sitemaps/submit), [Indexing API rules](https://developers.google.com/search/apis/indexing-api/v3/quickstart), [Sitemap lastmod](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions), [canonical](https://developers.google.com/search/docs/crawling-indexing/canonicalization), [rating markup](https://developers.google.com/search/docs/appearance/structured-data/review-snippet); [Naver crawl](https://searchadvisor.naver.com/guide/report-crawl-refine).

For actionable prioritization, see [strategy](MONEYVERSE_STRATEGY_DEEP_DIVE_v2026.10.14.602.md) and [proposal](../planning/STRATEGY_DIRECTION_PROPOSAL_v2026.10.14.602.md).
