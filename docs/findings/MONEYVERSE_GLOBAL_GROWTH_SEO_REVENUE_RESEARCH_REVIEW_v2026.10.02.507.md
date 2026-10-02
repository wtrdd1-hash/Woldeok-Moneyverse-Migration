# Moneyverse Global Growth, SEO & Advertising Revenue Research Review — v2026.10.02.507

Status: RESEARCH / planning input
Date: 2026-10-02
Start and mid-work origin/main: 5a7c658b38853f564983d19f961c689a494dc4b6
Planning authority: GLOBAL_GROWTH_SEO_REVENUE_SPEC.md

## 1. Repository and runtime evidence

Current main source evidence:

- frontend/src/lib/locale.ts sets DEFAULT_LOCALE to en and exposes ko/en/ja/zh;
- GeoIP rules currently route most countries to English;
- 565 frontend TS/TSX files contain Hangul;
- 51 frontend TS/TSX files match binary-English locale patterns;
- backend/src/seo/seo.service.ts contains generated realistic time series using Math.random;
- frontend/src/app/api/seo/gsc/route.ts contains fixed clicks/impressions/query fallback values.

These generated/fallback values are not accepted as real Search Console evidence.

Observed runtime identity during this planning cycle:

- Production /api/version: 7080738e656aca099d5c871278d178d69a984fcc;
- Test /api/version and /frontend-version: f61680c6d4b8b8df7598dbf3e29eb9e56f0a7464;
- origin/main: 5a7c658b38853f564983d19f961c689a494dc4b6.

Runtime lineage differs, so this research cycle makes no deployment claim.

## 2. Broad 100k+ discovery corpus

Source: Crossref REST API.

Search lanes covered search engine optimization, information retrieval/ranking, query intent, multilingual IR/localization, crawling/indexing/sitemaps, structured data/semantic web, web performance, search-spam/content quality, CTR/search analytics, organic search/digital marketing, semantic search/knowledge graphs, query expansion/relevance, recommender systems/engagement, NLP/web search, generative AI/search and accessibility/discoverability.

Results:

- raw records: 150,000;
- DOI-first/title-fallback deduplicated candidates: 121,810;
- manifest SHA-256: 4dc89e5af460f6bbbbea4ae68a923f9cab6b6c8a274eaff5787c77a05d95b729.

Interpretation: this is a discovery corpus. It does not claim manual review of 121,810 papers and does not assert that every candidate is directly applicable to SEO. Direct product rules below use checked primary sources.

## 3. Direct-adopt search guidance

Google Search Console Performance reporting:
https://support.google.com/webmasters/answer/7576553

Direct adopt:
- actual property performance uses clicks, impressions, CTR and average position;
- dimensions include query, page, country, device, search appearance and date;
- site performance must not be confused with total market keyword volume.

Google Ads Keyword Planner:
https://support.google.com/google-ads/answer/7337243

Direct adopt:
- use it or an explicitly named equivalent provider for estimated keyword demand;
- store provider, geography, language, time window and estimate date;
- estimates do not replace actual Search Console performance.

Google multilingual/multi-regional guidance:
https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
https://developers.google.com/search/docs/specialty/international/locale-adaptive-pages
https://developers.google.com/search/docs/advanced/crawling/localized-versions

Direct adopt:
- distinct URLs for language versions;
- reciprocal hreflang for true equivalents;
- make visible page language obvious;
- avoid automatic redirection between explicit language versions;
- do not rely on IP-adaptive content as the mechanism for discovering localized search pages.

Moneyverse consequence:
- Korean remains root/default;
- GeoIP is a language recommendation/chooser input on indexable public pages;
- explicit locale URLs do not change by IP;
- non-indexable application onboarding may auto-default a published locale before the user chooses;
- user choice always wins.

Google spam policy:
https://developers.google.com/search/docs/essentials/spam-policies

Direct adopt:
- scaled content generated mainly to manipulate rankings is prohibited;
- translated, AI-generated or stitched content must add real user value;
- Moneyverse removes fixed page-count goals as an SEO success metric.

Core Web Vitals:
https://developers.google.com/search/docs/appearance/core-web-vitals

Direct adopt targets:
- LCP within 2.5 seconds;
- INP below 200 ms;
- CLS below 0.1.

Images:
https://developers.google.com/search/docs/appearance/google-images

Video:
https://developers.google.com/search/docs/appearance/video

Discover:
https://developers.google.com/search/docs/appearance/google-discover

Structured data:
https://developers.google.com/search/docs/appearance/structured-data/sd-policies

Direct adopt:
- search acquisition is broader than blue-link text results;
- media must be relevant, crawlable, performant and accurately described;
- Discover is supplemental and unpredictable, not baseline forecast traffic;
- structured data must represent visible content and does not guarantee a rich result.

## 4. Direct-adopt advertising guidance

Google AdSense Auto Ads experiments:
https://support.google.com/adsense/answer/9726342

Direct adopt:
- compare ad settings with experiments rather than assuming a winning density;
- revenue uplift must be accompanied by user-experience, policy and performance guardrails.

Existing ad authority also retains:
- Page RPM definition;
- invalid-traffic controls;
- publisher policies;
- sensitive-route exclusions.

## 5. Market context, not publisher-RPM evidence

United States:
IAB/PwC reported U.S. internet advertising revenue reached nearly USD 300B in 2025, up 13.9%.
https://www.iab.com/insights/internet-advertising-revenue-report-full-year-2025/

Europe:
IAB Europe reported the 2025 digital advertising market reached EUR 131B, up 10.5%.
https://iabeurope.eu/knowledge_hub/iab-europe-adex-benchmark-2025-report/

Japan:
Dentsu reported 2025 internet advertising expenditures of JPY 4,045.9B, up 10.8%, representing 50.2% of total Japanese ad expenditure.
https://www.dentsu.co.jp/en/news/release/2026/0305-011006.html

Interpretation:
- these markets justify testing localization and search demand;
- they do not predict Moneyverse Page RPM, fill, CTR or profit;
- rollout order still depends on actual Moneyverse search, retention, consent/compliance and realized ad economics.

## 6. Adopted planning conclusions

1. Korean is the product/public fallback.
2. GeoIP powers language recommendation and non-indexed onboarding defaults, not search canonicalization.
3. English and Japanese are first overseas quality-parity waves; DE/FR/ES/pt-BR follow one at a time.
4. Search volume is measured with provenance and never fabricated.
5. Programmatic SEO is value-gated, not page-count-gated.
6. Overseas growth adds useful calculators, virtual-economy utilities, guides/glossary/lore, onboarding, timezone/event support, UGC translation and retention features.
7. Text, image, video and supplemental Discover acquisition are measured independently.
8. Current cash monetization remains advertising-only.
9. Revenue scale decisions use realized Page RPM/revenue per qualified organic session minus incremental operating cost.
10. Code implementation remains blocked until written-spec and implementation-plan review gates are complete.
