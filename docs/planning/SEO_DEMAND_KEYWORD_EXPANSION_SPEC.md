# Woldeok Moneyverse — SEO Demand & Keyword Portfolio Expansion Specification

> Version: v2026.10.05.527  
> Status: PLANNING / RESEARCH / DOCUMENTATION ONLY  
> Date: 2026-10-05  
> Korean counterpart: [SEO_DEMAND_KEYWORD_EXPANSION_SPEC.ko.md](SEO_DEMAND_KEYWORD_EXPANSION_SPEC.ko.md)  
> Parent authority: [PROJECT_PLAN.md](PROJECT_PLAN.md), [INTEGRATED_PLANNING_MASTER.md](INTEGRATED_PLANNING_MASTER.md)  
> Related authority: [GLOBAL_GROWTH_SEO_REVENUE_SPEC.md](GLOBAL_GROWTH_SEO_REVENUE_SPEC.md), [GLOBAL_GROWTH_EXECUTION_SPEC.md](GLOBAL_GROWTH_EXECUTION_SPEC.md), [SEO_INTENT_TO_PLAY_ACTIVATION_GROWTH_SPEC.md](SEO_INTENT_TO_PLAY_ACTIVATION_GROWTH_SPEC.md)

## 1. Purpose

Moneyverse must grow qualified organic search demand in Korea and overseas without turning programmatic SEO into a page-count factory.

The operating loop is:

`measured demand -> useful answer/tool -> second useful action -> optional signup -> first product activation -> return visit -> qualified pageviews -> observed advertising economics`

This specification owns the **keyword-demand portfolio**: how candidate queries are discovered, normalized, grouped, validated, mapped to page families, admitted to indexing, measured, expanded, merged, or retired.

It does not authorize publishing one URL per keyword. A candidate keyword is research inventory, not an indexable page.

## 2. Current exact-main baseline

The planning cycle started and was rechecked mid-work against `origin/main=5318213f1eca644c7f36df7d967a53092de0814c`.

The current repository already contains substantial search surfaces:

- public calculator/tool families for salary, capital-gains tax, pension tax, retirement, ISA, compound growth, loan interest, dividends, real estate, kimchi premium, stocks, tax and goal wealth;
- 50 financial glossary terms across KO/EN/JA/ZH with SearchAutocompletePopover real-time discovery;
- 13 high-demand 2026 gift tax presets (/tools/gift-tax-calculator/[preset]);
- 18 localized global compound & FIRE retirement calculator routes (EN/JA/ZH × 5 longtail presets + 5 global currency segment toggle);
- dividend calendar widget with 1~12 month after-tax cashflow Excel-compatible UTF-8 BOM CSV export;
- HTML5 Canvas 2D viral infographic share card dialog (ViralShareCardDialog) and Twitter/X Web Intent sharing;
- 50 generated salary amount bands;
- 34 explicit loan pSEO presets;
- 44 dividend ticker records;
- 11 capital-gains presets, 11 real-estate presets and 11 kimchi-premium presets;
- IndexNow protocol (Bing/Naver/Yandex/Seznam) real-time batch ping pipeline covering all tools, gift tax, global compound, and glossary pages.

That means the next growth problem is not “create pSEO.” It is **control, demand validation, differentiated value, source freshness, cannibalization management and conversion quality**.

The unmerged remote branch `origin/plan/search-to-user-growth-v2026.10.04.525` is treated as read-only concurrent planning input. If it later merges, v527 composes with it: v527 owns demand/keyword acquisition taxonomy and v525 owns the broader search-to-user lifecycle.

## 3. Non-negotiable rules

1. Korean remains the public/product fallback locale.
2. Korea and overseas are planned separately; locale does not equal legal jurisdiction.
3. Search Console/Search Advisor measure actual Moneyverse search performance. They are not market-wide keyword volume.
4. Market demand estimates must identify provider, market, language, period and observation date.
5. Synthetic/fallback traffic numbers cannot be displayed or used as live evidence.
6. No fixed URL target, keyword target or translation target authorizes indexation.
7. No doorway pages, keyword stuffing, scaled low-value pages or search-result scraping.
8. Every indexable page must have an independent user task and useful result before advertising or signup pressure.
9. Finance/tax/loan/retirement calculators must have explicit source, effective date, jurisdiction, assumptions and stale-data behavior.
10. Private/account/admin/security/transaction/casino/chance surfaces are not SEO inventory.
11. Published locale pages require real language parity; template-only translation is insufficient.
12. A new keyword variant that does not justify distinct user value is merged into an existing canonical page.

## 4. Demand evidence model

Every keyword/query opportunity uses one of these evidence states:

| State | Meaning | Can drive indexation? |
|---|---|---|
| `LIVE_GSC` | Real Google Search Console query/page/country/device evidence | Yes, with content gate |
| `LIVE_NAVER` | Real Naver Search Advisor/search-performance evidence | Yes, with content gate |
| `NAVER_DATALAB_TREND` | Naver relative trend evidence | Supporting evidence only |
| `KEYWORD_PLANNER_ESTIMATE` | Google Ads market demand/cost estimate | Yes, as estimated demand |
| `OTHER_PROVIDER_ESTIMATE` | Named provider with market/language/date | Supporting/estimated |
| `INTERNAL_SEARCH_DEMAND` | Moneyverse site-search/no-result demand | Yes, if externally useful |
| `COMMUNITY_DEMAND` | Repeated public support/community question | Supporting |
| `NO_DATA` | Provider connected but no usable evidence | No |
| `NOT_CONNECTED` | Provider unavailable | No |
| `FETCH_ERROR` | Retrieval failed | No |
| `SYNTHETIC_TEST_DATA` | Fixture/dev only | Never |

Search Console API data can be segmented by query, page, country and device, but its API is subject to internal limits and does not guarantee every row. Therefore absence from a GSC export is not proof of zero market demand.

Naver DataLab is a trend-comparison input, not an exact monthly-search-volume substitute.

## 5. Keyword registry contract

Each candidate must be representable as:

```text
KeywordOpportunity {
  id
  locale
  market
  cluster
  seed
  modifiers[]
  normalizedQuery
  intentFamily
  landingFamily
  evidenceState
  provider
  demandValue
  demandUnit
  observedAt
  period
  competition
  cpcEstimate
  currentLandingUrl
  currentClicks
  currentImpressions
  currentCtr
  currentPosition
  productRelevance
  independentValue
  localizationReadiness
  freshnessRisk
  complianceRisk
  retentionPotential
  adSuitability
  cannibalizationGroup
  priorityScore
  decision
  reason
}
```

`decision` is one of `P0 | P1 | P2 | HOLD | MERGE | NOINDEX | RETIRE`.

The generated v527 registry contains **10,473 discovery candidates**: 6,207 Korean candidates and 4,266 English candidates across 25 curated demand clusters. Every row is `UNVALIDATED_CANDIDATE / HOLD_UNTIL_EVIDENCE`; the registry itself does not authorize a page.

Registry artifact: `../findings/SEO_DEMAND_KEYWORD_REGISTRY_v2026.10.05.527.csv`  
Registry SHA-256: `4e85672667970b41a33222b7005215ef630900daa935674cb8b7f21fcf901b79`.

## 6. Korea keyword portfolio

### 6.1 P0 Korean clusters

| Cluster | Core seeds | Primary page families | Product bridge |
|---|---|---|---|
| Salary & work | 연봉, 월급, 실수령액, 시급, 주휴수당, 퇴직금, 통상임금, 실업급여, 4대보험 | calculator + guide + glossary | career/income simulation |
| Savings & deposits | 예금, 적금, 세후이자, 단리, 월복리, 일복리, 저축목표 | calculator + comparison | virtual bank/savings |
| Loans & housing debt | 대출이자, 월상환금, 원리금균등, 원금균등, DSR, DTI, LTV, 전세대출, 주담대 | calculator + guide + comparison | virtual bank/debt education |
| Investing & compounding | 복리, CAGR, ROI, 미래가치, 현재가치, 평단가, 물타기, 손익분기 | calculator + glossary | virtual stock simulator |
| Dividends | 배당금, 세후배당, 배당수익률, 월배당, 재투자, 목표배당 | calculator + entity + guide | watchlist/virtual investing |
| Retirement/FIRE | 국민연금, 연금저축, IRP, 은퇴자금, FIRE, Coast FIRE, 4% 룰, 안전인출률 | calculator + guide + glossary | long-horizon economy simulator |
| Real estate | 취득세, 양도세, 중개수수료, 전월세전환율, 임대수익률, 전세월세비교 | calculator + comparison | virtual property/business |
| Personal finance | 순자산, 예산, 비상금, 저축률, 부채비율, 월생활비 | calculator + planner | personal economy dashboard |

### 6.2 P1 Korean clusters

- tax explainers and calculators: 소득세, 종합소득세, 금융소득 종합과세, 증여세, 상속세, 재산세;
- inflation/value: 물가상승률, 구매력, 실질수익률, 실질금리, 화폐가치;
- business/startup: 손익분기, 마진율, 원가, 판매가, 현금흐름, CAC, LTV, 번레이트, 런웨이;
- FX/international investing: 환율, 환전수수료, 환차손익, 김치프리미엄;
- financial glossary expansion tied to real calculators and guides.

### 6.3 P2 Korean product-discovery clusters

- 경제 시뮬레이션;
- 가상경제 게임;
- 주식 게임 / 투자 게임;
- 금융 게임;
- 사업 시뮬레이션 / 회사 경영 게임;
- 가상경제 인플레이션 / 통화량 시뮬레이션;
- 가상 직업 수입 비교.

These must describe Moneyverse truthfully as a virtual economy/game. They must not imply real returns, guaranteed investing performance or real banking products.

## 7. Overseas keyword portfolio

### 7.1 P0 English clusters

| Cluster | Core seeds | Primary page families | Product bridge |
|---|---|---|---|
| Interest & savings | compound interest, simple interest, future value, present value, APY, savings goal | calculator + guide | virtual bank / saved preset |
| Investing | investment growth, DCA, CAGR, ROI, average cost, stock profit, rebalancing | calculator + glossary | stock simulator/watchlist |
| Dividends | dividend income, dividend yield, DRIP, yield on cost, dividend growth | calculator + entity | virtual investing |
| Retirement/FIRE | retirement, FIRE number, Coast FIRE, Lean/Fat/Barista FIRE, SWR, 4 percent rule | calculator + guide | long-term simulator |
| Loan/debt | loan payment, amortization, payoff, debt snowball, debt avalanche, credit-card payoff | calculator + guide | debt/credit education |
| Mortgage | mortgage payment, affordability, refinance, down payment, rent vs buy | calculator + comparison | housing simulation |
| Income | salary, paycheck, take-home pay, hourly-to-salary, overtime, gross-to-net | calculator | career simulation |
| Personal finance | net worth, savings rate, budget, emergency fund, debt-to-income, cash flow | calculator + planner | personal economy dashboard |
| Business/startup | break-even, margin, markup, pricing, burn rate, runway, unit economics, CAC/LTV | calculator + guide | virtual business |

### 7.2 English glossary/knowledge graph

Grow the current glossary around high-connectivity concepts rather than alphabetical volume alone. Priority concepts include:

`APR, APY, CAGR, ROI, ROE, ROA, EPS, P/E, P/B, EBITDA, free cash flow, market cap, beta, alpha, Sharpe ratio, volatility, drawdown, dividend yield, yield on cost, DCA, compounding, amortization, principal, nominal return, real return, inflation, liquidity, leverage, debt-to-equity, diversification, asset allocation, rebalancing, expense ratio, bond yield, yield curve, duration, present value, future value, NPV, IRR, WACC, break-even, gross margin, operating margin, net margin, cash flow, burn rate, runway`.

A glossary term should link to a calculator, guide, entity page or simulator when a real semantic relationship exists.

### 7.3 International product-discovery cluster

- economy simulator;
- virtual economy game;
- browser economy game;
- multiplayer economy game;
- business simulation game;
- money simulator;
- personal finance simulator;
- financial literacy game;
- investing simulator;
- stock market simulator.

These pages compete on actual product usefulness, not repetitive “best game” copy.

## 8. Candidate expansion grammar

The discovery engine can create candidate queries through:

`seed × intent modifier × amount × period × scenario × market × locale`

Examples:

- `대출 이자 × 3억원 × 30년 × 계산기`;
- `배당금 × 세후 × 월별 × 계산기`;
- `FIRE × 40대 × 목표자산 × 계산기`;
- `compound interest × $100,000 × 10 years × calculator`;
- `mortgage × extra payment × comparison`;
- `Coast FIRE × with inflation × calculator`.

This multiplication is **research expansion only**. The number of combinations is not an SEO KPI.

Before a candidate becomes a distinct URL, it must prove that its result, data, explanation, interaction or decision support is materially different from the canonical parent page. Otherwise the modifier becomes an input preset, anchored section, FAQ, table row or internal-search synonym rather than a new page.

## 9. Landing-family architecture

### Calculator
Must return a useful result before signup, explain formula/assumptions, expose source/effective date when rules are external, and support accessible input/error states.

### Guide
Answers a task or decision with original explanation, examples, limitations, related tools and next actions.

### Glossary/entity
Defines one concept/entity with relationships, examples, calculation links and source context. Glossary sets may use Schema.org `DefinedTerm` / `DefinedTermSet`; Google rich-result eligibility must never be assumed merely from Schema.org vocabulary.

### Comparison
Compares materially different options using explicit dimensions and assumptions. It cannot exist only to target “A vs B.”

### Simulator
Provides an interactive scenario in which user inputs materially change the result. Moneyverse simulators must clearly label virtual/game values.

### Data/entity page
Requires maintained source data, update timestamps, stale behavior and meaningful entity-specific content. Ticker/entity pages cannot be template-only.

## 10. pSEO admission gate

A proposed pSEO family enters indexable production only when all are true:

1. independent task/intent exists;
2. measured or explicitly estimated demand exists;
3. main result is useful without signup or ad click;
4. content is not a near-duplicate of the parent/sibling;
5. calculation/data is maintained and testable;
6. source, jurisdiction and effective date are known where relevant;
7. title/H1/body are natural and not keyword-stuffed;
8. canonical decision is deterministic;
9. sitemap/internal-link placement is intentional;
10. locale copy has passed target-language review;
11. privacy/compliance/financial-safety review is complete when required;
12. performance budget is acceptable;
13. analytics event model exists;
14. there is a merge/noindex/retire path.

Google explicitly treats doorway pages, keyword stuffing and scaled low-value content as spam. The registry therefore stays separate from the published URL registry.

## 11. Financial/YMYL-like accuracy gate

Moneyverse is not a financial adviser. Public finance utilities may be educational, but rule-based pages can still harm users when stale or falsely precise.

Each rule/data-backed calculator stores:

`sourceAuthority, sourceUrl, jurisdiction, effectiveFrom, checkedAt, nextReviewAt, calculationVersion, assumptions, disclaimer, staleAction`.

`staleAction` is one of:

- `KEEP_WITH_STATIC_MATH`: formula is timeless and inputs are user supplied;
- `WARN`: supporting rate/data may be old, but result remains educational;
- `NOINDEX`: page can remain accessible but should not continue search acquisition;
- `DISABLE_RESULT`: authoritative rule is too stale/uncertain to calculate safely.

Korean source registry should prefer the relevant official authority, including National Tax Service/finance ministry for tax rules, NPS for national pension, NHIS for health/long-term-care insurance, Financial Services Commission/FSS for lending rules, Bank of Korea for monetary/statistical series, and applicable statutes/regulators for housing or financial policy.

International calculators must be market-specific. Example first-party reference families include SEC Investor.gov for compound-interest education/calculators, CFPB for U.S. mortgage/loan explanations and IRS for U.S. withholding tools. A U.S. rule must never silently power a generic global page.

## 12. Search-engine operating model

### Korea

Use Google Search Console + Google Keyword Planner + Naver Search Advisor + Naver DataLab as complementary evidence:

- GSC: actual Moneyverse Google impressions/clicks/CTR/position;
- Keyword Planner: estimated Google market demand/cost;
- Naver Search Advisor: crawl/index/site quality;
- Naver DataLab: relative search trend by topic, device, sex and age ranges where available.

Naver content/title/description rules reinforce unique, descriptive metadata and warn against unrelated popular keywords or repetitive keyword lists.

### Overseas

Use Google Search Console/Keyword Planner by country/language plus Bing Webmaster Tools. Bing’s current webmaster guidance states that crawlability, indexing accuracy, URL consolidation, content clarity and trust also affect eligibility for Bing/Copilot grounding and citations.

Use IndexNow for supported-engine freshness after real add/update/delete events. Submission success is not indexing/ranking success.

Do not automate Google search-result scraping to measure rank. Google classifies automated search queries without permission as machine-generated traffic under its spam policies.

## 13. Internationalization

Release order stays:

1. Korean baseline;
2. English markets;
3. Japanese;
4. German;
5. French;
6. Spanish;
7. Brazilian Portuguese;
8. other markets after separate demand/compliance review.

For each localized page:

- the explicit locale URL is stable regardless of visitor IP;
- self-canonical is used for a valid published locale page;
- reciprocal hreflang only links real equivalent content;
- visible main content must actually be in the target language;
- native/product review is required before indexation;
- untranslated/stale/mixed pages are noindex and excluded from sitemap/hreflang.

## 14. Internal-link knowledge graph

Required graph pattern:

`topic hub -> calculator -> related guide -> glossary/entity -> Moneyverse simulator/product action`

and reciprocal contextual links where useful.

Examples:

- `복리 계산기 -> CAGR 뜻 -> 목표자산 계산 -> Moneyverse 가상은행`;
- `대출 계산기 -> DSR 설명 -> 상환방식 비교 -> 가상 은행 학습`;
- `FIRE calculator -> safe withdrawal rate -> Coast FIRE -> long-term virtual economy simulator`;
- `dividend calculator -> dividend yield -> DRIP -> virtual stock watchlist`.

No orphan indexable pages. No footer keyword farms.

## 15. Structured data and search appearance

Use only schema that matches visible content.

- `BreadcrumbList` for real navigational hierarchy;
- `Article` / `BlogPosting` for qualifying editorial guides;
- Schema.org `DefinedTerm` / `DefinedTermSet` for glossary semantics;
- other Google-supported structured-data types only when the page meets their current feature requirements.

There is no blanket Google “calculator rich result” contract. Do not invent unsupported markup or promise rich-result appearance.

## 16. Search-to-user conversion

Every qualified landing follows this sequence:

1. satisfy the query immediately;
2. offer a second useful related action;
3. let the visitor adjust/save a scenario or compare another case;
4. only then offer signup where persistence/personalization creates real value;
5. after signup, restore the pre-signup context;
6. bridge to one core Moneyverse action;
7. measure D1/D7/D30 retention by acquisition family.

Recommended CTA types:

- save this calculation;
- compare another scenario;
- create a watchlist;
- run the same concept inside the Moneyverse virtual economy;
- continue the learning path.

“Sign up to see the answer” is prohibited for SEO utility landings.

## 17. Opportunity scoring

Use a normalized score, not raw volume alone:

`Opportunity = DemandEvidence × SERPGap × ProductRelevance × IndependentValue × LocalizationReadiness × RetentionPotential × AdSuitability × TrustConfidence ÷ (FreshnessCost × ComplianceRisk × CannibalizationRisk)`

High-volume finance keywords with weak source authority can score below smaller, safer and better-connected Moneyverse queries.

### Decision rules

- **P0:** strong evidence + strong product connection + useful existing/near-ready capability;
- **P1:** evidence exists but content/data/localization work remains;
- **P2:** exploratory cluster with plausible strategic fit;
- **HOLD:** candidate only; insufficient evidence;
- **MERGE:** same intent as an existing canonical;
- **NOINDEX:** useful for users but not suitable as search landing;
- **RETIRE:** stale, duplicative or persistently low-value.

## 18. Cannibalization and retirement

Group queries by intent, not string equality.

When two URLs compete for the same task:

- pick one canonical winner;
- merge unique useful content;
- redirect or noindex the loser as appropriate;
- update sitemap/internal links;
- preserve analytics history.

Retirement review triggers:

- zero/near-zero qualified demand over a defined observation window;
- repeated duplicate-title/duplicate-content signals;
- stale external rule/data;
- poor engagement plus no downstream activation;
- manual quality concerns;
- search visibility with misleading intent;
- excessive maintenance cost.

## 19. Performance and UX gate

Indexable landing pages target field Core Web Vitals at the 75th percentile:

- LCP <= 2.5s;
- INP <= 200ms;
- CLS <= 0.1.

Calculator input must remain usable on mobile, keyboard accessible and resilient to invalid/empty values. Ads must not obscure the primary result or cause material layout shift.

## 20. Measurement dashboard

Minimum dimensions:

`country × locale × query_cluster × landing_family × landing_url × device × source × index_state × content_version`.

Search KPIs:
- submitted/indexed coverage;
- impressions/clicks/CTR/position;
- top 3 / top 10 / top 20 query counts;
- non-brand share;
- new qualified query count;
- cannibalization count;
- image/video/Discover where applicable;
- Bing/AI grounding referrals when measurable.

Product KPIs:
- landing -> second useful action;
- calculator completion;
- related-content click;
- save/preset action;
- signup;
- first activation;
- D1/D7/D30.

Revenue KPIs:
- qualified pageviews;
- observed Page RPM/ad RPM;
- organic-session pages/session;
- revenue per qualified organic session;
- invalid-traffic warnings;
- incremental contribution after content/localization/support/infra/compliance cost.

## 21. Execution waves

### Wave 0 — truth and inventory
- connect real GSC/Naver evidence or explicitly show NOT_CONNECTED;
- reconcile current pSEO URL inventory to canonical/index status;
- classify every existing finance calculator by source/freshness risk;
- detect mixed-language/canonical/hreflang errors;
- load v527 keyword registry as candidate-only research inventory.

### Wave 1 — Korean P0
Prioritize salary/work, savings/deposit, loan/DSR, dividend, retirement/FIRE, real estate and personal-finance hubs based on measured demand. Improve existing pages before creating siblings.

### Wave 2 — English P0
Compound interest/savings, investment/DCA, FIRE/SWR, dividend/DRIP, loan/debt payoff, mortgage, take-home pay, net worth/budget and business break-even.

### Wave 3 — knowledge graph
Expand glossary from the current 50 terms toward 300 high-connectivity reviewed terms first. Expansion toward 1,000+ is allowed only when definition quality, source governance, internal linking and demand coverage remain healthy. “1,000 terms” is a capacity direction, not a publishing quota.

### Wave 4 — Japan and next locales
Translate only proven page families, perform native intent research, then publish. Do not translate the 10,473 candidate registry mechanically into URLs.

### Wave 5 — scale winners
Expand numeric/entity/preset long tails only after parent-family performance and quality are proven. Weak siblings are consolidated or retired.

## 22. 90-day planning backlog

P0:
- demand evidence connector truthfulness;
- existing URL/indexability inventory;
- Korean salary/loan/dividend/FIRE cluster audit;
- English compound/FIRE/debt cluster audit;
- finance source/effective-date registry;
- cannibalization detector;
- keyword opportunity queue;
- contextual second-action CTA;
- mixed-locale QA;
- sitemap/canonical/hreflang audit.

P1:
- glossary 50 -> first reviewed 300;
- comparison-family templates;
- saved calculator/preset flow;
- search landing -> activation analytics;
- Bing Webmaster/IndexNow operational dashboard;
- image/search-media expansion for high-value guides;
- native Japanese keyword discovery;
- stale-source noindex/disable workflow.

P2:
- advanced business/startup calculators;
- richer virtual-economy simulators;
- country/locale trend pages only where aggregate thresholds and privacy gates are met;
- expansion to DE/FR/ES/pt-BR.

## 23. Research and reference policy

The v527 research cycle ran a new independent Crossref discovery corpus across 40 lanes covering SEO, information retrieval, query intent, keyword research, crawling/indexing, multilingual IR, localization, content quality/spam, ranking/CTR, structured data/knowledge graphs, web performance/accessibility, financial literacy/calculators, behavioral savings, conversion/retention, advertising measurement/fraud/privacy and search analytics.

Result: **200,000 raw records -> 111,313 deduplicated candidates**, zero collection errors. Deduplication used lowercase DOI first and normalized title as fallback. Deterministic uncompressed JSONL stream SHA-256: `1629c7b24a688e84249d77eec2cd1ce2f8b906f91187fcbed413739aef54b523`. Artifacts are versioned under `../research/seo-demand-v2026.10.05.527/`.

Large corpus counts are **candidate-reference breadth**, not a claim that every record was manually reviewed or directly applicable to Moneyverse. Direct requirements use a separately verified primary-source registry.

Primary sources reviewed for this cycle include:

- Google Search Central people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google Search spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Google localized versions/hreflang: https://developers.google.com/search/docs/specialty/international/localized-versions
- Google Search Console Search Analytics API: https://developers.google.com/webmaster-tools/v1/searchanalytics/query
- Google Ads Keyword Planner: https://support.google.com/google-ads/answer/7337243
- Naver Search Advisor SEO/content guidance: https://searchadvisor.naver.com/guide/seo-help
- Naver DataLab search trends: https://datalab.naver.com/
- Bing Webmaster Guidelines: https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a
- IndexNow: https://www.indexnow.org/documentation
- Core Web Vitals: https://web.dev/articles/vitals
- Schema.org DefinedTerm / DefinedTermSet: https://schema.org/DefinedTerm and https://schema.org/DefinedTermSet
- SEC Investor.gov compound-interest calculator: https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator
- CFPB mortgage/loan estimate education: https://www.consumerfinance.gov/owning-a-home/loan-estimate/
- IRS Tax Withholding Estimator: https://www.irs.gov/individuals/tax-withholding-estimator
- National Pension Service / retirement-planning resources: https://www.nps.or.kr/ and https://csa.nps.or.kr/
- Bank of Korea: https://www.bok.or.kr/

## 24. Definition of done for this planning version

v527 is complete as a planning artifact when:

- Korea and overseas keyword portfolios are explicitly separated;
- candidate generation and page-admission are explicitly separated;
- a 10k+ concrete keyword candidate registry exists;
- the fresh independent broad research corpus exceeds 100k deduplicated candidates or is explicitly recorded as below target;
- first-party search/finance references are registered separately from broad discovery;
- top-level planning authority adopts v527;
- EN/KO parity exists;
- start/mid/final main SHA and docs-only evidence are recorded;
- no runtime/Test/Production implementation is falsely claimed.

Implementation requires a separate reviewed plan and exact-SHA release evidence.
