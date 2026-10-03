# Moneyverse Global Growth / International SEO Deep Research Review — v2026.10.03.510

Status: RESEARCH / planning input
Date: 2026-10-03
Exact-main baseline: `ac4dd484a90b266d945993d7bd8be57a74e8e1df`
Planning output: [GLOBAL_GROWTH_EXECUTION_SPEC.md](../planning/GLOBAL_GROWTH_EXECUTION_SPEC.md)

## 1. Scope and evidence discipline

This cycle extends v507 from broad global-growth architecture into implementation-ready internationalization, search, content-quality, retention, advertising/privacy and market-rollout planning.

Evidence is separated into exact repository observations, current primary-source implementation rules, a large discovery corpus for breadth, and unmeasured business hypotheses. Discovery counts are not manual full-text review. Market/ad-size context is not used as a Moneyverse traffic or RPM forecast.

## 2. Exact-main findings

The latest main still differs materially from v509 planning authority. Runtime default/fallback is still English; several Chinese markets share one `zh` path; inferred GeoIP locale is stored in the long-lived preference cookie; unsupported locale prefixes redirect to English; and prefixed first-request rendering needs URL/cookie parity verification.

SEO truth also has open gaps: backend GSC analytics generates synthetic time series, frontend fallback generates synthetic search metrics, the backend still calls Google's retired sitemap ping endpoint, sitemap alternates are emitted mechanically, `lastmod` is release-timestamp based, and 200+ pSEO stock presets are admitted from configuration without the new quality gate.

## 3. New v510 Crossref discovery corpus

Source: Crossref REST API. Date filter: 2015-01-01 through 2026-10-03. Method: 30 query lanes × 7,000 records; DOI-lowercase first deduplication, normalized-title fallback.

- raw retrieved records: **210,000**;
- within-v510 deduplicated candidates: **121,320**;
- API collection errors: **0**;
- unique-manifest SHA-256: `f16c6deceb18fa96fdd7b1132b2fc58e13f908899d477c9ce252a897adae7704`.

The lanes cover SEO, IR/ranking, query intent, multilingual IR, localization, translation quality, crawling/indexing, canonical/sitemap, semantic/structured data, web performance, accessibility, content quality, spam detection, search analytics, recommender systems, community retention, ad measurement, contextual ads, ad fraud, privacy/ads, geo-personalization, international marketing, cross-cultural UX, NLP/search, generative-AI search, knowledge graphs, mobile web, conversion/retention, UGC trust/safety and privacy regulation.

The earlier v507 corpus remains separate: 150,000 raw and 121,810 within-v507 deduplicated candidates, manifest SHA-256 `4dc89e5af460f6bbbbea4ae68a923f9cab6b6c8a274eaff5787c77a05d95b729`.

Across both cycles there were **360,000 raw retrievals**, but a cross-cycle unique count is intentionally not claimed because the two corpora were not globally cross-deduplicated.

## 4. Direct-adopt primary-source rules

Google international-search guidance supports stable language-specific URLs and hreflang for actual localized equivalents; locale-adaptive/IP-dependent behavior is not the discovery mechanism. Moneyverse therefore keeps explicit locale URLs stable and uses GeoIP only as an assistive recommendation signal.

Google's people-first and spam guidance means translated/programmatic families are indexable only when they provide independent user value. Canonical, internal-link, sitemap and redirect signals must agree. `lastmod` reflects meaningful indexed-content modification, not every deploy or request. Google's unauthenticated sitemap ping endpoint is retired, so the current backend ping behavior is a remediation item.

Public acquisition pages must expose useful primary content and stable metadata in crawlable server output. Image, video, Discover and structured data are supplemental search surfaces; structured data must match visible content and does not guarantee a rich result.

Search Console represents actual property performance. Keyword Planner or another named provider represents market-demand estimates. Missing live performance must remain missing/disconnected rather than being replaced by generated values.

## 5. Internationalization and accessibility

BCP 47 provides the language-tag contract and Unicode CLDR/UTS #35 provides locale-sensitive date, number, currency, plural and timezone data. HTML `lang` must match the predominant visible language, with language-of-parts semantics for different-language passages. WCAG 2.2 AA remains the project accessibility baseline for international public surfaces.

Traditional/Simplified Chinese and future RTL locales are explicit localization/product decisions, not cosmetic string substitutions.

## 6. Advertising, privacy and minors

The v510 default international ad posture is contextual/non-personalized until a market-specific policy permits more. Relevant EEA/UK/Swiss publisher consent flows require the applicable certified CMP path; minor protections, member-state child-consent differences and U.S. child-privacy rules are handled as separate policy inputs rather than one global constant.

Invalid traffic, deceptive placement, incentivized interaction and fabricated advertising/search telemetry remain release blockers. These constraints justify a server-owned market/age/consent/page-sensitivity `AdPolicy` rather than a global ad switch.

## 7. Adopted planning conclusions

1. P0 truth repair precedes SEO scale: Korean runtime default and non-fabricated search telemetry.
2. Manual language preference is separated from inferred recommendation.
3. Locale URLs are published by route-family readiness, not globally assumed.
4. One server-owned SEO read model drives canonical, robots, sitemap, hreflang and structured-data locale output.
5. pSEO requires admission, sampled QA, owner/refresh SLA and retirement rules.
6. Translation is a versioned content lifecycle with source-hash staleness.
7. Overseas product value comes before URL volume: utilities, onboarding, knowledge, translation UX, timezone/events, discovery, retention and share surfaces.
8. Market rollout uses a readiness state machine and one-locale-at-a-time progression.
9. Advertising scale requires consent/privacy/minor controls and measured contribution, not macro-market assumptions.
10. Runtime implementation remains a later exact-SHA Test/Production evidence cycle.

## 8. Primary-source registry

The checked registry is maintained in `GLOBAL_GROWTH_EXECUTION_SPEC.md §18` and includes Google Search Central/Search Console/Ads/AdSense, Naver Search Advisor, IndexNow, IETF BCP 47, Unicode CLDR, W3C internationalization/WCAG, EU DSA/data-protection sources and FTC child-privacy materials.

This review is research/planning evidence only. It is not a legal opinion and does not certify a market launch.
