# Woldeok Moneyverse — Analytics & Experimentation Governance Specification

> Version: v2026.09.13.7
> Status: Living implementation-oriented product/data specification
> Date: 2026-09-13
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`
> Korean counterpart: [ANALYTICS_EXPERIMENTATION_GOVERNANCE_SPEC.ko.md](ANALYTICS_EXPERIMENTATION_GOVERNANCE_SPEC.ko.md)

## 0. Purpose

Moneyverse already defines activation, retention, economy, growth, revenue and safety KPIs and an A/B experiment backlog. This specification turns those goals into a buildable analytics and experimentation contract.

The system must answer four questions reliably:

1. What happened in the product?
2. Which user or anonymous session context is legitimately necessary to understand it?
3. Which product or experiment configuration was active at that time?
4. Can operators act on the result without weakening privacy, safety, economy integrity or user trust?

Analytics is an observation system, not an alternate source of truth for economy balances, stock holdings, billing entitlements, permissions or account state. Authoritative state remains in the existing backend/database contracts.

## 1. Core principles

1. **Purpose limitation.** Collect an event only when it serves a named product, reliability, fraud-prevention, legal, revenue or experiment purpose.
2. **Data minimization.** Prefer pseudonymous internal IDs and coarse attributes. Do not place raw email, password, OAuth subject, session cookie, access token, payment credentials, government ID, free-form message bodies or unrestricted request payloads in analytics events.
3. **Consent-aware collection.** Analytics, advertising and personalization purposes are distinct. A consent choice for one purpose must not silently authorize another.
4. **Server-authoritative economy metrics.** WLD issuance, burn, transfer, balances, fees and economy outcomes come from ledger/read-model data, not browser click events.
5. **Stable event contracts.** Event names and required fields are versioned. Silent semantic changes are prohibited.
6. **Experiment safety before lift.** Security, legal, abuse, accessibility, reliability, economy-integrity and user-pressure guardrails can stop an experiment even if the primary conversion metric improves.
7. **No dark optimization.** Do not optimize for accidental clicks, compulsive trading, punitive streak pressure, hidden subscription enrollment or misleading urgency.
8. **Reproducibility.** Every experiment decision must preserve assignment version, metric version, start/stop timestamps, population definition and decision record.

## 2. Data classification

Every analytics field must be classified before launch.

### 2.1 Allowed by default

- internal user UUID or pseudonymous analytics subject ID;
- anonymous session/install identifier where permitted and necessary;
- event timestamp;
- locale and broad platform class;
- route/screen identifier from an allowlist;
- feature/experiment/config version;
- coarse device class and viewport bucket;
- product state labels such as `empty`, `loaded`, `error`, `maintenance`;
- domain IDs that are not direct personal data by themselves, such as `season_id`, fictional `ticker`, `sku_id`, `quest_id`;
- integer-safe WLD amount buckets or authoritative aggregates when required for economy analysis.

### 2.2 Restricted

Restricted fields require an explicit purpose, retention rule and access policy:

- precise IP address;
- exact geolocation;
- device fingerprint attributes;
- account age/date of birth;
- moderation/safety case IDs;
- billing/customer-provider IDs;
- fraud/risk scores;
- detailed referral/network linkage;
- free-form search text where it may reveal personal information.

### 2.3 Prohibited in general analytics

- passwords or password hashes;
- session cookies, CSRF secrets, access/refresh tokens;
- OAuth client secrets or provider tokens;
- raw email addresses and phone numbers;
- full postal addresses;
- raw payment card data or CVV/CVC;
- identity-document images;
- private message/comment bodies;
- unrestricted admin notes;
- secret keys, database credentials or backup keys.

Security systems may retain narrowly scoped evidence under their own security/incident policies; that does not make those fields valid product analytics.

## 3. Event contract

### 3.1 Envelope

Every accepted event uses a common envelope:

```text
event_id
schema_version
event_name
occurred_at
received_at
subject_type       // anonymous | user | operator | system
subject_id         // pseudonymous/internal ID
session_id         // analytics session ID, not auth session secret
source             // web | api | worker | discord | admin
locale
platform_class
route_key
release_sha
config_version
experiment_assignments[]
consent_snapshot_id
properties{}
```

`event_id` must be unique so retries do not double count.

### 3.2 Naming

Use domain-action naming, for example:

- `onboarding_started`
- `onboarding_step_completed`
- `job_completed`
- `shop_purchase_completed`
- `watchlist_item_added`
- `market_order_submitted`
- `market_order_filled`
- `trade_journal_reviewed`
- `business_settlement_completed`
- `season_reward_claimed`
- `subscription_checkout_started`
- `subscription_cancelled`
- `community_report_submitted`

Avoid ambiguous names such as `click`, `action`, `success` or `engagement` without domain context.

### 3.3 Client versus server events

Client events are acceptable for UI observations such as screen exposure, filter use, tab selection, form validation and CTA interaction.

Server/database events are required for authoritative facts such as:

- account creation success;
- verified job completion;
- WLD ledger transaction committed;
- stock order accepted/filled/cancelled;
- marketplace sale settled;
- billing entitlement activated;
- season reward issued;
- abuse restriction applied.

A browser event saying `purchase_success` must never substitute for the committed purchase/ledger record.

## 4. Identity, anonymous users and consent state

### 4.1 Identity separation

Use a dedicated analytics subject identifier mapped server-side to an internal user only where necessary. External analytics vendors should not receive internal authentication secrets or raw login identifiers.

Anonymous activity may use a short-lived pseudonymous identifier when permitted by the applicable consent/policy configuration. When a user signs in, historical anonymous events must not automatically be merged if doing so violates the applicable consent or retention policy.

### 4.2 Consent dimensions

Maintain separate purpose states, at minimum:

- `essential_service`
- `product_analytics`
- `personalization`
- `advertising_measurement`
- `personalized_advertising`

Possible values:

`UNKNOWN | GRANTED | DENIED | NOT_REQUIRED | RESTRICTED`

The consent snapshot stored with an event records the effective policy version and purpose states at collection time.

### 4.3 Revocation

When a user changes a non-essential consent from granted to denied:

- future collection for that purpose stops as required;
- downstream destinations receive updated consent state where supported;
- deletion/suppression obligations are executed according to jurisdiction and documented retention policy;
- essential security, fraud, billing and legal evidence remains governed by its separate lawful purpose and retention contract.

## 5. Analytics domains and KPI ownership

### 5.1 Activation

Required funnel:

`signup_started -> account_created -> onboarding_started -> onboarding_completed -> first_verified_job -> first_shop_sink -> first_watchlist -> first_safe_market_action`

Primary metrics:

- signup completion;
- onboarding completion;
- time to first verified job;
- time to first meaningful sink;
- watchlist adoption;
- D1 activated retention.

### 5.2 Retention

- D1/D3/D7/D30 retained users;
- WAU/MAU;
- active days per user;
- multi-system participation;
- weekly mission completion;
- comeback mission activation and completion;
- notification opt-out/unsubscribe rate;
- user-reported pressure or annoyance where measured.

### 5.3 Economy

Economy metrics are computed from authoritative ledger/read models:

- issuance;
- hard-sink amount;
- net issuance;
- hard-sink ratio;
- transfer volume;
- average/median/P90/P95/P99 balance;
- top 1% and top 10% wealth share;
- sink-family share;
- top-sink concentration;
- cohort purchase days;
- high-wealth balance growth;
- protection-limit trigger rate;
- diminishing-reward application rate;
- abuse false-positive rate.

Player-to-player volume is `transfer`, never `hard_sink`. Only permanently removed fees count as hard sinks.

### 5.4 Revenue

Real-money revenue analytics remain separate from virtual-economy accounting:

- gross billings;
- refunds;
- disputes/chargebacks;
- payment fees;
- net revenue;
- ARPU/ARPDAU;
- trial-to-paid conversion;
- cancellation rate;
- failed-payment recovery;
- LTV;
- CAC and payback;
- ad eCPM/fill/CTR where enabled;
- ad-attributed exit rate;
- subscription/cosmetic margin after provider, support, infrastructure and content cost.

### 5.5 Search/SEO

- organic impressions;
- organic clicks;
- CTR;
- indexed valid pages;
- non-brand organic sessions;
- organic signup conversion;
- landing engagement;
- Core Web Vitals pass rate;
- crawl/index errors;
- duplicate canonical rate;
- EN/KO organic split.

Search Console/Naver data is operational acquisition data and must not be joined to private account records without a documented need and privacy review.

## 6. Experiment registry

No production A/B test runs without a registry entry.

Required fields:

```text
experiment_id
name
owner
hypothesis
surface
status
randomization_unit
eligibility_rule
exclusion_rule
control_variant
variants[]
allocation
start_at
planned_end_at
primary_metric_id
secondary_metric_ids[]
guardrail_metric_ids[]
metric_versions[]
minimum_sample_plan
minimum_runtime
stop_conditions[]
consent_requirements
age_region_restrictions
feature_flag_key
config_version
analysis_method
decision_record
```

Statuses:

`DRAFT -> REVIEWED -> READY -> RUNNING -> PAUSED -> ENDED -> DECIDED -> ARCHIVED`

Emergency branch:

`RUNNING -> STOPPED_SAFETY`

## 7. Assignment rules

### 7.1 Stable randomization

Randomization should use a stable server-side hash of `experiment_id + randomization_unit_id`, not `Math.random()` on each page load.

Default randomization unit is the internal user for authenticated product experiments. Anonymous-session randomization is allowed only when the hypothesis is truly session-scoped and consent/policy allows it.

A user assigned to a variant remains in that variant for the experiment iteration unless the experiment explicitly defines a safe re-randomization boundary.

### 7.2 Exposure event

Assignment alone is not necessarily exposure. Emit an experiment exposure only when the user actually reaches the surface where the variation could affect behavior.

Required exposure fields:

- experiment ID;
- iteration/version;
- variant;
- randomization unit;
- exposure timestamp;
- metric version set;
- relevant feature/config version.

### 7.3 Mutual exclusion

Experiments that modify the same decision surface or could contaminate each other's primary metric should use a mutual-exclusion layer or explicit exclusion rules.

Examples:

- two onboarding sequence experiments should not independently randomize the same user at the same time;
- two market-order UX experiments affecting trade frequency should not overlap unless the interaction is explicitly designed and powered for analysis.

## 8. Metrics and decision discipline

### 8.1 Metric versioning

A metric definition is immutable within a running experiment iteration. If the query, denominator, attribution window or aggregation changes materially, create a new metric version or new experiment iteration.

Each metric definition documents:

- numerator;
- denominator;
- eligibility population;
- attribution window;
- aggregation unit;
- direction (`higher_better`, `lower_better`, `target_range`);
- data source;
- late-arrival policy;
- exclusions;
- owner.

### 8.2 Primary metric

Each experiment has one primary decision metric unless a multi-objective design is explicitly reviewed. Secondary metrics explain behavior but should not be cherry-picked after results appear.

### 8.3 Guardrails

Standard guardrails include, where relevant:

- API/server error rate;
- page latency and Core Web Vitals;
- accessibility regression;
- support/contact rate;
- report/block rate;
- fraud/abuse rate;
- economy net issuance and hard-sink distortion;
- virtual-market concentration/manipulation alerts;
- cancellation/refund rate;
- notification opt-out rate;
- user-pressure complaint rate;
- under-age/restricted-user exposure violations.

A material guardrail breach stops or pauses the experiment regardless of conversion lift.

### 8.4 Sample and runtime

Do not stop an experiment merely because an early dashboard looks favorable. The registry must define a minimum sample and minimum runtime before launch.

Avoid repeated unplanned peeking with conventional fixed-horizon significance tests. If sequential methods are used, the statistical method must explicitly support sequential monitoring.

Weekly/cyclical product behavior should normally include complete relevant cycles before decision unless a safety stop condition triggers earlier.

## 9. Holdouts and cumulative effects

For high-volume growth/retention programs, maintain a small stable holdout where practical to estimate cumulative impact across multiple experiments.

Planning default for later scale:

- 1–5% stable holdout;
- 1–3 month evaluation window;
- same randomization unit as included experiments;
- no use for safety-critical fixes, legal compliance changes or clearly beneficial accessibility fixes that should ship universally.

Holdout parameters are tuning/operations choices, not gameplay limits.

## 10. Experiments prohibited or restricted

### 10.1 Prohibited

Do not A/B test whether to:

- weaken authentication or authorization;
- skip security controls;
- expose private data;
- reduce legally required notices or rights;
- make cancellation intentionally harder;
- misstate price, scarcity, odds or virtual-currency value;
- make WLD/WDX appear redeemable for real money;
- increase casino-like/FOMO presentation specifically to induce compulsive behavior;
- remove accessibility support from a control group;
- expose child/restricted accounts to disallowed personalized advertising.

### 10.2 Restricted / review required

Require security/privacy/legal or economy review before experimenting on:

- account recovery/authentication;
- age assurance;
- personalized advertising;
- paid subscription checkout/cancellation;
- probability/game-of-chance presentation;
- loan/arrears UX;
- virtual-stock order placement and risk disclosure;
- referral reward value;
- economy faucets/sinks with material supply impact.

## 11. Unlimited-default policy interaction

Experiment infrastructure must not become a hidden gameplay-cap mechanism.

Allowed experimentation controls:

- percentage rollout;
- experiment eligibility;
- safety rate limiting;
- traffic allocation;
- temporary feature rollback.

These are release/measurement controls, not permanent user progression caps.

An experiment must not introduce arbitrary daily play, XP, business, club, purchase or progression ceilings merely to simplify measurement. Economy tests should change prices, sink discovery, reward curves or diminishing returns rather than block ordinary play without a protection reason.

## 12. UI/UX requirements

### 12.1 User-facing product

Experiments should not create visible flicker between variants. Assignment/config should be resolved before rendering when practical.

All variants must define:

- desktop/tablet/mobile layout;
- loading/skeleton state;
- empty state;
- error/offline/maintenance state;
- keyboard navigation;
- visible focus;
- screen-reader labels;
- reduced-motion behavior where relevant;
- no color-only meaning for gains/losses/status.

### 12.2 Experiment admin console

Required views:

1. experiment registry list;
2. experiment detail and hypothesis;
3. allocation/eligibility preview;
4. metric definition/version panel;
5. live guardrail health;
6. exposure/sample-quality checks;
7. result summary and confidence/uncertainty;
8. decision record;
9. audit history.

Admin edit forms must not auto-refresh destructively while an operator is typing. Live metric updates use non-destructive patches or user-controlled refresh.

High-risk experiment starts, allocation increases or emergency stops require reason capture and audit logging.

## 13. Data quality controls

Before an event or metric becomes decision-grade, validate:

- event schema acceptance/rejection rate;
- duplicate `event_id` rate;
- client/server timestamp skew;
- missing subject rate;
- unknown event/property rate;
- exposure before conversion ordering;
- assignment balance;
- sample-ratio mismatch;
- release/config-version consistency;
- late event arrival;
- bot/test/admin traffic exclusions;
- Test versus Production environment separation.

Synthetic QA and staff/admin events must be tagged or excluded so they do not contaminate product metrics.

## 14. Storage and retention

Use separate logical layers:

1. **raw event intake** — shortest practical retention, tightly access controlled;
2. **validated event store** — normalized/allowlisted fields;
3. **derived metric tables** — aggregated product/economy/revenue metrics;
4. **experiment snapshots** — immutable decision evidence;
5. **security/fraud evidence** — governed separately by security policy.

Retention is purpose-specific and versioned. “Keep everything forever in case it becomes useful” is prohibited.

Deletion/anonymization workflows must understand derived analytics. Where full deletion from an aggregate is technically unnecessary or impossible because the data is already irreversibly aggregated, that rationale must be documented.

## 15. Vendor and destination governance

Every external analytics/experimentation destination requires a register containing:

- provider;
- purpose;
- data categories;
- region/transfer considerations;
- processor/controller role as applicable;
- retention;
- deletion API/process;
- consent integration;
- SDK/script source;
- owner;
- security review date;
- legal review status where required.

Do not add a new tracking SDK solely because a dashboard is convenient. Evaluate whether existing first-party events/read models can answer the question first.

Advertising destinations must remain separated from product analytics unless the relevant consent, disclosure and legal basis explicitly permit the connection.

## 16. Release and rollback

Analytics instrumentation changes follow normal code release gates.

Runtime implementation path:

`development branch -> isolated Test exact-SHA -> schema/event validation -> backend/DB/API/UI/consent verification -> Production`

Experiment rollout path:

`DRAFT -> peer review -> Test exposure validation -> READY -> low allocation -> guardrail observation -> planned allocation -> ENDED -> decision -> cleanup`

An experiment must have a kill switch independent of normal UI availability when practical.

## 17. Required initial event catalog

P0 event families:

### Account/onboarding
- `signup_started`
- `account_created`
- `email_verification_completed`
- `onboarding_started`
- `onboarding_step_completed`
- `onboarding_completed`

### Jobs/quests
- `job_started`
- `job_completed`
- `quest_progressed`
- `quest_completed`
- `quest_reward_claimed`

### Market learning
- `watchlist_item_added`
- `market_tutorial_completed`
- `market_order_submitted`
- `market_order_filled`
- `trade_journal_created`
- `trade_journal_reviewed`
- `risk_lesson_completed`

### Economy/sinks
- authoritative ledger transaction categories mapped to analytics facts;
- `shop_purchase_completed`;
- `craft_completed`;
- `marketplace_listing_created`;
- `marketplace_sale_settled`;
- `business_expansion_completed`;
- `city_project_contribution_completed`.

### Season/social
- `season_profile_created`;
- `season_mission_completed`;
- `season_reward_claimed`;
- `club_joined`;
- `community_report_submitted`.

### Billing
- `pricing_viewed`;
- `checkout_started`;
- `subscription_activated`;
- `subscription_cancelled`;
- `refund_completed`.

## 18. Initial experiment backlog with guardrails

### EXP-ONB-001 — onboarding length

Hypothesis: a shorter guided sequence improves onboarding completion without reducing D1 meaningful-action rate.

- Control: five guided steps.
- Variant: three required steps + two recommended later.
- Primary: onboarding completion.
- Secondary: time to first verified job, D1 activated retention.
- Guardrails: support errors, tutorial confusion exits, economy starter-grant duplication, accessibility completion gap.

### EXP-HOME-001 — recommended actions

Hypothesis: one emphasized next action reduces decision paralysis versus three equal choices.

- Primary: meaningful action started within 30 seconds.
- Secondary: five-minute loop completion.
- Guardrails: multi-system exploration, repeated recommendation dismissals, session error rate.

### EXP-RET-001 — comeback mission framing

Hypothesis: progress-summary framing improves return completion without punitive urgency.

- Primary: comeback mission completion within 7 days.
- Guardrails: notification opt-out, user-pressure reports, WLD net issuance per returning user.

### EXP-MKT-001 — risk-learning placement

Hypothesis: showing diversification/risk context adjacent to the first order ticket increases journal/risk-learning completion without increasing raw trade frequency.

- Primary: risk lesson completion.
- Secondary: trade-journal review, diversified portfolio behavior.
- Guardrails: orders per user, loss-chasing proxy, support/report rate.

No experiment should define “more trades” as a standalone success metric.

## 19. Research notes — 2026-09-13

### Google Tag Platform / Consent Mode — official developer documentation, updated 2026-04-17

**Type:** official developer documentation.

**Key implication:** measurement behavior should respond to consent state instead of treating all analytics/ad storage as one undifferentiated permission.

**Adoption:** direct design input for consent snapshots and destination gating. Moneyverse does not commit to Google Analytics as the only analytics provider.

### LaunchDarkly Metrics / Experimentation — current official documentation reviewed 2026-09-13

**Type:** official product/developer documentation.

**Key implication:** metrics used by a running experiment should remain version-stable; experimentation and guarded rollout metrics require explicit definitions.

**Adoption:** direct design input for immutable metric versions and experiment registry fields. No provider selection decision.

### LaunchDarkly Holdouts — current official documentation reviewed 2026-09-13

**Type:** official product documentation.

**Key implication:** stable 1–5% holdouts over roughly 1–3 months can measure cumulative experimentation-program effects.

**Adoption:** reference/default for later-scale holdout design, not a mandatory launch configuration.

### Korea Personal Information Protection Commission enforcement — 2026

**Type:** government enforcement/policy source.

**Key implication:** transparency, meaningful user choice and governance of advertising partners/behavioral information remain active enforcement concerns.

**Adoption:** direct input for separating product analytics, advertising measurement and personalized-ad purposes and for maintaining destination/vendor governance.

## 20. Revenue, legal and SEO impact

### Revenue

This specification improves attribution quality for subscription, cosmetic and advertising economics while preventing real-money revenue events from being confused with WLD issuance/sinks. Better measurement may improve monetization decisions, but experiments may not sell economic or ranking advantage.

### Legal/privacy

Analytics implementation remains subject to jurisdiction-specific privacy review. Consent requirements, cross-border transfer, retention, child/teen treatment and advertising-purpose processing are `legal review required` where applicability depends on the final vendor/configuration and user population.

### SEO

Public acquisition measurement may use aggregate Search Console/Naver/landing analytics, but logged-in account, balance, billing and private portfolio data remain non-indexable and must not be exposed for SEO attribution. Test remains `noindex` and analytically isolated from Production.

## 21. Definition of Done

Analytics/experimentation P0 is complete only when:

- event taxonomy and schema registry exist;
- English/Korean docs remain synchronized;
- consent snapshot and destination gating are implemented;
- prohibited fields are blocked/redacted at intake;
- authoritative economy events come from server/database truth;
- event idempotency/deduplication is verified;
- Test and Production analytics are isolated;
- experiment registry and stable assignment exist;
- exposure events are validated;
- primary/secondary/guardrail metric versions are immutable per iteration;
- SRM/data-quality checks exist;
- experiments have kill switches and auditable decisions;
- retention/deletion rules are documented;
- no experiment weakens security, privacy, accessibility, financial-game safety or unlimited-default policy;
- runtime implementation passes isolated Test exact-SHA before Production.

## 22. Current runtime status

External runtime verification of `easy-scraping.com` was unavailable during this planning pass. Record current status as:

`runtime verification unavailable`

Do not infer implementation from this specification. All items not already proven in runtime/code are `planned / not implemented` until validated.
