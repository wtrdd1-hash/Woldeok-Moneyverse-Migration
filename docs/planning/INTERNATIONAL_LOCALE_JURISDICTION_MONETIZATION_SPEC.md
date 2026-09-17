# Woldeok Moneyverse — International Locale, Jurisdiction & Monetization Specification

> Version: v2026.09.17.177
> Status: Living implementation-oriented product specification
> Date: 2026-09-17
> Korean counterpart: [INTERNATIONAL_LOCALE_JURISDICTION_MONETIZATION_SPEC.ko.md](INTERNATIONAL_LOCALE_JURISDICTION_MONETIZATION_SPEC.ko.md)
> Reference matrix: [INTERNATIONAL_COMPLIANCE_REFERENCE_MATRIX.md](INTERNATIONAL_COMPLIANCE_REFERENCE_MATRIX.md)
> Parent specs: `PROJECT_PLAN.md`, `MONETIZATION_COMPLIANCE_SEO_SPEC.md`, `BILLING_SUBSCRIPTION_CONSUMER_PROTECTION_SPEC.md`, `SEARCH_DISCOVERY_OPERATIONS_SPEC.md`, `MINOR_SAFETY_AGE_ASSURANCE_CONTENT_REMOVAL_SPEC.md`, `CASINO_GAME_SYSTEM_SPEC.md`

## 1. Purpose

Moneyverse must not equate UI language, user location, legal jurisdiction, store country, billing route, or search locale. They are independent dimensions that sometimes correlate but never substitute for each other.

This specification creates one policy system for:

- country/subdivision/channel feature availability;
- age/rating eligibility;
- casino and chance-based feature restrictions;
- subscriptions, one-time digital products and payment-provider/store rules;
- privacy, advertising and child/teen restrictions;
- multilingual UI and natural localization;
- Google Search multilingual/multi-regional discovery;
- legal evidence, release gates and emergency disablement.

Jurisdiction-dependent conclusions remain `legal review required`. Missing or stale legal/rating/store evidence fails closed for money, chance, minors, targeted advertising and regulated functionality.

## 2. Non-negotiable separation: locale != jurisdiction

`locale` controls language, formatting, copy, search metadata and the user's chosen presentation.

`jurisdiction` controls feature legality/eligibility, age floor, rating evidence, billing route, consumer notices, privacy/ads controls and channel availability.

A Korean resident using English remains subject to the applicable Korean product policy. A Japanese-speaking user outside Japan is not automatically put under Japan-only commercial rules. Changing the language selector must never bypass a feature restriction.

Country and language selectors are therefore separate controls:

- **Language:** explicit user choice, persisted independently, never forced by IP.
- **Country/region:** explicit account/commercial setting plus trusted coarse policy signals where legally required; changes to high-risk jurisdiction state may require revalidation.
- **Channel:** web, Google Play Android, Apple App Store iOS, and future channels resolve independently.

## 3. Policy decision engine

Every regulated or monetized action resolves a server-owned, versioned decision before UI exposure and again before mutation.

### 3.1 Inputs

Minimum inputs:

```text
feature_code
country_code
subdivision_code        # state/province when policy requires it
channel                 # web | android_play | ios_appstore | other
age_band
account_status
locale
policy_version
app_version
store_region            # when channel provides a trustworthy region signal
billing_route           # provider/store billing route when relevant
```

Do not infer legal eligibility from `locale`. Do not trust a client-supplied country/age flag as final authority for high-risk functions.

### 3.2 Decision states

```text
ALLOW
ALLOW_WITH_CONTROLS
BLOCK
REVIEW_REQUIRED
TEMPORARILY_DISABLED
```

Every non-ALLOW result returns a stable reason code suitable for UI localization, analytics and support without leaking sensitive risk signals.

### 3.3 Feature codes requiring explicit policy

At minimum:

```text
CORE_ACCOUNT
COMMUNITY_UGC
MARKETPLACE_WLD
SIMULATED_STOCKS
SIMULATED_BANKING
CASINO
CASH_BILLING
SUBSCRIPTION
PAID_COSMETIC
PAID_CONVENIENCE
WLD_CASH_PURCHASE
PAID_RANDOM_ITEM
CONTEXTUAL_ADS
PERSONALIZED_ADS
SPONSORED_CONTENT
```

Global default rules:

- `WLD_CASH_PURCHASE = BLOCK` until a separate legal/economic project changes this.
- `PAID_RANDOM_ITEM = BLOCK` until a dedicated probability-item legal/store design is approved.
- `CASINO` is never enabled by a billing rollout.
- `PERSONALIZED_ADS` defaults off for minors and wherever consent/legal basis is unresolved.

## 4. Jurisdiction policy data model

Recommended entities:

```text
jurisdiction_policy_versions
jurisdiction_feature_rules
jurisdiction_age_rules
jurisdiction_rating_evidence
jurisdiction_store_rules
jurisdiction_privacy_rules
jurisdiction_ad_rules
jurisdiction_billing_rules
jurisdiction_consumer_notices
legal_review_records
policy_kill_switch_events
```

A rule is immutable once used for a transaction/play/consent. New law or store policy creates a new effective-dated version.

`legal_review_records` stores scope, reviewer/owner, source set, decision, effective time, expiry/review date and linked policy version. It must not store privileged legal advice in public Git; Git contains only product-facing conclusions and evidence identifiers.

## 5. Initial jurisdiction rollout matrix

This is a product rollout baseline, not a declaration that each feature is legally cleared.

| Market | Core service | Paid non-P2W | Casino | Personalized ads | Key launch gate |
| --- | --- | --- | --- | --- | --- |
| Korea (`KR`) | ALLOW under current account policy | REVIEW_REQUIRED until seller/refund/subscription/payment route is production-ready | BLOCK until GRAC/rating + 19+ casino policy + legal/store approval | contextual first; personalized REVIEW_REQUIRED | Game Industry Act/GRAC, e-commerce recurring-payment rules, PIPA/behavioral ads, store policy |
| United States (`US`) | ALLOW with COPPA/general-audience age policy | ALLOW_WITH_CONTROLS after billing/consumer review | state-level REVIEW_REQUIRED; Washington defaults BLOCK | age/state/privacy policy; under-13 excluded | COPPA, state consumer/privacy rules, Washington gambling definition, store billing |
| United Kingdom (`GB`) | ALLOW | ALLOW_WITH_CONTROLS | REVIEW_REQUIRED; 18+ product policy even if exact legal classification differs | minors/sensitive profiling conservative-off | Gambling Commission virtual-value boundary, consumer/privacy review |
| Germany (`DE`) | ALLOW_WITH_CONTROLS | ALLOW_WITH_CONTROLS | default BLOCK until German youth/rating and gambling-boundary review | targeted ads to minors BLOCK | JuSchG age-rating/use risks include gambling-like mechanisms and purchase pressure; EU consumer/privacy overlay |
| France (`FR`) | ALLOW_WITH_CONTROLS | ALLOW_WITH_CONTROLS | default BLOCK until simulated-casino classification review | targeted ads to minors BLOCK | ANJ real-money online-casino prohibition is a high-risk boundary; EU consumer/privacy overlay |
| Spain (`ES`) | ALLOW_WITH_CONTROLS | ALLOW_WITH_CONTROLS | default BLOCK until local simulated-gambling/reward-mechanism review | targeted ads to minors BLOCK | DGOJ explicitly monitors videogame/loot-box convergence with gambling; EU consumer/privacy overlay |
| Other EEA member states | ALLOW_WITH_CONTROLS | ALLOW_WITH_CONTROLS | country-level REVIEW_REQUIRED; default BLOCK | targeted ads to minors BLOCK | GDPR child threshold by Member State, DSA, Consumer Rights Directive, country gambling/youth law |
| Australia (`AU`) | ALLOW | ALLOW_WITH_CONTROLS | R18+ + classification evidence; otherwise BLOCK | minors conservative-off | Australian Classification simulated-gambling minimum R18+ |
| Japan (`JP`) | ALLOW | ALLOW_WITH_CONTROLS | default BLOCK pending local review | conservative contextual default | Payment Services Act prepaid-value analysis if paid currency is introduced; consumer/privacy review |
| Brazil (`BR`) | ALLOW_WITH_CONTROLS | REVIEW_REQUIRED | default BLOCK | minors conservative-off | child/digital classification/privacy/consumer review |
| Canada / Singapore / Taiwan | public/core rollout only after country review | REVIEW_REQUIRED | BLOCK | REVIEW_REQUIRED | local legal/store/privacy/consumer review |
| China mainland | NOT_LAUNCHED by default | BLOCK | BLOCK | BLOCK | separate local licensing/filing, game/content/data/payment counsel project |

No row may be changed from `REVIEW_REQUIRED/BLOCK` to `ALLOW` solely because another market approved the same feature.

## 6. Casino architecture under international rollout

Casino is an isolated probability-entertainment module, not a monetization channel.

Target value architecture before cash monetization launches:

- dedicated casino entertainment balance `CSP` (working name);
- cannot be purchased with cash;
- cannot be transferred, gifted or marketplace-listed;
- cannot convert to/from WLD/WDX/paid items;
- cannot be granted by rewarded ads;
- cannot produce cash, crypto, gift cards, merchandise, paid entitlements or transferable items;
- no paid/VIP benefit can increase casino odds, limits, payout, retries or loss recovery.

`no cash-out` remains required, but it is not treated as globally sufficient. Washington State is the concrete counterexample: credit extending the privilege of continued play can be a statutory “thing of value,” and the Ninth Circuit applied that definition to virtual casino chips in `Kater v. Churchill Downs`.

Korea and Australia additionally require strong rating/age gates for simulated gambling. Unknown jurisdiction/subdivision/channel resolves to casino disabled.

## 7. Monetization architecture by channel and country

### 7.1 What Moneyverse may sell

P0 candidate revenue:

- ad-free subscription;
- account-bound profile/dashboard/room cosmetics;
- non-competitive presentation/archive convenience;
- clearly labelled sponsorship on allowlisted public content.

These products must not create WLD/WDX yield, casino stake, higher odds, ranking advantage, loan advantage, market execution advantage, hidden information or transferable real-world value.

### 7.2 Billing authority

Billing catalog is server-owned and versioned by `product + jurisdiction + channel + currency + tax display + effective window`.

The client never decides price, currency, entitlement or eligibility.

Preferred payment handling is hosted/tokenized so Moneyverse does not store PAN/CVV. Provider/store webhooks are signature-verified, replay-safe and idempotent.

### 7.3 Android / Google Play

For Play-distributed apps, digital goods/services normally use Google Play Billing unless an applicable enrolled regional program permits another route. South Korea supports alternative billing alongside Play under Google's program/API/reporting requirements. EEA/UK/US billing choices are evolving and must be read from current store policy at release time, not hard-coded from an old planning snapshot.

### 7.4 iOS / App Store

Digital functionality unlocked inside the app uses Apple In-App Purchase by default unless the exact storefront/program entitlement currently permits another route. Country-specific external-purchase rules are policy data, not application assumptions.

### 7.5 Web

Web billing may use an approved PSP, but web purchase does not automatically grant native-app billing rights. Entitlement portability across channels is product/legal/store-policy reviewed per SKU.

### 7.6 Subscription guardrails

All locales show total recurring price, interval, automatic renewal, trial conversion, cancellation/refund rules and effective date in natural local-language copy before purchase.

Korea: price increase or free-to-paid recurring conversion requires the applicable advance consent/notice flow; current Korean rules use a 30-day pre-change period. Store flows may add their own consent mechanics.

EU/EEA: pre-contract information, digital-content functionality/interoperability information and withdrawal/cancellation handling follow the Consumer Rights Directive plus local implementation.

### 7.7 Market profitability gate

No country launches paid products just because billing technically works. Each market has a versioned unit-economics sheet.

```text
net_paid_revenue
= gross_collected
- store_or_psp_fees
- VAT/sales_tax borne by operator
- refunds
- chargebacks/fraud loss
- payment support cost
- incremental moderation/safety cost
- localization/vendor cost
- legal/compliance/rating cost allocated to market
- ad-revenue cannibalization from ad-free subscribers
```

Track by `country + channel + product + price_version + acquisition_cohort`: paid conversion, ARPPU, churn, refund/chargeback, contribution margin, D30/D90 LTV, CAC/payback, and support contacts per payer.

Initial paid catalog should stay small: `AD_FREE_MONTHLY`, `AD_FREE_ANNUAL`, `PROFILE_THEME_PACK`, `DASHBOARD_THEME_PACK`, `ROOM_COSMETIC_PACK`. Price is localized through immutable country/channel price versions and store price points; do not perform live FX conversion at checkout.

Scale a market only when retention and contribution margin remain healthy without increasing complaints, refunds, minors risk or casino participation. Kill/disable an offer if compliance evidence expires, refund/chargeback spikes, misleading localization is found, or the product begins to create gameplay/economic advantage.

## 8. Locale rollout and URL strategy

Documentation remains **English canonical, Korean second**. Product/public-site localization expands independently.

### 8.1 Product locale waves

P0/P1 target locales:

```text
en       English neutral/default
ko       Korean
ja       Japanese
de       German
fr       French
es       Spanish
pt-BR    Brazilian Portuguese
```

Later after demand/legal support:

```text
zh-TW    Traditional Chinese for Taiwan
it       Italian
nl       Dutch
fr-CA    Canadian French when regional demand justifies it
```

Do not publish `zh-CN`/China-targeted commercial pages as a launch signal until the China distribution/compliance project is approved.

### 8.2 URLs

Use separate crawlable URLs per language, preferably subdirectories on the existing gTLD:

```text
/en/...
/ko/...
/ja/...
/de/...
/fr/...
/es/...
/pt-br/...
```

Use region-specific variants (`en-US`, `en-GB`, `en-AU`, etc.) only when the visible content materially differs by market. Do not clone identical regional pages merely to capture keywords.

Every localized page is self-canonical. Equivalent localized pages emit reciprocal `hreflang`. `x-default` points to a genuinely useful neutral language/country selector.

Do not IP-redirect crawlers or users between language URLs. A non-blocking suggestion banner may offer “View in 한국어 / 日本語 / Deutsch” while preserving the current URL until the user chooses.

## 9. Natural localization quality system

Translation is a product artifact with versioning, not a runtime string substitution afterthought.

Recommended entities:

```text
locale_catalog
translation_namespaces
translation_units
translation_versions
translation_reviews
translation_glossary_versions
localized_legal_documents
localized_seo_documents
```

Every translation carries:

```text
source_key
source_locale
source_hash
target_locale
translated_text
translation_status
translator_type       # human | machine_assisted | vendor
reviewer
reviewed_at
glossary_version
legal_review_state
seo_review_state
```

Statuses:

```text
DRAFT -> LINGUISTIC_REVIEW -> PRODUCT_REVIEW -> LEGAL_REVIEW(if required) -> PUBLISHED -> STALE
```

Rules:

- raw machine translation is never published for Terms, Privacy, checkout, refund/cancellation, age/rating, casino safety/probability, moderation enforcement or security-critical copy;
- marketing/public editorial machine assistance requires native-language review before indexability;
- translated title/description/H1 are written for native search intent, not literal keyword substitution;
- brand names and economic terms (`Moneyverse`, `WLD`, `WDX`, product codes) use a glossary and are not freely retranslated;
- numbers, dates, decimal separators and currency display use locale format while server amounts remain canonical minor units/integers;
- one page should present one primary language; do not create side-by-side mixed-language SEO pages;
- UGC remains in its authored language; optional machine translation is labelled and does not create an indexable duplicate by default.

When the English source changes, `source_hash` mismatch marks every affected translation `STALE`. Safety/legal/checkout stale translations block release rather than silently falling back to misleading old copy.

## 10. Google multilingual / multi-regional SEO contract

Adopt Google Search Central's current international guidance:

1. separate URLs for each language version;
2. reciprocal `hreflang` between true equivalents;
3. `x-default` for a neutral selector/default when useful;
4. self-canonical localized URLs;
5. no automatic language redirect based on IP/`Accept-Language`;
6. visible primary content and navigation in one clear page language;
7. locale-specific sitemaps generated only for published/indexable translations;
8. regional variants only when actually different;
9. internal language switch links are ordinary crawlable links;
10. translation placeholders/thin pages remain `noindex` and out of sitemaps.

Recommended sitemap index:

```text
/sitemap.xml
/sitemaps/pages-en.xml
/sitemaps/pages-ko.xml
/sitemaps/pages-ja.xml
/sitemaps/pages-de.xml
/sitemaps/pages-fr.xml
/sitemaps/pages-es.xml
/sitemaps/pages-pt-br.xml
```

Search metadata is independently localized: title, meta description, H1, breadcrumbs, Open Graph, image alt and structured-data visible text must match the page locale.

Search KPIs are segmented by `locale + country + search engine + landing family`: impressions, indexed valid pages, CTR, organic signup, activation, D7/D30 retention, paid conversion/net revenue where legally attributable. Ranking volume is never optimized by generating low-quality automatic translations.

## 11. Locale and jurisdiction APIs

Recommended read APIs:

```text
GET /public/locales
GET /public/countries
GET /public/policy/availability?country=&subdivision=&channel=
GET /me/feature-availability
GET /billing/catalog
GET /casino/availability
```

`/me/feature-availability` returns reason codes and policy versions, not confidential legal notes.

Recommended admin tools:

- policy simulator by country/subdivision/channel/age;
- translation stale/missing dashboard;
- legal/rating/store evidence expiry dashboard;
- billing catalog by market/currency/channel;
- locale SEO parity/hreflang validation;
- emergency country/feature kill switch with audit trail.

## 12. Privacy / advertising by jurisdiction

Contextual advertising is the default international baseline.

Personalized advertising requires a separate policy decision based on age, jurisdiction, consent/legal basis, provider and data inventory.

Korea: behavioral-ad processing must follow PIPC requirements/guidance and remains gated until the concrete ad stack is reviewed.

EEA: DSA prohibits targeted advertising to minors on online platforms and bans certain dark-pattern practices; GDPR child-consent thresholds vary by Member State from 13 to 16 where consent is the relevant basis. Moneyverse therefore cannot implement one EU-wide child-consent age constant.

United States: the service remains general-audience and excludes known under-13 users until a dedicated COPPA-compliant child experience exists.

No jurisdiction may use sensitive-trait inference for ad targeting. Casino pages have no advertising inventory.

## 13. QA matrix

Every release that changes locale, country policy or billing runs at least:

- country/subdivision/channel policy decision tests;
- age boundary tests;
- unknown-jurisdiction fail-closed tests;
- language change does not change jurisdiction permissions;
- jurisdiction change does not silently overwrite language;
- stale legal/rating evidence disables high-risk feature;
- paid entitlement cannot become casino stake;
- casino result cannot become paid/transferable/external value;
- app-store billing route and entitlement tests;
- subscription price-change/consent/cancel/refund states;
- locale fallback and missing-key tests;
- source-hash stale translation tests;
- human/legal review gate tests for sensitive strings;
- hreflang reciprocity/self-canonical/x-default validation;
- sitemap only contains indexable published translations;
- bot/JS-disabled/mobile rendering parity;
- Search Console/Naver monitoring after deployment.

## 14. Rollout order

1. policy engine/schema and admin simulator;
2. locale registry + English/Korean parity hardening;
3. Japanese/German/French/Spanish/Portuguese translation pipeline;
4. public SEO locale URLs/hreflang/sitemaps;
5. jurisdiction-specific legal/privacy/store evidence registry;
6. non-P2W billing by market/channel;
7. CSP/provenance isolation before any casino + monetization coexistence;
8. isolated Test exact-SHA country/locale/billing/casino matrix;
9. legal/product approval per market;
10. Production enablement by feature flag, one market/channel at a time.

## 15. Authoritative external references used for this version

- Google Search Central — Managing multi-regional and multilingual sites: https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
- Google Search Central — Localized versions / hreflang: https://developers.google.com/search/docs/specialty/international/localized-versions
- Google Search Central — Locale-adaptive crawling: https://developers.google.com/search/docs/specialty/international/locale-adaptive-pages
- Korea Game Industry Promotion Act / National Law Information Center: https://www.law.go.kr/
- Google Play Korea distribution requirements: https://support.google.com/googleplay/android-developer/answer/6223646
- Google Play Payments policy: https://support.google.com/googleplay/android-developer/answer/9858738
- Google Play South Korea alternative billing: https://support.google.com/googleplay/android-developer/answer/11222040
- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Apple age-rating definitions: https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions
- Korea PIPC behavioral advertising policy material: https://pipc.go.kr/
- Korea FTC e-commerce/dark-pattern material: https://www.ftc.go.kr/
- EU Digital Services Act information: https://digital-strategy.ec.europa.eu/en/policies/digital-services-act
- EU Consumer Rights Directive: https://commission.europa.eu/law/law-topic/consumer-protection-law/consumer-contract-law/consumer-rights-directive_en
- EU child-data information/GDPR: https://commission.europa.eu/law/law-topic/data-protection/information-individuals_en
- UK Gambling Commission — digital/virtual currencies: https://www.gamblingcommission.gov.uk/licensees-and-businesses/guide/page/digital-and-virtual-currencies
- UK Gambling Commission — remote technical standards: https://www.gamblingcommission.gov.uk/standards/remote-gambling-and-software-technical-standards
- Washington RCW 9.46.0285: https://app.leg.wa.gov/rcw/default.aspx?cite=9.46.0285
- Ninth Circuit `Kater v. Churchill Downs`: https://cdn.ca9.uscourts.gov/datastore/opinions/2018/03/28/16-35010.pdf
- FTC COPPA: https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa
- Australian Classification — gambling-like game content: https://www.classification.gov.au/classification-ratings/new-classifications-for-gambling-content-video-games
- Japan FSA — prepaid payment instruments: https://www.fsa.go.jp/en/news/2018/20180717.html

## 16. Version record

### v2026.09.17.177

Created the international locale/jurisdiction policy architecture, expanded multilingual SEO beyond EN/KO, defined natural-translation governance, added country/channel monetization gates, and integrated casino restrictions with billing, minors, advertising and app-store rules.

Documentation-only. No Test or Production runtime behavior changes in this cycle.
