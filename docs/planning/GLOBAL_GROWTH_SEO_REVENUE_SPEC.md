# Woldeok Moneyverse — Global Growth, International SEO & Advertising Revenue Specification

> Version: v2026.10.02.507
> Status: PLANNING / architectural design
> Date: 2026-10-02
> Korean counterpart: [GLOBAL_GROWTH_SEO_REVENUE_SPEC.ko.md](GLOBAL_GROWTH_SEO_REVENUE_SPEC.ko.md)
> Parent authority: [PROJECT_PLAN.md](PROJECT_PLAN.md)

## 1. Outcome and non-negotiable constraints

Moneyverse will expand overseas as a **Korean-default global virtual-economy service**. The target is not maximum generated URL count. The target is a compounding loop:

search demand -> useful public tool/content -> second useful action -> signup -> activation -> repeat use -> more qualified pageviews -> measured advertising revenue

Current authority:

- product/public default locale is Korean (ko);
- GeoIP may drive a first-visit language recommendation or chooser default, but indexable public pages are not forced to another locale URL solely by IP;
- explicit locale URL/query and a user's saved language choice always override GeoIP;
- language does not determine legal jurisdiction, billing country, age policy or feature eligibility;
- cash monetization remains advertising-only until business-registration/tax/legal authority explicitly expands it;
- private/economic/security/admin surfaces are not SEO inventory or ad inventory;
- search growth uses qualified human traffic and people-first utility, never thin scaled pages, invalid traffic or fabricated metrics.

This supersedes older product-locale wording that described English as the product default. Documentation governance remains English canonical with Korean synchronized second language.

## 2. Current evidence baseline and authority drift

At start SHA 5a7c658b38853f564983d19f961c689a494dc4b6:

- frontend/src/lib/locale.ts still sets DEFAULT_LOCALE = en;
- source-supported locale union is ko, en, ja and zh;
- current GeoIP behavior maps most non-KR/JP/Chinese-country traffic to English;
- 565 frontend TS/TSX files contain Hangul and 51 files still match binary-English locale patterns;
- backend GSC analytics still contains generated “realistic” time series using Math.random();
- the frontend GSC fallback contains fixed clicks/impressions/query values;
- generated/fallback GSC values are therefore not valid search-volume evidence;
- Production and Test runtime identities differ from current origin/main, so no runtime implementation is claimed by v507.

Runtime remediation requires a separate implementation plan, tests, exact-SHA Test evidence and Production promotion.

## 3. Locale architecture: Korean default with GeoIP-assisted translation

### 3.1 Human-traffic precedence

1. explicit locale URL such as /en/..., /ja/... or /de/...;
2. explicit query locale only inside a controlled language-switch flow;
3. saved user language preference;
4. GeoIP language recommendation/chooser default on indexable public pages; automatic published-locale default is allowed only in non-indexable app onboarding;
5. supported Accept-Language recommendation;
6. Korean fallback.

A manually selected language is durable and is never silently overwritten because the user's IP changes.

### 3.2 Crawlers and explicit language URLs

GeoIP is a UX bootstrap signal, not a canonicalization mechanism.

- Do not IP-redirect Googlebot, Bingbot, NaverBot or another recognized search crawler between language URLs.
- A request to /en/guide/x remains the English URL regardless of request country.
- Every published language URL is self-canonical.
- Reciprocal hreflang lists only true equivalents that are actually published.
- Until a useful neutral selector exists, x-default may point to the Korean root because Korean is the explicit product fallback.
- Draft, stale or mixed-language translations remain noindex and outside sitemaps/hreflang.

### 3.3 Country-to-locale rollout registry

The mapping is server-owned, versioned and limited to published locales. It is separate from jurisdiction policy.

| Wave | Country/market examples | Preferred locale | Launch condition |
|---|---|---|---|
| 0 | KR | ko | default/current core |
| 1A | US, GB, CA-English, AU, NZ, IE | en | English parity + SEO gate |
| 1B | JP | ja | Japanese parity + native review |
| 2A | DE, AT, German-language CH | de | translation + privacy/ad review |
| 2B | FR, French-language BE/CH | fr | translation + privacy/ad review |
| 2C | ES and validated Spanish-speaking markets | es | translation + market review |
| 2D | BR | pt-BR | translation + market review |
| later | TW and reviewed Traditional-Chinese markets | zh-TW | separate demand/compliance approval |
| blocked launch | mainland China commercial targeting | none | dedicated distribution/compliance project |

Unknown/unmapped countries use a supported browser language when available, otherwise Korean.

## 4. Overseas user feature portfolio

Overseas expansion creates product value before additional indexable URLs.

### 4.1 Public utility layer

Build locale-aware utilities that can satisfy standalone search intent:

- percentage increase/decrease calculator;
- compound-growth educational calculator;
- break-even calculator;
- generic currency/unit converter using dated/source-attributed rates where applicable;
- world-time/time-zone converter;
- Moneyverse WLD earning planner;
- virtual job income comparison;
- virtual business break-even simulator;
- virtual item-value comparison;
- fictional WDX scenario simulator;
- virtual-economy inflation/supply simulator;
- quest/reward planning calculator.

A search visitor gets the core result without signup. Saving history, presets, social comparison or continued gameplay may require login.

Do not present real-security price assumptions, tax/legal conclusions, investment recommendations or profit promises as current authoritative facts.

### 4.2 Knowledge and discovery layer

Maintain public clusters for:

- Moneyverse getting-started guides by locale;
- virtual-economy glossary;
- fictional company/sector lore;
- WDX system explanations and event archives;
- jobs, businesses, collections and quest guides;
- safety, moderation and account-help content;
- durable changelog/event explainers;
- public community guides only after moderation/originality/indexability gates.

### 4.3 International retention layer

Prioritize:

- localized first-session onboarding;
- locale-aware date/time/number/currency display;
- user-selectable language independent of country;
- optional labelled translation of UGC;
- language/community discovery filters;
- time-zone-aware event calendar;
- global and country/locale leaderboards with anti-abuse eligibility;
- localized weekly recap and comeback mission;
- localized share cards and achievement summaries;
- saved calculators/presets and recently viewed guides;
- country/locale trend surfaces only from sufficient aggregate data.

## 5. Search-demand operating system

### 5.1 Evidence classes

Every search metric carries one provenance state:

LIVE_SEARCH_CONSOLE, LIVE_NAVER, KEYWORD_PLANNER_ESTIMATE, OTHER_PROVIDER_ESTIMATE, NO_DATA, NOT_CONNECTED, FETCH_ERROR.

Rules:

- Search Console measures actual property impressions, clicks, CTR and position; it is not total market keyword volume.
- Keyword Planner or another named provider may supply estimated market search demand.
- Estimated volume never overwrites actual Search Console performance.
- Synthetic fixtures are allowed only in test/development and are labelled SYNTHETIC_TEST_DATA.
- Production/admin dashboards never present generated numbers as live search performance.

### 5.2 Opportunity queues

Create queues from real data:

- High-impression / low-CTR: improve title, snippet-relevant copy and intent match.
- Position 5–20: deepen utility, internal links, examples, media and topical coverage.
- Rising query: validate sustained demand before publishing.
- Missing landing: create a page only when a distinct user task exists.
- Cannibalization: consolidate competing same-intent URLs.
- Country-language gap: translate/localize pages that already prove demand.
- High-traffic / low-activation: improve product bridge rather than add SEO pages.
- High-activation / low-impression: expand discovery and internal links.
- Revenue-efficient landing: scale adjacent useful content only when retention and quality stay healthy.

### 5.3 Prioritization model

Opportunity = demand evidence × ranking/CTR gap × product relevance × unique utility × localization readiness × retention potential × ad eligibility × compliance confidence.

Each factor stores source and timestamp. Output is a prioritization bucket (P0/P1/P2/HOLD), not a ranking or revenue promise.

## 6. Search architecture for maximum qualified discovery

### 6.1 Search surfaces

Optimize separately for:

- Google/Naver text search;
- Google Images;
- video results;
- Google Discover as supplemental traffic;
- branded and non-branded queries;
- locale/country-specific query clusters.

### 6.2 Technical contract

Every indexable page:

- returns its primary value server-side or through crawl-safe SSR/ISR;
- has exactly one stable self-canonical;
- has one primary language across title, H1, body, navigation and structured-data visible text;
- exposes real crawlable internal links and breadcrumbs;
- enters a sitemap only when canonical, 200, indexable and quality-approved;
- uses truthful lastmod based on meaningful indexed-content changes;
- returns real 404/410 for missing/removed content or a reviewed permanent redirect;
- reserves ad/media layout space to protect CLS;
- targets p75 LCP <= 2.5s, INP < 200ms and CLS < 0.1;
- excludes Test/private/account/admin/transaction routes from the public index.

### 6.3 Multilingual publishing gate

A localized URL becomes indexable only when:

- primary visible copy matches the target locale;
- title/meta/H1/breadcrumbs/alt/structured-data strings are localized;
- navigation and primary CTA are localized;
- canonical points to itself;
- reciprocal hreflang is complete for the published equivalence set;
- translation state is PUBLISHED;
- native-language/product review passes for public editorial content;
- legal/safety text receives required higher review;
- no critical mixed-language fallback remains.

### 6.4 Internal-link graph

Every public page belongs to a hub/spoke graph.

- tool -> relevant guide -> relevant Moneyverse playable feature;
- guide -> glossary/company/event entities;
- company/event -> relevant guide/tool;
- high-authority hub -> reviewed useful children only;
- no orphan indexable pages;
- no giant keyword footer link farms.

Measure orphan count, click depth from root/hub, internal links received and outbound task relevance.

## 7. Programmatic SEO admission gate

There is no fixed “20,000 pages” success target. Programmatic templates are allowed only when each page has independent user value.

Before indexability, each generated family must prove:

1. distinct entity/task/query intent;
2. unique maintained data or computation, not keyword substitution;
3. useful visible result before ads;
4. source/effective date for time-sensitive data;
5. no fabricated current prices, tax rates or legal conclusions;
6. no investment recommendation or profit guarantee;
7. canonical/internal-link/sitemap correctness;
8. quality sampling and duplicate/cannibalization checks;
9. measurable search/engagement purpose;
10. a deindex/consolidation path if quality or demand is weak.

Mass translation or AI generation without additional value is not an SEO strategy.

## 8. Image, video and Discover acquisition

### 8.1 Images

Use relevant original/product illustrations or charts with descriptive filenames and alt text, place them near explanatory text, expose crawlable image URLs, and optimize responsive formats and dimensions.

### 8.2 Video

Create short localized explainers for high-value tools/game systems only when video improves understanding. Embed them on relevant landing pages, provide accurate titles/descriptions/thumbnails and measure Search Console video performance separately.

### 8.3 Discover

Discover is supplemental rather than forecastable baseline traffic. Eligible editorial/event content uses accurate non-clickbait headlines, useful large images and strong page experience.

## 9. Advertising-only global revenue architecture

### 9.1 Revenue truth

For each market/content family:

monthly ad revenue = pageviews / 1,000 × observed Page RPM

Also track session economics:

revenue per 1,000 organic sessions = pages/session × realized page revenue rate

Required dimensions:

country × locale × landing_family × device × source × consent_state

### 9.2 Scenario ladder, not forecast

| Monthly gross ad target | At KRW 5,000 Page RPM | At KRW 10,000 Page RPM | At KRW 20,000 Page RPM |
|---:|---:|---:|---:|
| KRW 1M | 200k PV | 100k PV | 50k PV |
| KRW 5M | 1.0M PV | 500k PV | 250k PV |
| KRW 10M | 2.0M PV | 1.0M PV | 500k PV |

These are arithmetic scenarios. Actual Page RPM, fill, invalid-traffic adjustments, taxes and operating costs determine realized profit.

### 9.3 Market investment rule

incremental contribution = incremental ad revenue - localization - content - moderation - infrastructure - privacy/compliance - support cost

Scale a market only when qualified organic traffic grows, activation/retention stays healthy, realized revenue per session supports incremental cost, performance remains healthy and policy/invalid-traffic risk is clean.

### 9.4 Ad placement

Ads remain limited to reviewed public content. Continue blocking wallet, transfer, lending, orders, private account/security, admin, casino/chance and other sensitive decision surfaces.

## 10. Market rollout strategy

### Phase 0 — Measurement truth and Korean baseline
- fix live search-data provenance before using metrics;
- keep / Korean and make source/runtime default consistent;
- repair mixed-language/cross-language canonical defects;
- establish real query/page/country/device baselines;
- classify every public route by indexability and ad eligibility.

### Phase 1 — English + Japanese
- translate proven high-value public tools/guides first;
- ship English and Japanese onboarding/utility/knowledge parity;
- localize metadata for native search intent;
- launch country-aware discovery and event-time formatting;
- compare qualified search and realized ad economics by market.

### Phase 2 — German, French, Spanish, Brazilian Portuguese
- launch one locale at a time after privacy/advertising and translation gates;
- start from proven templates/content families rather than full-site machine translation;
- require locale-specific search-demand backlog and native review.

### Phase 3 — Scale winning clusters
- expand winning tool/guide/entity clusters;
- add visual/video assets to high-value pages;
- deepen internal-link hubs;
- consolidate or noindex weak/duplicate pages;
- evaluate additional locales from measured demand and operating feasibility.

## 11. KPI tree

Search acquisition:
- submitted vs indexed;
- impressions/clicks/CTR;
- qualified-query count;
- non-brand share;
- top-3/top-10/top-20 distribution as diagnostics;
- image/video/Discover performance;
- country/locale coverage;
- orphan/canonical/hreflang error rates.

Product conversion:
- organic landing -> second useful page;
- signup start -> complete;
- signup -> first activation;
- D1/D7/D30 by landing family/country/locale;
- saved tool/preset adoption;
- repeat direct/organic return rate.

Revenue:
- finalized and estimated ad revenue kept separate;
- Page RPM/ad RPM;
- revenue per 1,000 organic sessions;
- pages per qualified organic session;
- revenue by country/locale/content family/device;
- invalid-traffic adjustments and policy warnings.

Guardrails:
- LCP/INP/CLS;
- translation-quality failures;
- support complaints/moderation burden;
- ad-policy/consent incidents;
- search manual actions;
- thin/duplicate content rate.

## 12. Overseas growth experiment backlog

1. IP-assisted locale for non-search first visits while preserving explicit search URLs.
2. High-impression/low-CTR title and intro rewrite by query cluster.
3. Tool result -> related guide -> signup CTA sequence.
4. Localized onboarding vs generic onboarding.
5. One high-value calculator cluster translated to EN/JA before broad translation.
6. Large original explainer image on eligible guides.
7. Short embedded explainer video on complex tool pages.
8. Search landing “continue in Moneyverse” CTA by content family, never private data.
9. Internal hub strengthening for pages at positions 5–20.
10. Ad load/format experiment with CWV, task completion and invalid-traffic guardrails.

Every experiment has a hypothesis, primary metric, guardrails, minimum evidence window, rollback and provenance.

## 13. Release and QA gates

Runtime implementation cannot be promoted until:

- exact candidate SHA is bound to Test;
- locale precedence tests cover explicit URL, saved preference, GeoIP, browser and Korean fallback;
- crawler tests prove no GeoIP redirect between explicit locale URLs;
- locale change cannot alter jurisdiction eligibility;
- translation completeness and mixed-language scanning pass;
- canonical/hreflang/sitemap assertions pass;
- GSC/Search Advisor disconnected/error states cannot fabricate success data;
- pSEO family quality samples pass duplicate/value checks;
- image/video metadata is visible-content accurate;
- ad route exclusions remain fail-closed;
- mobile/responsive/accessibility and CWV checks pass;
- Test stays noindex;
- zero-downtime Production promotion and rollback follow the existing release contract.

## 14. Research evidence

Broad discovery corpus from the 2026-10-02 SEO research cycle:

- source: Crossref REST API;
- 16 search/IR/SEO/localization/performance/analytics lanes;
- 150,000 raw records;
- 121,810 DOI-first/title-fallback deduplicated discovery candidates;
- manifest SHA-256: 4dc89e5af460f6bbbbea4ae68a923f9cab6b6c8a274eaff5787c77a05d95b729.

This corpus is discovery breadth, not a claim that every candidate was manually reviewed or directly applicable to SEO.

Direct implementation authority comes from current primary guidance recorded in the v507 research review, including Google Search Central/Search Console, Google Ads Keyword Planner, Google AdSense and Naver Search Advisor where applicable. Advertising-market evidence is context only, not a Moneyverse RPM guarantee.

## 15. Definition of Done for this design

v507 planning is complete when:

- Korean product default and GeoIP-assisted precedence are unambiguous;
- overseas feature families and rollout waves are defined;
- search-demand provenance forbids synthetic operational data;
- indexability/pSEO quality gates prevent thin scaled expansion;
- text/image/video/Discover acquisition are represented;
- international ad revenue uses observed market/content economics;
- parent planning documents reference this design in EN/KO;
- no runtime/Test/Production implementation is falsely claimed.

Implementation begins only after this written design is reviewed and a separate implementation plan is approved.
