# Internal-AI Search-Demand Calculator & Blog Widget Growth Engine — v2026.10.19.931

**English canonical** | [한국어](AI_SEARCH_DEMAND_CALCULATOR_BLOG_ENGINE_SPEC_v2026.10.19.931.ko.md)  
**Status:** PROPOSED / PLANNING ONLY / not implemented, tested, or promoted  
**Baseline main:** `74d98ca58db9201a187dd6f20107e32393358684` (2026-10-19 KST)

## 1. Product decision

Build a demand-driven calculator/content system, not an automated SEO page factory. The current financial-blog generation endpoint intentionally returns `EDITORIAL_REVIEW_REQUIRED` because the legacy generator previously produced unsourced market/backtest claims and repeated titles. This safety boundary stays in place.

The system has four layers:

1. **Demand Intelligence** — ingest measured search and product signals; AI clusters queries, classifies intent, and scores opportunities.
2. **Calculator Registry** — one source of truth for formulas, jurisdiction, effective dates, official sources, inputs, outputs, validation, and fixtures.
3. **Widget Renderer** — full calculator pages and inline blog widgets reuse the same compute modules.
4. **Editorial AI** — creates source-bounded drafts; no publication before fact checks, formula fixtures, duplicate checks, and explicit editorial approval.

## 2. Existing assets

The site already has salary, loan, compound interest, gift tax, capital-gains tax, dividend tax, ISA, pension/retirement, FIRE, youth savings, stock-average/return, real-estate, crypto APY, kimchi premium, goal wealth, tax, and quant tools. New work must extend gaps rather than create duplicates.

`BlogInlineCalculator` already embeds a compound-interest tool but is hard-coded to principal/rate/years. It should remain as a compatibility wrapper while a generic registry-driven `BlogCalculatorWidget` is introduced.

The blog generation route remains fail-closed. Do not add a bypass flag.

## 3. Demand evidence

Each keyword cluster receives a measurement status:
- `MEASURED`
- `RELATIVE_TREND_ONLY`
- `GSC_IMPRESSION_ONLY`
- `INFERRED_DEMAND`
- `NO_DATA`

Never show inferred demand as monthly search volume.

Primary inputs:
- Google Search Console query/page/country/device metrics
- Naver exposure/click/index evidence
- calculator executions and completions
- internal search
- blog→calculator CTR
- calculator→save/signup/return

Optional external inputs:
- Google Trends
- Naver DataLab
- approved Keyword Planner / Naver Ads volume APIs
- SERP quality audit

## 4. Opportunity score

```text
Opportunity =
  .25 DemandScore
+ .15 TrendScore
+ .15 IntentFit
+ .15 SiteAuthorityFit
+ .10 ExistingGap
+ .10 ConversionFit
+ .10 FreshnessAdvantage
- RiskPenalty
```

Risk penalties cover rule volatility, YMYL accuracy, missing demand evidence, cannibalization, and duplication.

## 5. Priority calculator portfolio

Initial demand hypotheses; not claimed monthly volumes:

| Tier | Calculator | Current | Rationale |
|---|---|---|---|
| P0 | Salary net pay | Existing | strong recurring “take-home” intent |
| P0 | Loan amortization | Existing | direct monthly-payment intent |
| P0 | DSR / stress DSR | Candidate | regulation + borrowing-capacity intent |
| P0 | Severance pay | Candidate | deterministic employment calculation |
| P0 | Compound savings | Existing | broad saving/goal intent |
| P0 | Gift tax | Existing | high-intent tax query |
| P1 | Deposit after-tax interest | Candidate | rate comparison intent |
| P1 | Installment savings maturity | Candidate | recurring bank-product intent |
| P1 | Home acquisition tax | Candidate | transaction-stage intent |
| P1 | Brokerage fee | Candidate | home transaction cost intent |
| P1 | Rent/deposit conversion | Candidate | housing comparison intent |
| P1 | Pension/retirement | Existing | long-horizon planning |
| P1 | Capital gains | Existing | transaction-stage tax intent |
| P2 | Credit-card installment cost | Candidate | consumer-finance intent |
| P2 | Auto loan | Candidate | monthly-payment intent |
| P2 | VAT | Candidate | business utility |
| P2 | Margin/markup | Candidate | merchant utility |
| P2 | Break-even | Candidate | business utility |
| P3 | FX fee | Candidate | seasonal travel/investment |
| P3 | Inflation purchasing power | Candidate | education |
| P3 | CAGR | Candidate | global evergreen |

Final order comes from measured data.

## 6. Calculator Registry contract

Each calculator stores:
- id/version/category
- locale policy: KR_ONLY, LOCALIZED_RULESET, GLOBAL_FORMULA
- input and output schemas
- presets
- official sources and jurisdiction
- legal disclaimer key
- effective range
- compute module
- validation module
- freshness policy
- SEO cluster
- widget mode

AI never invents runtime formulas. Regulated/tax calculators cannot be enabled without effective date and source evidence.

## 7. Generic blog calculator widget

`BlogCalculatorWidget` accepts `calculatorId`, optional preset, article context, and compact mode.

Widget modes:
- COMPACT_SINGLE_RESULT
- COMPARE_TWO_SCENARIOS
- AMORTIZATION_PREVIEW
- TAX_BREAKDOWN
- GOAL_PROGRESS
- WHAT_IF

It shows 2–5 context-relevant inputs, 1–3 results, effective date/source, last verification, and a full-calculator CTA. It must work at 320px, with keyboard/screen-reader support and a useful no-JS fallback.

## 8. Editorial AI workflow

State machine:
`IDEA → DATA_READY → DRAFTED → FACT_CHECKED → EDITOR_APPROVED → SCHEDULED → PUBLISHED → MONITORED → REFRESH_REQUIRED`

AI receives only an approved source bundle, calculator fixtures, keyword intent, locale, duplicate context, prohibited claims, and internal links.

Every draft contains:
1. direct answer
2. mechanism
3. formula/rule
4. two worked examples generated from calculator fixtures
5. inline calculator
6. interpretation
7. common mistakes
8. primary sources
9. as-of date
10. related calculator/content
11. AI-assisted disclosure

Blocked claims include unsourced “latest” rates, guaranteed returns/refunds/loan approval, fake ratings, and WLD-to-real-money implications.

## 9. Duplicate controls

- normalized-title similarity > .82: block
- article semantic similarity > .90: block
- one canonical page per calculator+intent+locale
- prefer refresh over new article when new value is insufficient

## 10. Weekly AI opportunity job

1. Pull last 28/90 days of measured search/product data.
2. Detect calculator-intent language.
3. Cluster queries.
4. Map to existing calculators.
5. Score top opportunities.
6. Present top 20 to admin.
7. Human classifies Research / Plan / Build / Hold / Exclude.

No automatic public page creation.

## 11. Admin UX

Proposed `/admin/seo/calculators` shows:
- query cluster
- measurement status
- impressions/clicks/trend/position
- current destination
- calculator coverage
- opportunity score
- rule freshness risk
- estimated implementation effort
- recommended action

Detail view shows query set, trend, official sources, content gap, suggested inputs/outputs, five article ideas, and cannibalization warnings.

Actions: Generate Plan, Create Draft Queue, Suggest Existing Calculator Improvements, Revalidate Sources, Request Editorial Review.

No “publish automatically” action.

## 12. Proposed data model

- `seo_keyword_clusters`
- `calculator_definitions`
- `calculator_sources`
- `content_editorial_jobs`
- `content_quality_checks`

Implementation must preserve the existing DB privilege boundary; use scoped database functions rather than broad application table grants.

## 13. SEO contract

Calculator pages must provide:
- unique title/H1
- canonical
- hreflang only for truly localized content
- WebApplication schema
- visible FAQ if FAQ schema is emitted
- breadcrumbs
- effective year and verification time
- primary sources
- methodology
- related articles/calculators
- sitemap inclusion

Do not mass-index preset-value pages, refresh dates without substantive changes, fabricate aggregate ratings, or claim “latest 2026 rules” without evidence.

A separate audit should review existing static ratings and “fully reflects latest rules” claims.

## 14. Analytics

Events:
- calculator_landing_view
- calculator_result_completed
- calculator_preset_used
- calculator_source_opened
- article_calculator_widget_view
- article_calculator_widget_completed
- article_to_full_calculator
- calculator_save_completed
- calculator_to_signup
- search_query_cluster_landed

Do not send raw salary, debt principal, or other user-entered financial values to external analytics. Use buckets/boolean events.

## 15. AI role separation

- Keyword Analyst
- Product Planner
- Editorial Writer
- Fact Checker
- Duplicate Reviewer
- Refresh Planner

The same AI step must not both author and approve publication.

## 16. Freshness

Examples:
- tax/policy: weekly source check + event-triggered review
- pension/social insurance: monthly + annual rollover
- loan math: fixed formula; rates are user inputs rather than unsourced “current rate”
- market statistics: publication timestamp required
- jurisdiction rules: primary authority first

Source hash changes create REFRESH_REQUIRED. Severe correctness risk fails the calculator closed.

## 17. QA

Calculator:
- official fixtures
- boundary/zero/negative/extreme values
- rounding
- monthly/yearly conversion
- amortization totals
- tax-band boundaries

SEO:
- canonical
- sitemap
- duplicate title
- robots
- reciprocal hreflang
- structured-data validation
- correct HTTP status

Editorial:
- source coverage for numerical claims
- unsupported claims = 0
- duplicate gates
- disclosure
- as-of date
- embedded widget calculation pass

UI:
- 320/375/768/1024/1440
- keyboard and screen-reader
- reduced motion
- no-JS fallback

## 18. Implementation phases

Phase 0: measure real demand and audit current metadata trust.  
Phase 1: registry, compute contract, fixtures, generic widget.  
Phase 2: keyword ingestion, clustering, scoring, admin dashboard.  
Phase 3: build top three measured calculator gaps using TDD.  
Phase 4: source-bounded editorial AI and approval receipts.  
Phase 5: calculator→article→save/signup/return growth loop.

## 19. Release gate

A calculator/content release is accepted only when:
- official fixtures pass
- unit/integration tests pass
- unsupported financial claims are zero
- no auto-publication bypass exists
- editorial approval receipt exists
- canonical/sitemap/hreflang checks pass
- the legacy blog 503 safety gate is not unintentionally removed
- Test deployment verifies frontend/backend behavior
- Production promotion follows existing zero-downtime release policy and remains independent of unresolved financial-ledger release blockers

Planning approval is not production approval.

## 20. First 30 days

D1–3: inventory all calculators, map GSC queries, add measurement-status labels, audit metadata trust.  
D4–7: generic widget, registry prototype, compatibility wrapper, admin opportunity prototype.  
Week 2: top one or two measured gaps + two source-backed article drafts per calculator.  
Week 3: third calculator, three widget modes, internal links, refresh queue.  
Week 4: evaluate impressions, CTR, calculator completion, widget→calculator conversion; stop low-quality clusters and invest only in winners.

## 21. References

- Google Search Central, generative AI guidance: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content/
- Google Search Central, helpful people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google Search Essentials: https://developers.google.com/search/docs/essentials
- Naver Search Advisor SEO basics: https://searchadvisor.naver.com/guide/seo-basic-intro
- Naver content exposure/click report: https://searchadvisor.naver.com/guide/report-expose-ctr
- Naver URL inspection: https://searchadvisor.naver.com/guide/url-inspection

Google explicitly warns that generating many low-value pages with generative AI can violate scaled-content-abuse policies, while interactive tools such as calculators can themselves be primary page content. Therefore success is defined by useful, accurate calculators and source-backed explanations—not article volume.
