# v2026.10.19.922 — Demand-Driven AI Calculator & Blog Widget Growth Engine

Korean translation: [AI_CALCULATOR_BLOG_WIDGET_GROWTH_ENGINE_SPEC_v2026.10.19.922.ko.md](AI_CALCULATOR_BLOG_WIDGET_GROWTH_ENGINE_SPEC_v2026.10.19.922.ko.md)

Status: PLANNING ONLY / implementation and Production acceptance are not claimed.
Base authority rechecked: origin/main 01c34e4b08f200066eca2c35d87788e3fdfd1361.
This specification extends the current 19-calculator catalog and the v681 calculator-learning design. It does not authorize duplicate thin calculators, unsupported financial claims, autonomous financial advice, or unattended AI publishing.

## 1. Objective

Build a search-demand growth loop in which Moneyverse:
1. measures real calculator demand from approved providers;
2. ranks calculator opportunities against existing routes;
3. reuses or extends the current calculator platform instead of producing keyword clones;
4. uses the internal AI only for research assistance, clustering, structured briefs, draft explanations, localization and QA suggestions;
5. renders the correct interactive calculator widget inside related blog articles;
6. requires formula/source tests and editorial approval before YMYL content can be indexed;
7. feeds Search Console performance back into the opportunity score after publication.

The growth loop is:

Demand evidence -> keyword cluster -> calculator gap analysis -> source/formula contract -> calculator implementation -> golden tests -> widget registration -> AI content brief -> AI draft -> source/fact checks -> editorial approval -> publication -> Search Console observation -> improve/merge/retire.

Traffic alone is not the product goal. The primary user goal is to obtain a useful calculation result. The secondary goal is a second useful action such as understanding assumptions, comparing a scenario, reading a relevant explanation, or using the full calculator.

## 2. Current-state findings that this plan must preserve

### 2.1 Latest main has already moved from 12 to 19 calculators

The current main commit adds a dual-surface landing and a 19-item financial calculator catalog. Therefore older documentation that says "12 calculators" is historical and must not be used as the implementation inventory.

Current catalog families include:
- stock averaging / return;
- dividend tax;
- overseas capital-gains tax;
- quant/backtest studio;
- kimchi-premium analysis;
- pension/IRP tax;
- ISA;
- loan repayment;
- real-estate/DSR;
- gift tax;
- general tax;
- FIRE;
- salary take-home;
- Youth Leap Account;
- retirement/severance;
- wealth-goal;
- crypto APY/APR;
- compound interest;
- fictional WLD farming.

Before creating any new calculator, the Opportunity Engine must classify the cluster as EXISTING_EXACT, EXISTING_PARTIAL, MERGE_INTO_EXISTING, or NEW_TOOL_REQUIRED.

### 2.2 Existing blog widget is not calculator-aware

The current BlogInlineCalculator is a hard-coded compound-interest widget. BlogPost only carries a relatedCalculatorHref and relatedCalculatorName, while the article renderer inserts the same compound widget after a fixed paragraph index.

This is insufficient for a tax article, DSR article, salary article, unemployment-benefit article or dividend article. v922 replaces the concept with an allowlisted typed widget registry.

### 2.3 Automatic blog generation is intentionally held

The current POST /api/blog/generate returns EDITORIAL_REVIEW_REQUIRED because legacy content included unsourced or stale market rates, backtest claims, view counts and other financial assertions. v922 explicitly preserves that fail-closed behavior until all new contracts in this specification are implemented and tested.

No environment variable or scheduler may bypass editorial review for financial/YMYL articles.

## 3. Demand evidence architecture

### 3.1 Approved evidence providers

Provider A — Google Search Console:
- Moneyverse first-party impressions, clicks, CTR and average position;
- dimensions: query, page, country, device and date;
- strongest signal for topics for which Moneyverse already receives impressions;
- never interpret sitemap submission or crawl as search traffic.

Provider B — Google Ads Keyword Planning historical metrics:
- approximate average monthly searches;
- monthly search volume history;
- advertising competition and competition index;
- low/high top-of-page bid ranges;
- geo and language targeting;
- data must be stored with observedAt, targeting and provider provenance.

Provider C — NAVER API HUB Search Keyword Trends:
- topic-group search trend series;
- device, age and gender filters where appropriate;
- use the 2026 NAVER API HUB contract, not a deprecated client assumption;
- this provider is a relative trend signal, not invented absolute volume.

Provider D — current site inventory:
- existing route;
- calculator coverage;
- indexed/noindex state;
- source freshness;
- formula version;
- related blog coverage;
- internal-link depth;
- page performance and engagement.

Optional providers may be added only when they have a stable legal API/contract. SERP scraping is not a required dependency.

### 3.2 Evidence record

Each provider observation must carry:
- provider;
- keyword or canonical cluster;
- locale;
- jurisdiction;
- device if applicable;
- geo target;
- observedAt;
- periodStart / periodEnd;
- raw metric names;
- normalized metric values;
- provider account/property identifier without exposing secrets;
- source request/version hash;
- status: VERIFIED, PARTIAL, STALE, FAILED, NOT_AVAILABLE.

The AI cannot fill missing provider metrics with guessed numbers. Missing data remains null/unknown.

### 3.3 Opportunity scoring

Recommended score out of 100:
- 25: verified Google Ads search-volume signal;
- 15: NAVER trend strength and recent momentum for Korean demand;
- 20: Search Console opportunity, especially high impressions with position roughly 4–20 or low CTR on a clearly relevant intent;
- 10: commercial-intent proxy from provider bid data, used only as a secondary business signal;
- 15: Moneyverse product/finance fit;
- 10: calculator gap and usefulness of interactive computation;
- 5: seasonality/freshness timing.

Penalties:
- minus 25 for strong URL cannibalization risk;
- minus 25 if law/rate/source ownership cannot be maintained;
- minus 20 for thin preset-only intent;
- minus 20 if a calculator result cannot add meaningful value over plain text;
- minus 15 for high maintenance cost without an owner;
- minus 40 for policy or compliance risk that cannot be resolved.

Suggested states:
- 75–100: BUILD_CANDIDATE after human review;
- 60–74: RESEARCH_AND_EDITORIAL_REVIEW;
- 40–59: BACKLOG;
- below 40: DO_NOT_BUILD unless strategic evidence changes.

These thresholds are planning defaults, not claims of ranking outcomes.

## 4. Calculator portfolio strategy

### 4.1 Existing 19 calculators first

For each existing calculator, the first optimization question is not "can we create another page?" It is:
- does this route match a large intent cluster;
- can its result become more accurate/useful;
- is the page factually sourced;
- does it have a correct inline widget for articles;
- are related queries better handled as sections/presets rather than separate indexed URLs.

High-value existing clusters likely to receive first demand analysis include salary/take-home pay, loan repayment, DSR/real estate, gift tax, compound interest, FIRE, dividend tax, overseas capital-gains tax, ISA/IRP, Youth Leap Account and stock-average calculations.

### 4.2 New candidate seed queue

The following are discovery seeds only. None are approved for indexation until provider evidence and source contracts pass.

Korean household/employment:
- unemployment-benefit estimator;
- weekly-holiday-pay estimator;
- annual-leave-pay estimator;
- overtime/night/holiday-pay estimator;
- freelancer 3.3% withholding/refund estimator;
- national-pension expected-benefit estimator;
- health-insurance premium estimator;
- parental-leave benefit estimator where official formulas can be maintained.

Tax/property:
- inheritance-tax estimator;
- VAT calculator;
- acquisition-tax breakdown calculator if existing real-estate coverage is insufficient;
- jeonse-vs-monthly-rent effective-cost calculator;
- LTV/DSR affordability calculator if it is materially different from the current real-estate page;
- property holding-tax estimator only with a maintainable annual legal-source pipeline.

Savings/debt/investing:
- installment-savings maturity calculator;
- deposit after-tax interest calculator;
- debt snowball vs avalanche payoff calculator;
- DCA contribution calculator;
- dividend reinvestment/DRIP calculator;
- inflation/purchasing-power calculator;
- exchange-rate and fee calculator;
- portfolio rebalancing calculator;
- emergency-fund target calculator;
- net-worth tracker/calculator with privacy-first local computation.

Global English candidates:
- mortgage affordability;
- debt payoff;
- take-home pay;
- compound interest;
- DCA;
- dividend/DRIP;
- FIRE/SWR;
- net-worth;
- budget split;
- business break-even.

Global expansion requires jurisdiction-specific formulas and native-intent review; Korean tax rules must not be translated into an English-US calculator.

## 5. Calculator Definition contract

Every tool must be registered through one source of truth rather than copied JSX.

CalculatorDefinition fields:
- id;
- canonicalPath;
- intentClusterId;
- displayName by locale;
- category;
- calculatorClass: REAL_WORLD_ESTIMATE, EDUCATIONAL, FICTIONAL_WLD;
- jurisdiction;
- effectiveFrom and effectiveTo;
- formulaId;
- formulaVersion;
- inputSchema;
- outputSchema;
- currency/unit policy;
- roundingPolicyId;
- sourceSetId;
- reviewedAt;
- owner;
- widgetComponentKey;
- allowedBlogPresets;
- indexability;
- sourceState;
- lifecycleState.

Source states:
- VERIFIED_FOR_PERIOD;
- REVIEW_DUE;
- STALE;
- ILLUSTRATIVE_ONLY;
- UNKNOWN.

A REAL_WORLD_ESTIMATE with STALE or UNKNOWN legal/rate sources must fail closed to an educational disclaimer, reduced functionality or noindex depending on risk.

## 6. Formula and source governance

AI may explain a formula but may not establish a legal tax rate, contribution rate, benefit rule, exchange rate or official threshold.

Each formula version requires:
- one or more primary sources when available;
- effective date and jurisdiction;
- machine-readable constants separate from explanatory copy;
- independent golden examples;
- boundary tests;
- rounding rules;
- exclusions;
- update owner;
- scheduled review date.

Tax, salary, pension, benefit, employment and property formulas need annual or event-driven review.

For investment calculators:
- historical returns are examples, not guaranteed assumptions;
- default rates must be labeled as examples;
- real and fictional market data must never be mixed;
- live-data labels require an observedAt timestamp and real provider evidence.

## 7. Typed blog widget registry

### 7.1 Replace the single generic widget

Create a CalculatorWidgetRegistry with explicit component keys such as:
- compound;
- salary;
- loan;
- dsr;
- gift_tax;
- dividend_tax;
- pension_tax;
- fire;
- unemployment_benefit;
- vat;
- dca;
- debt_payoff.

The AI is never allowed to emit executable JSX or JavaScript. It emits a structured WidgetBinding that references an allowlisted key.

WidgetBinding:
- widgetKey;
- calculatorId;
- presetId optional;
- placement;
- heading;
- explanation;
- sourceVersion;
- initialValues containing only public, non-personal example values;
- locale.

Renderer behavior:
1. validate calculatorId and widgetKey against the registry;
2. validate preset against calculator allowedBlogPresets;
3. clamp all input values;
4. render the registered component;
5. expose the full calculator CTA;
6. render assumptions/source state;
7. never serialize sensitive user-entered values into canonical URLs, analytics or structured data.

### 7.2 Article placement rules

Do not inject a widget at a fixed paragraph index.

The content brief defines semantic sections:
- INTRO;
- PROBLEM;
- CALCULATOR_DEMO;
- HOW_IT_WORKS;
- EXAMPLE;
- ASSUMPTIONS;
- SOURCE_NOTES;
- RELATED_ACTION.

The widget belongs in CALCULATOR_DEMO, normally after the user understands what will be calculated and before the long explanation.

One article may contain one primary calculator widget and at most one small comparison widget. More widgets require editorial justification.

### 7.3 Widget UX requirements

- numeric inputs as well as sliders;
- 44px touch target goal;
- keyboard operability;
- aria-live result announcement;
- no color-only meaning;
- result available without sign-in;
- clear sample/default label;
- assumptions and applicable year visible near result;
- link to full calculator;
- no ad placement that imitates a calculate button or interrupts the result.

## 8. Internal AI Content Engine

### 8.1 Allowed AI responsibilities

The internal AI may:
- cluster related keywords;
- summarize provider evidence;
- suggest whether an existing calculator should be extended;
- draft a calculator product brief;
- propose test cases;
- prepare article outlines;
- draft explanations using a supplied source packet;
- propose title/meta variants;
- produce locale drafts after formula/jurisdiction is fixed;
- map a blog article to an allowlisted widget;
- detect possible duplicates and unsupported claims;
- suggest internal links.

The AI may not:
- invent search volume;
- decide a legal/tax rule without a verified source;
- invent market prices or freshness timestamps;
- fabricate authors, credentials, ratings, reviews or user counts;
- publish YMYL content autonomously;
- bypass the current editorial hold;
- create thousands of keyword-variation pages;
- perform financial transactions or change WLD balances.

### 8.2 Source-grounded prompt packet

Every content generation request receives a ContentBrief containing:
- target intent cluster;
- user question;
- target locale/jurisdiction;
- approved calculatorId;
- formulaVersion;
- source excerpts/URLs with effective dates;
- allowed factual claims;
- forbidden claims;
- desired widget binding;
- internal-link candidates;
- required disclosure;
- content freshness deadline.

If a critical source is missing, generation state is SOURCE_BLOCKED and no publishable draft is created.

### 8.3 Draft output schema

The model returns structured data, not an uncontrolled markdown blob:
- title;
- dek/excerpt;
- intentAnswer;
- blocks[];
- citations[];
- widgetBindings[];
- assumptions[];
- riskFlags[];
- metaTitle;
- metaDescription;
- tags;
- relatedLinks[];
- aiDisclosure;
- locale.

Block types are allowlisted: paragraph, heading, list, table, quote, formula, image_reference, widget_slot, source_note.

Unknown HTML/script/style/iframe blocks are rejected.

## 9. Editorial and publication workflow

Lifecycle:
DEMAND_DISCOVERED
-> CLUSTERED
-> GAP_ANALYZED
-> SPEC_REQUIRED
-> SOURCE_VERIFIED
-> CALCULATOR_IMPLEMENTED
-> GOLDEN_TEST_PASS
-> WIDGET_REGISTERED
-> CONTENT_BRIEF_READY
-> AI_DRAFTED
-> AUTOMATED_QA_PASS
-> FACT_CHECKED
-> EDITOR_APPROVED
-> PUBLISH_READY
-> PUBLISHED
-> INDEX_OBSERVED
-> PERFORMANCE_REVIEW
-> OPTIMIZE / MERGE / HOLD / RETIRE.

For YMYL content, EDITOR_APPROVED is mandatory.

The existing /api/blog/generate route should remain fail-closed until it becomes a draft-generation endpoint with:
- administrator/scheduler authentication;
- source packet requirement;
- deduplication;
- non-publishing response;
- immutable generation audit ID.

Publishing should be a separate authenticated action. Generation success must never mean publication success.

## 10. Blog quality rules

Each calculator article must add value beyond repeating the calculator page:
- explain one concrete user decision;
- show one reproducible example;
- expose formula assumptions;
- explain what changes the result;
- include source date/jurisdiction;
- embed the related interactive widget;
- link to the full calculator;
- include a limitations section;
- avoid investment-return guarantees.

Do not publish multiple articles that only change an amount, age or duration. These become presets/sections unless distinct intent and substantial original value are demonstrated.

AI disclosure should be visible when automation materially generated the article, together with editorial/source review status.

## 11. SEO architecture

### 11.1 Canonical model

One canonical calculator URL per real user intent cluster.

Presets are indexable only if all are true:
- distinct search intent;
- distinct explanatory value;
- sufficient demand evidence;
- unique source/assumption context where relevant;
- no cannibalization;
- editorial approval.

Otherwise presets use canonical-to-parent or noindex according to the SEO registry.

### 11.2 Calculator and article relationship

Calculator page:
- primary transactional/informational tool intent;
- concise explanation and sources;
- links to 2–5 genuinely useful articles.

Blog article:
- explanatory/search-learning intent;
- inline widget;
- strong CTA to the canonical calculator.

This creates a bidirectional topic cluster without generating doorway pages.

### 11.3 Structured-data constraints

- Breadcrumb structured data is appropriate when accurate.
- Do not fabricate AggregateRating, review counts or star ratings.
- Do not depend on FAQ rich results as a growth strategy.
- BlogPosting fields must match visible article data.
- Software/Application markup is used only when the page and schema meet applicable guidance.
- AI-generated metadata must be validated like any other output.

### 11.4 Indexing

Google indexing and ranking are not guaranteed by submission.
- Search Console sitemap/inspection evidence is distinct from actual indexed/search-performance evidence.
- Google Indexing API must not be used as a general calculator/blog submission mechanism.
- IndexNow may be used only for engines that support it under the existing SEO policy.
- Search Console clicks/impressions remain the authoritative Google performance loop.

## 12. Data model proposal

Implementation may add these records only after migration review:

SeoKeywordObservation
- provider, clusterId, keyword, locale, jurisdiction, metricsJson, observedAt, period, status.

SeoKeywordCluster
- id, canonicalIntent, locale, jurisdiction, lifecycle, assignedCalculatorId.

CalculatorDefinition
- fields from section 5.

CalculatorFormulaVersion
- calculatorId, formulaVersion, constantsJson, roundingPolicy, effective dates, sourceSetId, approval.

SourceEvidence
- sourceSetId, sourceType, URL, title, effective date, retrievedAt, content hash, reviewer.

CalculatorWidgetManifest
- widgetKey, calculatorId, componentVersion, allowed presets, schemaVersion.

ContentBrief
- clusterId, calculatorId, locale, sourceSetId, allowedClaims, forbiddenClaims, status.

BlogDraftRevision
- draftId, briefId, model/version identifier, prompt template version, structured output, QA flags, createdAt.

BlogWidgetBinding
- draft/post id, widgetKey, calculatorId, presetId, componentVersion.

PublicationAudit
- post id, editor, approval time, sourceSetId, formulaVersion, published SHA.

SeoPerformanceSnapshot
- page/query/date/country/device clicks, impressions, CTR, position and ingestion metadata.

No user calculator inputs are stored in these SEO/content tables.

## 13. Admin UX

Extend existing /admin/seo and /admin/blog rather than creating a parallel platform.

Admin SEO — Calculator Opportunities:
- demand-score table;
- provider badges and last observed date;
- existing route match;
- cannibalization warning;
- source-maintenance risk;
- BUILD / RESEARCH / HOLD decision;
- link to evidence.

Admin Calculator Registry:
- formula/source version;
- effective year;
- review due date;
- widget availability;
- golden-test state;
- indexability.

Admin Blog:
- draft queue;
- target calculator and widget preview;
- citations/source packet;
- unsupported-claim detector;
- duplicate similarity;
- locale parity;
- editor approve/reject/request changes;
- publish state separate from generation state.

## 14. API proposal

Reuse existing auth/CSRF patterns.

Read:
- GET /admin/seo/calculator-opportunities
- GET /admin/seo/calculator-opportunities/:id
- GET /admin/calculators/:id/source-status
- GET /admin/blog/drafts/:id

Actions:
- POST /admin/seo/calculator-opportunities/refresh
- POST /admin/seo/calculator-opportunities/:id/create-brief
- POST /admin/blog/drafts/generate
- POST /admin/blog/drafts/:id/run-qa
- POST /admin/blog/drafts/:id/approve
- POST /admin/blog/drafts/:id/reject
- POST /admin/blog/drafts/:id/publish

All writes need administrator authorization, CSRF protection where browser initiated, idempotency, rate limits and audit records.

## 15. Scheduling

Suggested cadence:
- Search Console opportunity ingestion: daily after data availability;
- NAVER trend refresh: daily/weekly according to quota and value;
- Google Ads historical volume refresh: monthly, aligned with provider data refresh;
- source freshness checks: daily metadata check plus event/annual review;
- opportunity re-score: after any provider refresh;
- AI draft generation: only for approved briefs, bounded daily queue;
- publication: never on the draft scheduler; editor action or separately approved editorial schedule.

A scheduler failure must produce a visible failed/stale state rather than silently reusing old numbers as current.

## 16. Analytics and success metrics

Search metrics:
- qualified impressions;
- clicks;
- CTR;
- average position by query/page/country/device;
- non-brand calculator clicks;
- index coverage state.

Product metrics:
- calculator_start;
- calculator_valid_result;
- assumptions_opened;
- scenario_compared;
- article_widget_interaction;
- full_calculator_from_article;
- second_useful_action.

Business metrics:
- qualified public pageviews;
- measured ad RPM where allowed;
- return sessions;
- optional signup after value delivery.

Quality guardrails:
- formula error reports;
- stale-source events;
- editorial rejection rate;
- unsupported claim rate;
- cannibalization;
- Core Web Vitals;
- accessibility defects.

Never log raw salary, tax, debt, balance or other sensitive numeric inputs into analytics.

## 17. Test strategy

Calculator tests:
- independent golden cases;
- zero/negative/boundary values;
- very large values;
- rounding;
- date/effective-period boundaries;
- locale currency/unit;
- property-based/fuzz tests for deterministic formulas;
- stale-source fail-closed tests.

Widget tests:
- correct registry mapping;
- invalid widget/preset rejection;
- keyboard/screen-reader;
- 320–430px and 400% zoom;
- no private values in URL/analytics;
- lazy-load and bundle regression.

Content tests:
- generation requires source packet;
- unsupported factual claims rejected/flagged;
- HTML/script injection rejected;
- duplicate similarity guard;
- AI disclosure present;
- widget binding uses the correct calculator;
- no publish on draft-generation success;
- editorial hold preserved unless contract passes.

SEO tests:
- canonical;
- hreflang only for real localized equivalents;
- sitemap inclusion rules;
- noindex for thin/stale/unsafe pages;
- structured data truthfulness;
- no fake ratings;
- Google submission state not mislabeled as indexing.

Release acceptance:
- branch CI;
- exact-SHA isolated Test;
- backend health;
- authenticated admin flow;
- full calculator public flow;
- blog draft/approval/publish flow in Test;
- rollback;
- current project financial and v530 UI gates remain authoritative where applicable.

## 18. Phased implementation

Phase A — truth and inventory
- reconcile 12-vs-19 calculator documentation;
- move catalog metadata to CalculatorDefinition;
- audit formulas/source dates;
- audit fake/unsupported structured claims;
- keep legacy AI blog publication hold.

Phase B — demand engine
- provider adapters;
- observation storage;
- clustering/scoring;
- admin opportunity table;
- first measured queue with no automatic creation.

Phase C — widget platform
- typed registry;
- convert existing compound blog widget;
- implement 5 highest-value existing calculator widgets first;
- semantic blog block renderer.

Phase D — AI draft engine
- source-grounded briefs;
- structured draft schema;
- automated QA;
- admin preview;
- no auto publish.

Phase E — first growth cohort
- choose 3 existing calculators using measured demand;
- improve them;
- create one high-quality article each;
- measure 28 days before scaling.

Phase F — new calculators
- build only evidence-approved gaps;
- one calculator at a time;
- formula/source tests before SEO release.

Phase G — locales
- expand calculator/blog pairs only after source/jurisdiction and native-intent parity.

## 19. Initial launch cohort recommendation

Do not start by building 20 new tools.

Cohort 1 should use existing high-intent calculators and validate the loop:
1. salary/take-home pay;
2. loan/DSR;
3. gift tax or compound interest depending on measured provider demand.

Each gets:
- source audit;
- one typed inline widget;
- one source-grounded article;
- bidirectional internal links;
- Search Console measurement.

After the pipeline proves quality, the first new calculator should be the highest measured gap among unemployment benefit, weekly holiday pay, national pension, VAT, inheritance tax or jeonse-vs-rent — not whichever keyword merely sounds popular.

## 20. Definition of Done

Planning done:
- this specification exists in English and Korean;
- current 19-calculator baseline is acknowledged;
- demand-provider contracts are defined;
- AI safety/editorial contract is defined;
- typed widget architecture is defined;
- SEO and test gates are defined.

Implementation done for a calculator/article pair only when:
- demand evidence is stored;
- source/formula version is verified;
- golden tests pass;
- correct widget is registered;
- article draft has citations and AI disclosure;
- automated QA passes;
- editor approves;
- exact-SHA Test passes;
- Production promotion follows the project release procedure;
- search performance is measured rather than promised.

## 21. Primary references checked for v922

- Google Search Central — Creating helpful, reliable, people-first content.
- Google Search Central — Guidance on generative AI content.
- Google Search Console Help — Performance report metrics and query/page dimensions.
- Google Ads API — GenerateKeywordHistoricalMetrics.
- NAVER API HUB — Search keyword trends API.
- Existing Moneyverse v527 SEO demand plan.
- Existing Moneyverse v681 calculator-learning plan.
- Existing Moneyverse v719/v721/v735 AI blog safety history.

The key rule is simple: internal AI accelerates evidence-backed product/editorial work; it never manufactures the demand evidence, formula authority or publication approval.
