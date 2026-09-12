# Woldeok Moneyverse — Monetization, Korea/US Compliance & Search Growth Specification

> Version: v2026.09.12.27
> Status: Living implementation-oriented product specification
> Date: 2026-09-12
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`
> Korean counterpart: [MONETIZATION_COMPLIANCE_SEO_SPEC.ko.md](MONETIZATION_COMPLIANCE_SEO_SPEC.ko.md)

## 1. Purpose

This specification turns monetization, Korea/US compliance, privacy, advertising, and search growth into first-class product requirements rather than launch-time afterthoughts.

The product goal is to build a profitable virtual-economy service without creating misleading financial claims, dark patterns, unlawful advertising, hidden subscription terms, unnecessary personal-data processing, or search-spam behavior.

This document is a product/engineering specification, not legal advice. Items that require jurisdiction-specific legal interpretation are marked `legal review required` and must block launch of the affected feature until reviewed.

## 2. Product classification and non-negotiable wording

Moneyverse remains a virtual game/community economy.

- WLD is a service-internal virtual currency with no promised cash redemption.
- WDX instruments are fictional/simulated game instruments, not securities or investment products.
- Banking, loans, businesses and market activity are game systems, not deposits, credit products, brokerage services or investment advice.
- Rewards must not imply guaranteed real-world profit.
- Ads and sponsored content must not imply that an advertiser can move WDX prices, rankings or user economic outcomes.

Required disclosure family:

- `Virtual game currency. No cash redemption.`
- `Simulated market. Not a real security or investment product.`
- `For gameplay and learning only. No investment return is promised.`

The exact copy may vary by screen, but meaning must remain consistent in English and Korean.

## 3. Monetization portfolio

Moneyverse should not depend on a single revenue source. Revenue should be diversified so one policy change does not threaten the service.

### 3.1 P0 revenue channels

1. **Public-content display ads**
   - placement only on allowlisted low-risk public pages;
   - clearly separated from core content and interaction controls;
   - no ads on login, wallet, transfer, loan, WDX order entry, sensitive account, admin, error or maintenance pages.

2. **Native sponsored modules**
   - must be visually and textually labeled `Ad`, `Advertisement`, `Sponsored` or equivalent clear local-language wording;
   - disclosure appears adjacent to the sponsored module, not only in a footer;
   - sponsored editorial content cannot masquerade as neutral Moneyverse analysis.

3. **Ad-free subscription**
   - removes eligible ads;
   - may include convenience/presentation benefits but not WLD yield, better WDX execution, better loan terms, higher rank scoring, increased random odds or other direct economic advantage.

4. **Non-P2W cosmetics and identity products**
   - profile themes, frames, nameplates, dashboard themes, room/office cosmetics, club visuals, archive presentation, seasonal visual packs;
   - real-money purchases and WLD sink purchases must be separate product/accounting domains.

### 3.2 P1 revenue channels

- sponsor-funded seasonal visual themes;
- branded educational/lore events with clear sponsorship disclosure;
- B2B/B2B2C sponsorship of non-competitive city/community projects;
- optional premium archive/export/presentation conveniences if they do not hide core account data behind payment.

### 3.3 Prohibited revenue patterns

Do not monetize:

- WDX price movement;
- ranking or league score advantage;
- hidden odds or paid probability boosts;
- removal of moderation penalties;
- faster report handling for money;
- access to materially superior market information unavailable to non-paying users;
- forced ad clicks to complete core financial-like actions;
- cash-out, cash-equivalent redemption or external-prize loops without separate legal/product approval;
- fake scarcity or fabricated countdown urgency.

## 4. Revenue KPI model

Product analytics must separate monetization efficiency from user harm.

Track at minimum:

- DAU / WAU / MAU;
- ARPDAU and ARPU;
- ad impressions per active user;
- ad eCPM, fill rate, viewability and CTR;
- ad session-abandonment rate;
- subscription conversion and cancellation rate;
- paid conversion by cohort/source;
- gross revenue, payment fees, refund/chargeback cost;
- infrastructure cost per active user;
- moderation/support cost per active user;
- content-production cost;
- contribution margin;
- LTV and CAC by acquisition channel;
- 7/30/90-day payback by paid acquisition source;
- complaint rate and ad-hide/report rate;
- retention by ad-load cohort.

Do not optimize CTR or ad impressions in isolation. Guardrails include retention, page latency, Core Web Vitals, complaint rate, accidental-click rate, support burden and trust survey results.

## 5. Ad inventory map

### 5.1 Allowed candidate surfaces

- public home/landing content after the primary product explanation;
- public guides and educational articles;
- public fictional-company lore pages;
- public season information pages;
- public community index/list surfaces where UGC and sponsored content are clearly separated;
- footer or between-section placements that do not interrupt primary tasks.

### 5.2 Blocked surfaces

- sign-in / OAuth callbacks;
- onboarding decision steps;
- wallet and ledger history;
- transfer;
- bank/loan application, repayment or hardship screens;
- WDX buy/sell/order confirmation;
- portfolio decision CTA surfaces;
- casino/probability gameplay;
- admin console;
- password/security/session controls;
- legal/privacy consent dialogs;
- error, offline, maintenance and payment-failure screens.

### 5.3 Ad UX contract

Each ad slot needs:

- `slot_code`;
- allowed routes and breakpoints;
- format and reserved layout dimensions;
- ad/sponsor label;
- max layout-shift budget;
- consent dependency;
- contextual vs personalized mode;
- fallback behavior when no ad is filled;
- analytics events;
- accessibility label;
- policy owner;
- emergency disable config.

No filled ad may cover, imitate, move, or sit inside a primary financial-like CTA.

## 6. Subscription UX contract

If an ad-free or convenience subscription is introduced:

- show full recurring price before purchase;
- show billing interval;
- show whether tax is included/added where applicable;
- show renewal behavior;
- show free-trial conversion date and price if a trial exists;
- obtain affirmative consent before charging;
- provide a simple cancellation route from account settings;
- provide cancellation confirmation and effective date;
- store consent/terms version and transaction evidence;
- notify users of material plan/price changes as required;
- avoid pre-checked paid options;
- do not make cancellation materially harder than sign-up.

Schema recommendation:

```text
subscription_plans
subscription_price_versions
user_subscriptions
subscription_consents
subscription_events
refund_requests
```

Key fields should include `jurisdiction`, `terms_version`, `price_version`, `started_at`, `renews_at`, `cancel_requested_at`, `canceled_at`, `trial_ends_at`, and payment-provider references.

## 7. Korea compliance requirements

### 7.1 Privacy and behavioral advertising

For Korean users, product planning must review current PIPC guidance and the Personal Information Protection Act before enabling personalized advertising or behavioral profiling.

Default launch posture:

- contextual/non-personalized ads are safer for initial monetization;
- personalized advertising stays behind a separately reviewed feature flag;
- document data category, purpose, legal basis/consent path, retention, recipients/processors and opt-out controls;
- avoid collecting precise or sensitive behavioral signals merely to improve ad yield;
- do not infer sensitive traits for ad targeting;
- maintain deletion/withdrawal paths aligned with actual data architecture.

`legal review required` before production personalized-ad rollout.

### 7.2 Advertising and endorsements

Sponsored recommendations, creator programs, affiliate relationships and paid reviews must disclose material economic relationships clearly and near the content.

Korean-language placements use clear Korean disclosure text. Do not hide disclosures behind profile pages, tiny icons, ambiguous hashtags, hover-only UI or long scroll distance.

### 7.3 E-commerce and paid products

Before real-money digital products/subscriptions launch, define:

- seller/business identification disclosures;
- product/service description;
- total price and recurring conditions;
- payment timing;
- cancellation/withdrawal/refund policy;
- customer-support contact route;
- digital-content consumption implications for cancellation rights;
- minor purchase handling where applicable.

`legal review required` before enabling real-money sales in Korea.

## 8. United States compliance requirements

### 8.1 Advertising truthfulness

Marketing claims must be truthful, non-deceptive and evidence-based. Sponsored/native content must be identifiable as advertising. Material connections for endorsements/influencers must be disclosed clearly.

Product implication: do not publish copy such as `guaranteed profit`, `beat the market`, `risk-free returns`, or `best-performing investment` for WDX/WLD systems.

### 8.2 Children / COPPA

The COPPA rule was amended in 2025; coverage and requirements must be evaluated before knowingly collecting personal information from children under 13 or operating child-directed experiences.

Default product posture:

- do not intentionally target under-13 users before a dedicated child-safety/privacy design exists;
- do not enable behaviorally targeted ads for known under-13 users;
- maintain age/jurisdiction policy hooks;
- avoid dark-pattern age evasion;
- if under-13 support is later desired, treat it as a separate project with parental notice/consent and data-minimization design.

`legal review required` for child-directed or known-under-13 operation.

### 8.3 California privacy

If business thresholds or processing scope make CCPA/CPRA applicable, support operational privacy rights rather than policy-only promises.

Architecture should be able to support:

- access/know requests;
- deletion requests with documented exceptions;
- correction where applicable;
- opt-out of sale/sharing;
- Global Privacy Control where applicable;
- non-discrimination for rights exercise;
- sensitive-data handling and data-retention disclosure;
- risk-assessment workflows for covered processing.

### 8.4 Subscription and recurring billing

Recurring billing must use clear terms, informed affirmative consent and straightforward cancellation. Product should not rely on regulatory ambiguity: even where specific rulemaking changes, Moneyverse adopts a simple-cancel baseline as product policy.

## 9. Privacy architecture

Maintain a data inventory by purpose, not merely by table.

Recommended register fields:

```text
data_category
source
purpose
required_or_optional
jurisdiction_scope
legal_basis_or_consent_type
processor_or_recipient
retention_policy
delete_behavior
user_control
sensitive_flag
ads_eligible
analytics_eligible
```

Consent records must be versioned. Changing the privacy policy text must not silently reinterpret historic consent for materially new processing.

Advertising identifiers, analytics identifiers, account identifiers and economy identifiers should be separable where feasible.

## 10. Cookie / SDK policy

Before adding a third-party analytics or ad SDK:

1. record vendor and SDK version;
2. list collected data and network destinations;
3. determine essential vs optional purpose;
4. document consent dependency by jurisdiction;
5. verify data-processing terms;
6. define retention and deletion support;
7. verify children/minor policy compatibility;
8. test page performance and layout impact;
9. define feature flag and emergency disable path;
10. add vendor to public privacy disclosures when required.

No SDK may be added solely because it improves ad revenue without privacy/security review.

## 11. SEO product architecture

SEO is a product acquisition system, not a metadata checklist.

### 11.1 Indexable public information architecture

Candidate indexable routes:

```text
/en/
/ko/
/en/guide/*
/ko/guide/*
/en/market/companies/{ticker}
/ko/market/companies/{ticker}
/en/seasons/{season-slug}
/ko/seasons/{season-slug}
/en/glossary/*
/ko/glossary/*
/en/community (public index only, policy dependent)
/ko/community
```

Non-indexable:

```text
/account/*
/wallet/*
/portfolio/private/*
/admin/*
/auth/*
/settings/security/*
/checkout/*
```

Test/staging must use `noindex` and must not emit production canonicals that cause staging pages to compete with production.

### 11.2 Technical SEO contract

Every indexable page must define:

- canonical URL;
- localized alternates/hreflang where applicable;
- deterministic title;
- useful meta description;
- one clear page topic and heading hierarchy;
- crawlable HTML body content;
- internal links from at least one appropriate hub;
- stable 200 status when valid;
- true 404/410 behavior when removed;
- Open Graph/share image metadata;
- preferred image metadata where relevant;
- structured data only when it accurately describes visible page content.

### 11.3 Search Console operations

Operator checklist:

- verify production property;
- submit canonical sitemaps;
- inspect representative EN/KO URLs;
- monitor indexing/crawl errors;
- monitor Core Web Vitals;
- review rich-result/structured-data errors;
- review manual actions/security issues;
- track brand vs non-brand search performance;
- annotate deployments/content launches when traffic shifts materially.

## 12. Google 2026 search changes incorporated

Planning must reflect current Google guidance rather than obsolete SEO folklore.

- Google continues to recommend standard Search Essentials and useful, reliable content.
- Google published 2026 guidance for generative-AI Search experiences emphasizing unique/non-commodity content; a separate `AEO/GEO` trick layer is not a replacement for sound SEO.
- `llms.txt` is not required for Google Search visibility.
- FAQ rich-result documentation was removed in 2026; do not design an acquisition strategy around receiving FAQ rich results.
- recent Search documentation now discusses regional differences in Search experiences, so EN/KO pages should be monitored separately rather than assuming identical SERP treatment.

## 13. Content strategy

Public search content must help users understand and use the product.

Content clusters:

1. virtual-economy basics;
2. fictional stock-market learning guides;
3. WDX fictional company lore and event archives;
4. jobs/professions and business-operation guides;
5. season guides and archive pages;
6. collection/crafting/space guides;
7. account/security/privacy help;
8. glossary of game and finance-learning terms.

Each article needs a specific post-sign-in next action but must not use deceptive urgency.

Prohibited SEO behavior:

- keyword stuffing;
- doorway pages;
- programmatic near-duplicate city/keyword pages;
- bought spam links;
- invisible text;
- mass low-value AI pages;
- fake author credentials;
- fabricated testimonials/reviews.

## 14. Core Web Vitals and ad-performance budget

SEO, monetization and performance share one budget.

Target good Core Web Vitals at the 75th percentile where feasible:

- LCP ≤ 2.5 s;
- INP < 200 ms;
- CLS < 0.1.

Ad implementation must reserve slot dimensions to reduce CLS. Heavy ad scripts should load after the primary content path when product requirements allow. Monetization experiments that materially regress Core Web Vitals must be rolled back or redesigned.

## 15. SEO analytics events

Recommended events/properties:

```text
seo_landing_view
seo_landing_cta_click
seo_signup_start
seo_signup_complete
seo_activation_complete
public_guide_view
public_company_view
public_season_view
search_internal_query
search_internal_result_click
ad_impression
ad_click
ad_hide_or_report
subscription_offer_view
subscription_checkout_start
subscription_purchase
subscription_cancel_start
subscription_cancel_complete
privacy_choice_changed
```

Attribution should record acquisition source without exposing private financial-like activity to ad systems.

## 16. Monetization experimentation

Examples:

- contextual ad vs no ad on public guides;
- one lower-page ad vs two lower-density placements;
- subscription offer after repeat public usage vs immediate modal;
- sponsored season page module vs non-sponsored baseline;
- ad-free plan framing based on convenience vs savings.

Guardrails:

- D1/D7 retention;
- bounce/exit rate;
- accidental click complaints;
- LCP/INP/CLS;
- privacy opt-out rate;
- support contacts;
- conversion quality;
- legal/policy incident count.

No experiment may test hiding mandatory disclosures or making cancellation harder.

## 17. Admin console requirements

Add a `Monetization & Compliance` admin area with read-first controls.

Modules:

- ad-slot inventory and status;
- contextual/personalized mode flags;
- jurisdiction availability;
- sponsor campaign disclosure preview;
- subscription plan/price versions;
- privacy/consent version registry;
- SEO page/indexability registry;
- sitemap generation status;
- canonical/hreflang validation status;
- Search Console integration status/read-only metrics if later connected;
- legal-review checklist state;
- kill switches for ads, personalized ads, sponsored modules and paid checkout.

Administrator forms must not auto-refresh while edited. New server data should be shown via a non-destructive stale-data indicator and explicit refresh/merge action.

## 18. Configuration model

Recommended config keys:

```text
ads.enabled
ads.personalized.enabled
ads.allowed_routes
ads.blocked_routes
ads.minor_personalization.enabled = false
ads.slot.*
subscriptions.enabled
subscriptions.plan.*
privacy.region.KR.*
privacy.region.US.*
privacy.gpc.enabled
seo.indexing.enabled
seo.staging_noindex = true
seo.canonical_origin
seo.locale.en.enabled
seo.locale.ko.enabled
seo.sitemap.enabled
seo.structured_data.enabled
legal.feature_gate.*
```

Any legal/compliance gate that is not approved should fail closed.

## 19. Definition of Done — advertising

An ad feature is complete only when:

- placement is allowlisted;
- sensitive routes are excluded;
- ad label is clear in EN/KO;
- layout dimensions are reserved;
- keyboard/screen-reader identification works;
- no CTA confusion exists;
- consent mode is correct by jurisdiction;
- analytics does not expose unnecessary account/economy data;
- policy/legal review requirements are recorded;
- disable switch works;
- test environment verification passes before runtime promotion.

## 20. Definition of Done — subscription

A subscription is complete only when:

- price/interval/renewal is disclosed before purchase;
- consent evidence is stored;
- cancellation is simple and tested;
- refund/cancellation state is deterministic;
- payment retries are idempotent;
- duplicate purchase is prevented;
- access grants/revocation reconcile with payment state;
- EN/KO terms and help content are present;
- jurisdiction launch gate is approved.

## 21. Definition of Done — SEO

An SEO-facing page is complete only when:

- it returns the intended status code;
- canonical is correct;
- EN/KO locale relationships are correct;
- index/noindex policy is correct;
- metadata and visible headings agree;
- important content is present in crawlable HTML;
- internal links exist;
- sitemap behavior is correct;
- structured data, if any, validates and matches visible content;
- mobile rendering is usable;
- performance budget is checked;
- no private data is exposed in markup, analytics or metadata.

## 22. Launch compliance checklist

Before commercial launch, confirm:

- privacy policy matches actual telemetry/ads/SDKs;
- terms identify virtual/game-only nature of WLD/WDX;
- advertising disclosure rules are implemented;
- creator/sponsor disclosure workflow exists;
- paid-product price/refund/cancellation disclosures are ready;
- age/minor handling is defined;
- COPPA applicability is reviewed;
- CCPA/CPRA applicability and rights handling are reviewed;
- Korean PIPA/PIPC ad/privacy handling is reviewed;
- Korean e-commerce/consumer rules for paid products are reviewed;
- payment-provider terms are satisfied;
- community reporting/removal obligations are reviewed;
- accessibility risk is reviewed;
- data retention/deletion behavior is operational, not just documented;
- legal-review-required items are resolved or feature-gated off.

## 23. External evidence reviewed for v2026.09.12.27

Current official/reference material reviewed for this version includes:

- Google Search Central documentation updates through 2026-09-08, including regional Search-experience documentation and 2026 Search guidance changes;
- Google Search Essentials and Core Web Vitals guidance;
- Google 2026 guidance for generative-AI Search experiences;
- FTC advertising/marketing guidance, endorsement/review guidance and native-ad transparency guidance;
- FTC COPPA compliance guidance reflecting the 2025 COPPA rule amendment;
- FTC 2026 negative-option/subscription rulemaking context and recent subscription-enforcement guidance;
- California Attorney General/CPPA CCPA resources and 2026-effective regulations;
- Korea Personal Information Protection Commission materials on behavioral advertising and 2026 pseudonymized-data guidance;
- Korea Fair Trade Commission revised endorsement/recommendation disclosure guidance.

These sources are directional compliance/product evidence. Final launch interpretation for regulated or ambiguous features remains `legal review required`.

## 24. Delivery priority

### P0

- public-route ad allowlist/blocklist;
- contextual-only ad baseline;
- ad/sponsor disclosure component;
- ad kill switch;
- production/staging SEO indexing separation;
- canonical/hreflang/sitemap contract;
- public guide/company/season SEO templates;
- privacy data inventory;
- KR/US launch compliance checklist;
- monetization KPI dashboard schema.

### P1

- ad-free subscription with simple cancellation;
- sponsor campaign registry;
- Search Console operational dashboard/read model;
- privacy preference center and GPC handling where applicable;
- consent/version registry;
- EN/KO content-cluster publishing workflow.

### P2

- personalized advertising only after legal/privacy approval;
- jurisdiction-aware consent orchestration;
- B2B sponsorship tooling;
- advanced LTV/CAC attribution;
- automated SEO regression checks in CI.

## 25. Runtime/deployment note

This version is documentation-only. It requires no test-server deployment.

Any runtime implementation from this specification must use a separate development branch, pass CI and privacy/security review, deploy the exact candidate SHA to the isolated test environment, verify backend/API/UI behavior and indexing controls there, and only then follow the production release workflow.