# Moneyverse SEO Demand & Keyword Research Review — v2026.10.05.527

Status: RESEARCH / PLANNING INPUT  
Date: 2026-10-05  
Starting and mid-work `origin/main`: `5318213f1eca644c7f36df7d967a53092de0814c`  
Planning authority: `docs/planning/SEO_DEMAND_KEYWORD_EXPANSION_SPEC.md`

## 1. Research question

How can Moneyverse materially increase Korean and international organic-search coverage while avoiding low-value scaled content, stale finance claims, locale duplication and search traffic that never becomes a user?

The answer is not “publish more pages.” The adopted system expands the candidate search space aggressively, then narrows publication through measured demand, independent utility, content/source quality, localization readiness, cannibalization control and downstream product value.

## 2. Current repository baseline

Exact-main source inspection found an already-large SEO implementation surface.

Observed source inventory includes:

- 50 financial glossary terms;
- 50 generated salary amount bands;
- 34 explicit loan pSEO preset records;
- 44 dividend ticker records;
- 11 capital-gains presets;
- 11 real-estate presets;
- 11 kimchi-premium presets;
- multiple public tool/calculator families and localized glossary routes.

Recent main commits also added loan/dividend pSEO, a 50-term glossary hub and localized glossary routes.

This means the next SEO planning layer must govern **which search intents deserve independent URLs** rather than only increasing preset count.

## 3. Fresh independent 100k+ discovery corpus

A new Crossref REST API discovery run was executed for v527. It is independent from the v507 and v510 discovery cycles.

Method:

- 40 query lanes;
- 5,000 raw records targeted per lane;
- publication period: 2010-01-01 through 2026-10-05;
- raw target and result: 200,000 records;
- DOI-lowercase primary deduplication;
- normalized-title fallback when DOI was absent;
- network/query errors: 0;
- deduplicated candidates: **111,313**;
- SHA-256 of the deterministic uncompressed JSONL stream: `1629c7b24a688e84249d77eec2cd1ce2f8b906f91187fcbed413739aef54b523`.

Research artifacts committed with this version:

- `docs/research/seo-demand-v2026.10.05.527/crossref-manifest.json`;
- `docs/research/seo-demand-v2026.10.05.527/crossref-sample.csv`;
- `docs/research/seo-demand-v2026.10.05.527/crossref-unique-111313.jsonl.gz`.

The 40 lanes cover:

1. search engine optimization;
2. web search information retrieval;
3. search query intent;
4. keyword research/search marketing;
5. programmatic SEO/web content;
6. web crawling/indexing;
7. canonical URLs/duplicate content;
8. XML sitemaps/search engines;
9. multilingual information retrieval;
10. cross-lingual information retrieval;
11. website localization/search;
12. machine-translation quality/web;
13. web content quality/ranking;
14. web spam detection/search;
15. search ranking/relevance;
16. search click-through rate;
17. search snippets/metadata;
18. structured data/semantic web search;
19. knowledge graphs/search;
20. web performance/user experience;
21. Core Web Vitals/performance;
22. mobile web search/usability;
23. web accessibility/content;
24. personal-finance education;
25. financial-literacy digital tools;
26. consumer financial calculators;
27. retirement-planning calculators;
28. compound interest/financial education;
29. mortgage/loan calculators;
30. investment education/simulators;
31. behavioral economics/saving;
32. conversion-rate optimization/web;
33. digital-product retention;
34. online-advertising measurement;
35. invalid-traffic/ad fraud;
36. privacy/consent/digital advertising;
37. financial decision-support tools;
38. household budgeting/saving;
39. international digital marketing/localization;
40. search analytics/web measurement.

### Interpretation boundary

The **111,313 count is discovery breadth**. It does not mean 111,313 papers were manually read, that every record is directly SEO-specific, or that each record supports a Moneyverse requirement. Crossref search is intentionally broad.

Direct implementation rules below come from separately checked first-party sources and exact repository evidence.

## 4. Concrete keyword-demand registry

A separate deterministic candidate registry was generated from curated Korean and English seed clusters and intent modifiers.

Result:

- total candidate queries: **10,473**;
- Korean: **6,207**;
- English: **4,266**;
- Korean clusters: 13;
- English clusters: 12;
- registry SHA-256: `4e85672667970b41a33222b7005215ef630900daa935674cb8b7f21fcf901b79`.

Artifacts:

- `docs/findings/SEO_DEMAND_KEYWORD_REGISTRY_v2026.10.05.527.csv`;
- `docs/findings/SEO_DEMAND_KEYWORD_REGISTRY_v2026.10.05.527.manifest.json`.

Every row is intentionally marked `UNVALIDATED_CANDIDATE` and `HOLD_UNTIL_EVIDENCE`.

The registry is not claimed to be measured search volume. It is a controlled discovery universe for later GSC, Keyword Planner, Naver and market-native validation.

## 5. Directly adopted search evidence

### Google people-first content

Google states that its ranking systems are intended to prioritize helpful, reliable information created to benefit people rather than content made to manipulate rankings.

Adoption:
- useful result first;
- original calculation, explanation, data or simulation;
- no page-count KPI;
- page quality is reviewed at family and sample level.

Source: https://developers.google.com/search/docs/fundamentals/creating-helpful-content

### Google spam policies

Current policy explicitly covers doorway abuse, keyword stuffing, machine-generated traffic and scaled content abuse.

Adoption:
- candidate keyword combinations never automatically become pages;
- near-identical amount/city/locale pages are merged or kept as in-page presets;
- automated Google SERP scraping/rank queries are not used;
- search manipulation is a release blocker.

Source: https://developers.google.com/search/docs/essentials/spam-policies

### Google international/localized pages

Google recommends explicit alternate-language relationships for localized equivalents and notes that page language is algorithmically determined from content rather than relying on `hreflang` or `lang` alone.

Adoption:
- explicit locale URL remains stable;
- reciprocal hreflang only for real equivalents;
- template-only translation does not qualify;
- mixed or stale translations stay out of index/sitemap/hreflang.

Source: https://developers.google.com/search/docs/specialty/international/localized-versions

### Google Search Console Search Analytics API

The API supports segmentation/filtering such as query, page, country and device but is internally limited and does not guarantee every row.

Adoption:
- use it for actual Moneyverse Google search performance;
- do not treat missing rows as proof of zero market demand;
- do not substitute it for market-wide keyword volume.

Source: https://developers.google.com/webmaster-tools/v1/searchanalytics/query

### Google Ads Keyword Planner

Keyword Planner can discover keyword ideas from seed words and websites and expose estimated monthly search volume and cost/forecast information.

Adoption:
- use it as a named market-demand estimate;
- store market, language, period and observed-at date;
- estimated demand never overwrites live site-performance data.

Source: https://support.google.com/google-ads/answer/7337243

### Naver Search Advisor

Naver recommends accurate, unique titles/descriptions that represent page content and warns against unrelated popular keywords, repetition and spam-like keyword lists.

Adoption:
- Korea has its own metadata/query validation;
- no generic keyword block in title/description/footer;
- unique title/H1/body and useful content are required.

Sources:
- https://searchadvisor.naver.com/guide/seo-help
- https://searchadvisor.naver.com/guide/content-basic
- https://searchadvisor.naver.com/guide/markup-content

### Naver DataLab

Search Trend supports topic groups with subordinate terms and filtering by device/sex/age over historical periods.

Adoption:
- use as relative trend evidence;
- do not label it exact monthly search volume;
- use demographic/device signals only in privacy-safe aggregate planning.

Source: https://datalab.naver.com/

### Bing Webmaster Guidelines

Current Bing guidance connects ordinary SEO fundamentals—discovery, crawlability, indexing accuracy, URL consolidation, content clarity and trust—to eligibility across Bing search and Copilot/grounding citations.

Adoption:
- global SEO includes Bing, not Google only;
- sitemap/internal links/IndexNow are kept accurate;
- semantic clarity and freshness are treated as search + AI-discovery assets.

Source: https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a

### Core Web Vitals

Current thresholds at the 75th percentile are LCP <= 2.5s, INP <= 200ms and CLS <= 0.1.

Adoption:
- pSEO scale cannot degrade mobile UX/performance;
- ads may not displace calculator results or cause material layout shift.

Source: https://web.dev/articles/vitals

### Schema.org glossary semantics

`DefinedTerm` and `DefinedTermSet` model formal terms and collections.

Adoption:
- they are useful semantic vocabulary for glossary relationships;
- they do not imply a Google rich-result feature;
- Google-supported search features are checked separately.

Sources:
- https://schema.org/DefinedTerm
- https://schema.org/DefinedTermSet

## 6. Directly adopted finance-tool evidence

### SEC Investor.gov

Investor.gov provides a compound-interest calculator using initial investment, recurring contribution, time, estimated interest and compounding frequency.

Adoption:
- calculator pages should expose explicit inputs and assumptions;
- user-controlled scenarios are preferable to static “guaranteed return” claims;
- finance education can bridge explanation + interactive tool.

Source: https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator

### U.S. CFPB

CFPB mortgage resources emphasize loan amount, term, interest, principal/interest and broader affordability context; it also warns that qualification amount and affordable repayment are different questions.

Adoption:
- mortgage/loan tools distinguish mathematical payment from broader affordability;
- country-specific lending claims require local authority;
- comparisons should surface assumptions and costs rather than imply personalized advice.

Sources:
- https://www.consumerfinance.gov/owning-a-home/loan-estimate/
- https://www.consumerfinance.gov/ask-cfpb/how-can-i-figure-out-if-i-can-afford-to-buy-a-home-and-take-out-a-mortgage-en-118/

### U.S. IRS

IRS maintains a current Tax Withholding Estimator and updates it when law changes.

Adoption:
- tax calculators need explicit jurisdiction/effective-date/version;
- stale rules need warning/noindex/disable behavior;
- country-specific tax logic cannot be reused as “global.”

Sources:
- https://www.irs.gov/individuals/tax-withholding-estimator
- https://www.irs.gov/payments/tax-withholding

### Korea public-authority families

Direct source registries should prioritize:
- National Pension Service for national-pension assumptions and retirement-preparation resources;
- Bank of Korea for monetary/statistical series;
- National Tax Service/finance authority for Korean tax rules;
- NHIS for health/long-term-care insurance;
- FSC/FSS for credit/lending policy.

The source registry must store an exact URL/effective date for each implemented formula rather than treating the organization name alone as evidence.

Examples:
- https://www.nps.or.kr/
- https://csa.nps.or.kr/
- https://www.bok.or.kr/

## 7. Domestic planning conclusion

Korean P0 should first deepen intent coverage around existing high-utility families:

1. salary/take-home/work compensation;
2. savings/deposits/after-tax interest;
3. loan payment/DSR/repayment comparison;
4. dividends/after-tax income/reinvestment;
5. retirement/FIRE;
6. real-estate transaction/rent-vs-deposit decisions;
7. net-worth/budget/savings-rate tools.

The correct growth unit is a **task cluster**, not a keyword string.

For example, “대출” should become one coherent information architecture containing repayment calculator, DSR explanation, repayment-method comparison and relevant glossary—not dozens of near-identical doorway pages.

## 8. International planning conclusion

English P0:

1. compound interest / savings;
2. investment growth / DCA;
3. FIRE / Coast FIRE / SWR;
4. dividend / DRIP;
5. loan / debt payoff;
6. mortgage / affordability;
7. paycheck / take-home pay;
8. net worth / budget;
9. business break-even / margin / runway.

A successful English family becomes the evidence base for Japanese native-intent research. DE/FR/ES/pt-BR follow one locale at a time.

## 9. Programmatic SEO conclusion

The correct system is:

`large candidate universe -> evidence -> intent clustering -> canonical decision -> value/source gate -> limited publish -> measure -> expand/merge/retire`.

Not:

`large keyword list -> one generated page per row -> sitemap`.

Numeric long tails such as amount × rate × duration are especially likely to be presets rather than unique URLs unless demand and material result/context differences justify indexation.

## 10. Search-to-user conclusion

Traffic without user value is not success.

Each search family must measure:

`impression -> click -> useful result -> second useful action -> signup (optional) -> activation -> D1/D7/D30 -> qualified pageviews/ad economics`.

This is compatible with the unmerged v525 search-to-user growth loop without editing or depending on that branch.

## 11. Risks found in current direction

- existing finance/pSEO surfaces are expanding faster than a unified source/effective-date registry;
- numeric preset growth can create duplication/cannibalization if index admission is config-driven;
- finance copy can sound more authoritative than its source freshness supports;
- localized route existence does not prove target-language body parity;
- a large glossary can become thin if definitions are disconnected from tools/guides/entities;
- search success can be overstated if synthetic/fallback analytics are treated as live;
- page-count growth can harm crawl quality, maintenance cost and search policy compliance.

v527 converts these into explicit admission, evidence and retirement gates.

## 12. Research conclusion

The user’s requested “100k references” goal was met as a fresh broad-discovery corpus with **111,313 deduplicated candidate records from 200,000 raw records**. The plan does not misuse that number as certainty.

The stronger planning asset is the combination of:

- the 111,313-record broad research corpus;
- current first-party Google/Naver/Bing/search-platform rules;
- first-party financial-tool reference patterns;
- exact-main Moneyverse source inventory;
- the 10,473-query candidate registry;
- strict publication, source-freshness, localization, cannibalization and conversion gates.

That combination is adopted into the v527 detailed specification and top-level planning authority.
