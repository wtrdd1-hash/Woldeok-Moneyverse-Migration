# Woldeok Moneyverse — Global Growth, International SEO & Overseas Service Execution Specification

> Version: v2026.10.03.510
> Status: PLANNING / implementation-ready detailed design
> Date: 2026-10-03
> Korean counterpart: [GLOBAL_GROWTH_EXECUTION_SPEC.ko.md](GLOBAL_GROWTH_EXECUTION_SPEC.ko.md)
> Parent authority: [PROJECT_PLAN.md](PROJECT_PLAN.md)
> Parent design: [GLOBAL_GROWTH_SEO_REVENUE_SPEC.md](GLOBAL_GROWTH_SEO_REVENUE_SPEC.md)
> Runtime completion: NOT CLAIMED

## 1. Purpose and authority

This specification turns the v507/v509 global-growth authority into an executable backlog. It does not replace the parent design; it defines the concrete state models, data contracts, rollout gates, QA, observability and acceptance criteria required before implementation can be called complete.

Non-negotiable authority:
- Korean (`ko`) is the product/public fallback locale.
- Explicit locale URL and a saved manual language choice outrank GeoIP and `Accept-Language`.
- GeoIP is a recommendation/bootstrap signal, not a search canonicalization mechanism.
- Locale, jurisdiction, billing country, age policy, timezone and consent region are independent dimensions.
- Search growth is people-first and value-gated; page-count targets never authorize thin/scaled content.
- Cash monetization remains advertising-only until business/tax/legal authority explicitly changes it.
- Private, account, security, transaction and operator surfaces are excluded from public SEO/ad inventory.

## 2. Exact-main implementation gap register

Baseline inspected: `origin/main=ac4dd484a90b266d945993d7bd8be57a74e8e1df`.

| Gap | Severity | Current evidence | Required target |
|---|---|---|---|
| G510-LOC-01 | P0 authority drift | `frontend/src/lib/locale.ts` still sets `DEFAULT_LOCALE='en'` and unsupported languages fall back to English | runtime fallback becomes `ko`; tests prove no hidden English-default path |
| G510-LOC-02 | P1 | GeoIP detection writes inferred locale into the long-lived `LOCALE_COOKIE` used as manual preference | inferred recommendation uses a separate short-lived signal; only explicit user action writes manual preference |
| G510-LOC-03 | P1 | TW/HK/MO/SG/CN are collapsed into one `zh` path and Simplified-Chinese SEO tag | script/market handling is explicit; Traditional Chinese is not silently served as Simplified Chinese |
| G510-LOC-04 | P1 VERIFY | prefixed URL is internally rewritten while layout/metadata read request cookies; first-hit URL locale may diverge from SSR `html lang`/metadata | render probe proves URL locale, `html lang`, visible language, canonical and OG language match on first request with empty cookies |
| G510-LOC-05 | P1 | unsupported prefixes such as `/fr/*` currently redirect to English | unpublished/unsupported locale behavior is explicit and must not create misleading cross-language canonicalization |
| G510-SEO-01 | P0 truth | backend GSC analytics fabricates time series with `Math.random()`; frontend fallback fabricates clicks/impressions and reports credentials | production exposes `NOT_CONNECTED/FETCH_ERROR/NO_DATA/LIVE`; synthetic fixtures are test-only and visibly labelled |
| G510-SEO-02 | P1 | backend still calls Google's deprecated unauthenticated sitemap ping endpoint and converts failure to status 200 | remove deprecated ping; use robots.txt + Search Console/API submission and truthful result states |
| G510-SEO-03 | P1 | sitemap generation emits locale alternates mechanically for all registered routes | alternates are emitted only for published, 200, quality-approved equivalents |
| G510-SEO-04 | P1 | static sitemap `lastmod` uses fixed release timestamps independent of content source freshness | `lastmod` comes from meaningful indexed-content modification authority |
| G510-PSEO-01 | P1 | 200+ popular stock preset URLs are admitted by configuration alone | every family passes distinct-intent, unique computation/data, sample QA, duplication and retirement gates |
| G510-I18N-01 | P1 | some locale metadata is translated while visible page body remains predominantly Korean | indexability requires visible primary-content parity, not metadata-only localization |
| G510-OBS-01 | P1 | SEO admin surfaces can present fallback/synthetic values as if operational | every metric carries source, observedAt, freshness, status and artifact reference |

## 3. Locale, country and user-preference architecture

### 3.1 Server-owned context

Every request resolves a `LocaleContext`:
`{urlLocale,savedLocale,recommendedLocale,effectiveLocale,jurisdiction,billingCountry,timeZone,currency,consentRegion,agePolicy,sourceSignals,policyVersion}`.

Rules:
1. A valid explicit locale URL determines the content locale for that URL.
2. A manual saved locale determines app/UI preference when no explicit URL locale exists.
3. GeoIP and `Accept-Language` may set `recommendedLocale`, never silently convert into a manual preference.
4. Korean is the final product/public fallback.
5. Locale switching never changes jurisdiction, age, payment, ad-consent or regulated-feature eligibility.
6. Search crawlers get ordinary public behavior for the requested URL; crawler identity never grants data access.
7. The raw IP is not persisted merely to choose a language. Persist only coarse derived country where a documented purpose and retention rule exist.

### 3.2 URL contract

- Korean canonical: unprefixed root/path, e.g. `/tools`.
- `/ko/*`: permanent redirect alias to the unprefixed Korean canonical.
- Other published locales: stable prefix, e.g. `/en/*`, `/ja/*`, later `/de/*`, `/fr/*`, `/es/*`, `/pt-br/*`.
- Create regional variants such as `en-GB` only when visible content/policy materially differs.
- A locale prefix is routable/indexable only after that locale is in `PUBLISHED` state for that route family.
- Unknown/unpublished locale prefixes do not silently become English. Return a reviewed locale-not-available experience with correct 404/noindex semantics, or an explicit permanent migration only when a real replacement exists.
- Query-string language selection is transitional UX only; it cannot be the canonical public URL.

### 3.3 Standards

Use BCP 47 language tags and CLDR locale data for dates, numbers, currencies, plural rules, collation and time zones. HTML declares the effective text-processing language with `lang`; language changes inside UGC/quoted text are marked on the containing element. RTL support is a future locale gate, not a CSS afterthought.

## 4. Translation and localization lifecycle

Each maintained translatable asset stores:
`{assetId,sourceLocale,sourceHash,targetLocale,status,method,translator,reviewer,glossaryVersion,legalReview,seoReview,updatedAt,publishedAt,staleAt}`.

Allowed states:
`SOURCE -> MACHINE_DRAFT|HUMAN_DRAFT -> PRODUCT_REVIEW -> NATIVE_REVIEW -> LEGAL_REVIEW(if required) -> SEO_REVIEW -> PUBLISHED -> STALE|REVOKED`.

Publishing rules:
- Machine/AI output is never automatically indexable.
- A changed source hash makes dependent translations `STALE`.
- Legal/privacy/refund/age/safety/casino wording cannot fall back to an old stale translation.
- Public editorial/tool pages require target-language primary-content review before indexability.
- UGC translation is optional, labelled as translated, preserves original access, and does not create a separate indexable duplicate by default.
- Glossary locks Moneyverse terms, WLD/WDX names, fictional company names and safety/legal terms.
- Layout QA checks expansion/contraction, CJK line breaks, long German/French strings, pluralization and locale-specific number/date rendering.
- Translation quality metrics are diagnostic: missing-key rate, stale-asset count, mixed-language detector findings, reviewer rejection rate and user correction/report rate.

## 5. Search document and route authority

Create one server-owned `SeoDocument` per indexable URL:
`{url,pageType,locale,title,description,h1,canonical,indexDirective,hreflangSet,structuredDataTypes,primaryImage,lastmod,contentHash,sourceUpdatedAt,qualityState,adEligibility,owner}`.

Route registry adds:
`{routeFamily,publicState,authRequired,localeStates,canonicalPolicy,sitemapFamily,crawlPriority,structuredDataPolicy,ugcPolicy,adPolicy,retirementPolicy}`.

Only the SEO read model may serialize canonical, robots meta, sitemap entries, hreflang and structured-data locale strings. Client code must not independently invent competing canonical or locale states.

## 6. Sitemap, canonical, hreflang and submission contract

A URL enters a sitemap only when all are true: Production host, HTTP 200, canonical, indexable, quality-approved, published locale, non-private and not a redirect alias.

- One canonical authority per URL.
- Reciprocal hreflang contains only actual published equivalents and includes self.
- `x-default` points to Korean fallback until a genuinely neutral selector exists.
- `lastmod` changes only when indexed content meaningfully changes; request time and deployment time are not automatic substitutes.
- Segment sitemaps by locale + landing family for monitoring; split before protocol limits.
- robots.txt advertises the sitemap index.
- Google: submit/monitor through Search Console or Search Console API; the deprecated unauthenticated sitemap ping endpoint is removed.
- IndexNow: submit only added/updated/deleted canonical public URLs, retain truthful response codes and back off on 429.
- Search submission success means “accepted notification”, never “indexed/ranked”.

Release blockers:
canonical split, hreflang non-reciprocity, alternate 404/redirect-only target, private URL in sitemap, stale fake lastmod, Production URL pointing to Test, mixed protocol/host, or structured data materially diverging from visible content.

## 7. Search-demand evidence system

Store each observation as:
`{provider,property,market,language,query,landingFamily,metric,period,value,status,observedAt,expiresAt,artifactRef}`.

Evidence classes:
`LIVE_GSC, LIVE_NAVER, LIVE_INDEXNOW_RESULT, KEYWORD_PLANNER_ESTIMATE, OTHER_PROVIDER_ESTIMATE, SYNTHETIC_TEST_ONLY, NO_DATA, NOT_CONNECTED, FETCH_ERROR`.

Production dashboards must never substitute `SYNTHETIC_TEST_ONLY` for missing live data. A missing connector shows an actionable disconnected state.

Opportunity queues:
- high impression / low CTR;
- position 5–20 improvement;
- rising sustained query;
- proven Korean page with overseas country-language demand;
- high landing traffic / low second action;
- high activation / low discovery;
- cannibalization/duplicate cluster;
- stale declining page;
- image/video opportunity;
- no-result/internal-search demand.

## 8. People-first content and pSEO admission/retirement

Every page family must define a real user task before keyword research. Eligible main content may be a calculator, simulator, data comparison, guide, glossary/entity explanation, moderated discussion or media explainer.

A generated page is admitted only if:
1. distinct intent/entity/task exists;
2. result changes from unique source data or computation, not token substitution;
3. useful primary result is visible before ads;
4. source and effective date are available for time-sensitive facts;
5. title/H1/body are not near-duplicates of sibling pages;
6. internal links are task-relevant;
7. search/user value can be measured;
8. owner and refresh SLA exist;
9. legal/safety claims have appropriate review;
10. deindex/consolidation behavior is defined.

Family launch gate:
- prelaunch sample: at least 30 URLs or 10% of family, whichever is larger, capped at 200;
- zero broken canonical/hreflang/private-data defects in sample;
- duplicate/near-duplicate findings triaged before indexation;
- no automated locale is published without locale review.

Retirement triggers:
- expired/incorrect source data;
- no distinct utility after consolidation review;
- persistent zero qualified discovery plus zero downstream product value after a sufficient observation window;
- high duplicate/cannibalization rate;
- compliance/trust risk;
- abandoned owner or refresh SLA.

Retired pages use 301/308 only for a true replacement; otherwise 404/410 and sitemap/hreflang removal.

## 9. Overseas product feature epics

G510-F01 Public utilities: percentage/compound/break-even/unit-currency/world-time plus Moneyverse-specific earning, business, item, WDX and economy simulators. Core answer works signed out.
G510-F02 Localized onboarding: language chooser, “continue in Korean/English/etc.”, first useful task, locale-aware examples, timezone and number formatting.
G510-F03 Knowledge graph: glossary, fictional companies/sectors, jobs, businesses, collections, quests, events and durable help pages with entity relationships.
G510-F04 International discovery: locale/language filters, country/locale trend surfaces only with sufficient aggregate data, and safe public profiles/community hubs.
G510-F05 Translation UX: optional labelled UGC translation, original toggle, report translation error, glossary-aware rendering.
G510-F06 Timezone/event layer: local event time, countdown, DST-safe scheduling, calendar export and “your local time” explanations.
G510-F07 Retention: saved calculators/presets, recently viewed guides, weekly recap, comeback missions and locale-aware notification preferences.
G510-F08 Share/distribution: localized share cards, OG metadata, high-quality images and deep links that preserve intended locale without leaking private state.

## 10. Market-readiness and rollout gates

A market/locale has status `DISCOVERY -> DESIGN -> TRANSLATION -> COMPLIANCE_REVIEW -> TEST -> LIMITED_LAUNCH -> SCALE|HOLD|ROLLBACK`.

Required readiness dimensions:
search demand evidence, translation quality, locale UX, legal/privacy/ads review, moderation capacity, performance, support, analytics, ad consent readiness and unit economics.

Initial waves:
- KR/ko: baseline and authority-repair first.
- EN: US/GB/CA-English/AU/NZ/IE after Korean-default runtime repair and English visible-content parity.
- JA/JP: native review, locale-specific typography/search intent and market policy review.
- DE/FR/ES + EEA markets: certified CMP/ad-consent path, member-state child-consent age policy, DSA minor protections and native review.
- pt-BR/BR: Portuguese localization plus Brazil-specific privacy/legal evidence.
- zh-TW/TW: Traditional Chinese is a separate locale decision; do not reuse `zh-CN` content.
- Mainland China: separate distribution/compliance project; not enabled by ordinary locale rollout.

No market moves to SCALE from macro ad-market size alone. It needs Moneyverse-measured qualified traffic, retention, trust/performance and incremental contribution.

## 11. Advertising and consent architecture

Default international posture is contextual/non-personalized advertising unless a market-specific policy explicitly permits more.

Each request resolves:
`AdPolicy{market,ageBand,consentState,pageSensitivity,personalizationAllowed,adAllowed,vendorPolicyVersion}`.

Hard no-ad surfaces remain wallet, transfer, lending, orders/checkout, account/security, private messages, admin/operator, casino/chance and legally sensitive consent flows.

EEA/UK/Switzerland personalized ads require the applicable Google-certified CMP/TCF path and valid consent handling. Minors do not receive profiling-based personalized ads where prohibited. Consent denial must not fabricate analytics success or break core product access.

Ad experiments record configuration, traffic allocation, Page RPM, finalized revenue, viewability/coverage when available, LCP/INP/CLS, task completion, retention, accidental-click complaints, invalid-traffic warnings and rollback.

## 12. Performance, accessibility and international UX budgets

Release targets for public acquisition templates:
- p75 LCP <= 2.5s, INP < 200ms, CLS < 0.1 on supported field data where available;
- no layout shift caused by ad/media slot insertion;
- primary content available without client-only fetch dependency;
- locale switch usable with keyboard and screen reader;
- `html lang` matches the predominant visible language on first response;
- foreign-language passages/UGC use language-of-parts markup where practical;
- focus is not obscured by sticky ad/consent/navigation UI;
- target-size and keyboard navigation follow WCAG 2.2 AA project baseline;
- long localized strings do not clip at the project's required responsive viewports;
- text direction, font coverage, number/date/currency formatting are locale-correct.

## 13. Analytics and KPI event contract

Core events:
`seo_landing_view, utility_started, utility_completed, second_useful_action, signup_started, signup_completed, activation_completed, guide_to_feature_click, language_suggested, language_selected, translation_requested, translation_error_reported, ad_eligible_view, consent_state_changed`.

Dimensions are allowlisted and privacy-reviewed: locale, coarse market, landingFamily, deviceClass, sourceClass, experimentId. Do not log raw search query strings containing user identifiers, raw IP solely for analytics, private balances or message content.

KPI tree:
search -> qualified landing -> second useful action -> signup -> activation -> D1/D7/D30 -> qualified pageviews -> finalized ad revenue -> contribution after attributable cost.

Every dashboard shows denominator, date window, provenance, freshness and missing-data status.

## 14. Admin control plane

Add operator views for:
- locale registry and publish state;
- missing/stale translations and source-hash drift;
- hreflang/canonical/sitemap parity;
- indexability route registry;
- search evidence status and connector health;
- pSEO family admission/sample/retirement state;
- country/locale rollout readiness;
- ad eligibility/consent policy;
- Core Web Vitals and render probes;
- URL retirement/redirect history;
- emergency locale/page-family noindex/kill switch with immutable audit.

Four-eyes approval is required for legal/safety locale publication, bulk indexability changes, mass redirects and ad-policy changes.

## 15. Test matrix and release blockers

Automated tests:
- empty-cookie first request for every published locale URL;
- explicit URL > saved preference > recommendation > Korean fallback precedence;
- inferred locale never becomes manual preference without user action;
- locale switch cannot alter jurisdiction/age/payment/ad eligibility;
- `html lang`, title, H1, body language, canonical, OG locale and hreflang agree;
- every hreflang target returns expected 200 canonical content;
- unpublished locale is excluded from sitemap/hreflang;
- Test host and private routes are noindex;
- GSC disconnected/error path returns no fabricated metrics;
- deprecated Google sitemap ping is absent;
- IndexNow response code is preserved truthfully;
- meaningful source change updates lastmod; deploy-only change does not;
- pSEO duplicate/empty/invalid-data fixtures fail admission;
- structured data is visible-content consistent;
- UGC translation is labelled and does not become an unreviewed duplicate page;
- ad hard-block routes remain ad-free across locale/market/consent permutations.

Manual QA:
native-language review, 320/375/768/1024/1440+ responsive passes, keyboard/screen-reader pass, slow-network render, crawler render comparison, consent flows, and market-specific legal wording.

Any private indexing, fabricated operational metric, canonical split, locale/jurisdiction bypass, unsupported paid/regulated behavior, or material cloaking blocks promotion.

## 16. Implementation sequence

Phase A — truth repair: Korean default, preference separation, GSC fake-data removal, deprecated Google ping removal, truthful SEO status.
Phase B — SEO authority: SeoDocument/route registry, published-locale sitemap/hreflang generator, render probes, lastmod authority.
Phase C — localization platform: BCP47/CLDR registry, translation lifecycle, stale detection, admin QA.
Phase D — first overseas value: EN/JA proven utilities + onboarding + knowledge + timezone/event layer.
Phase E — search operations: evidence warehouse, opportunity queues, pSEO admission/retirement, image/video workflows.
Phase F — compliant monetization: market consent/ad policy, measured experiments, contribution dashboards.
Phase G — additional locales one at a time after readiness gates.

Each runtime phase uses a new branch from then-current main, exact-SHA Test deployment, backend/frontend health and required QA before zero-downtime Production promotion.

## 17. Definition of Done

v510 planning is complete when current code gaps, target data models, overseas feature epics, search/content gates, market readiness, ad/consent rules, analytics, admin tooling, QA and phased implementation are explicit in EN/KO and linked from current planning authority.

Runtime completion is a separate claim and requires exact implementation/Test/Production evidence.

## 18. Primary-source registry checked for v510

Search/international:
- Google localized versions: https://developers.google.com/search/docs/specialty/international/localized-versions
- Google multi-regional/multilingual sites: https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
- Google locale-adaptive crawling: https://developers.google.com/search/docs/specialty/international/locale-adaptive-pages
- Google spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Google people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google canonicalization: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Google sitemap guidance: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google sitemap-ping deprecation: https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping
- Google JavaScript SEO: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Google structured-data policy: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Google Images: https://developers.google.com/search/docs/appearance/google-images
- Google Video: https://developers.google.com/search/docs/appearance/video
- Google Discover: https://developers.google.com/search/docs/appearance/google-discover
- Google Core Web Vitals: https://developers.google.com/search/docs/appearance/core-web-vitals
- Google Search Console start: https://developers.google.com/search/docs/monitor-debug/search-console-start
- Google Keyword Planner: https://support.google.com/google-ads/answer/7337243
- Naver robots/search guidance: https://searchadvisor.naver.com/guide/seo-basic-robots
- Naver robots meta/preferred URL: https://searchadvisor.naver.com/guide/markup-structure
- IndexNow protocol: https://www.indexnow.org/documentation

Internationalization/accessibility:
- IETF BCP 47 / RFC 5646: https://www.rfc-editor.org/info/rfc5646/
- Unicode CLDR / UTS #35: https://www.unicode.org/reports/tr35/
- W3C language declaration: https://www.w3.org/International/questions/qa-html-language-declarations.html
- WCAG 2.2: https://www.w3.org/TR/WCAG22/

Ads/privacy/minors:
- AdSense certified CMP requirements: https://support.google.com/adsense/answer/13554116
- AdSense personalized/non-personalized ads: https://support.google.com/adsense/answer/9007336
- AdSense invalid traffic: https://support.google.com/adsense/answer/1348752
- EU Digital Services Act: https://eur-lex.europa.eu/eli/reg/2022/2065/oj/eng
- European Commission children/GDPR guidance: https://commission.europa.eu/law/law-topic/data-protection/information-individuals_en
- FTC COPPA final-rule materials: https://www.ftc.gov/legal-library/browse/federal-register-notices/16-cfr-part-312-coppa-final-rule-amendments

These sources define implementation constraints; they do not guarantee ranking, traffic, ad RPM or legal approval in a market.

## 19. Reference-corpus evidence

The v510 deep-planning cycle ran a new independent Crossref discovery corpus across 30 lanes spanning SEO/IR, multilingual/localization, translation quality, crawl/index/canonical, structured data, performance/accessibility, content quality/spam, analytics/recommenders/retention, advertising/fraud/privacy, international marketing/cross-cultural UX, NLP/generative search, knowledge graphs, mobile/conversion, UGC safety and privacy regulation.

- raw records: **210,000**;
- within-v510 DOI-first/title-fallback deduplicated candidates: **121,320**;
- collection errors: **0**;
- manifest SHA-256: `f16c6deceb18fa96fdd7b1132b2fc58e13f908899d477c9ce252a897adae7704`.

The earlier v507 corpus remains independent (150,000 raw / 121,810 within-cycle deduplicated). The two cycles total 360,000 raw retrievals, but no combined unique count is claimed because they were not globally cross-deduplicated.

Detailed evidence and exact-main findings: [v510 deep research review](../findings/MONEYVERSE_GLOBAL_GROWTH_DEEP_RESEARCH_REVIEW_v2026.10.03.510.md).
