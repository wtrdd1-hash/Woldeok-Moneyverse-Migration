# Moneyverse Comprehensive Product Strategy Re-assessment — v2026.10.14.602

> **Status:** FINDINGS / REVIEW_REQUIRED. This proposal does not supersede the authoritative `v2026.10.05.530` product plan.
> Date: October 14, 2026 KST | Base: `origin/main=e1517e994daf2516d411597b64c2aae30ab4e1b5` | Dedicated branch: `docs/strategy-deep-dive-v2026.10.14.602`.
> Korean detailed counterpart: [전략 보고서](MONEYVERSE_STRATEGY_DEEP_DIVE_v2026.10.14.602.ko.md). Evidence: [SEO audit](MONEYVERSE_SEO_DEEP_EVIDENCE_v2026.10.14.602.md); [source register](MONEYVERSE_REFERENCE_REGISTER_v2026.10.14.602.csv); [proposal](../planning/STRATEGY_DIRECTION_PROPOSAL_v2026.10.14.602.md).

## 1. Strategic choice and thesis
The enduring Moneyverse product is a transparent, ledger-backed **virtual economic life, education and social simulation**: a user works, spends, saves, invests, runs a virtual business, pays taxes, observes fiscal and monetary shocks, and learns what changed and why. Real-world calculators are highly useful **acquisition utilities**, not the complete product.

**Preferred conditional option C:** useful and accurate finance tool → optional, brief economic experiment → consented account → meaningful first WLD ledger receipt → repeatable economic decisions and community projects. Financial tools must remain functional, free to use, and useful **without** signup. Display a visible wall between nonredeemable in-game WLD and real money/investment.

Alternative A, search-calculator-only, offers discoverability but limited differentiation/retention. Alternative B, full virtual economy-first, offers differentiation but requires a difficult onboarding and cold-start community. Option C is **not validated** until GSC→tool completion→activation→D7 funnels are instrumented and tested.

The candidate North Star is **Weekly Economically Engaged Decision Users (WEDU)**: unique, non-bot/non-operator people making at least one meaningful settled economic decision and viewing its outcome within seven days. Track `tool_result_completed` independently to avoid treating search utility usage as in-game engagement. It is a candidate metric, not a measured current result.

## 2. Methods and claim strength
- **E3, observed:** production sitemap fetched HTTP 200 with 1,012 unique `loc` URLs, 9,108 `hreflang` XML entries; representative 36 public URLs returned HTTP 200, title, HTML language and canonical inspected; production and Test health endpoints HTTP 200.
- **E2, source-code:** page robots/sitemap and SEO administrative APIs; a real Search Console client coexists with obsolete sitemap ping paths; hardcoded crawler statistics/rating markup; master economic/monetary specification discrepancies.
- **E1, independent published sources:** official Google Search Central, Search Console, Naver, Bing, GA4, AdSense, CFPB, OECD, SEC, NIST, OWASP, PostgreSQL guidance; NerdWallet, SmartAsset, Calculator.net, Portfolio Charts, EVE Online and Capitalism Lab examples.
- **E0, unverified:** actual index coverage, search impressions/clicks/rank, Search Console property connectivity, Naver reports, GA4 cohorts, AdSense net revenue, authenticated user journeys, production transaction-ledger and feature viability.

In v601 all 1,888 Markdown files in the repository (1,801 under `docs/`) were machine-read and SHA256/topic-indexed, **not** each individually professionally reviewed. v602 inspects critical policy and code in greater depth. GitHub draft PRs v600 and v601 are separate concurrent work; none are silently overwritten.

## 3. SEO evidence and required truth repair
**P0-A: Fabricated performance diagnostics.** `frontend/src/app/api/admin/seo-audit/route.ts` reports constants for index percentages (99.4%, 99.8%, 100%), crawl time/latency, `HEALTHY`, schema `VALID`, and calls `allUrls.length` indexed URLs. None are actual Google, Naver or Bing measured indexing rates. Replace with authenticated provider data and explicit `NO_DATA/STALE/PARTIAL/VERIFIED` states with provider, timestamp, property and sample.

**P0-B: Obsolete indexing-ping semantics.** `frontend/src/app/api/admin/seo/indexing-submit/route.ts` invokes `www.google.com/ping?sitemap=` and describes success as Google Indexing API submission. Google retired sitemap ping; Indexing API applies only to JobPosting/BroadcastEvent VideoObject eligible pages. Importantly a **real GSC Sitemaps client is present**, `backend/src/seo/gsc-client.ts`, and a separate `gsc-sitemap-submit/route.ts`; the fix is to consolidate genuine GSC submission/reporting and retire contradictory fallback messages. `submitted` != `discovered` != `crawled` != `indexed` != `ranked`.

**P0-C: Structured rating credibility.** Numerous financial tools emit static 4.9+ `AggregateRating`. No live review provenance was demonstrated. Suspend unverified markup rather than promise search-result stars; check visible reviews, valid item types, schema parity and human reviews.

**P1-D: URL/localization hygiene.** Site XML has 9,108 alternate links (9 labels × 1,012 URLs), 1,026 double language-prefixed targets (`/en/en/`, `/ja/en/`, etc.), and 5,766 alternate entries whose targets are not separate `loc` records in this one sitemap (not necessarily broken URLs). The 36 representative URLs returned 200 but calculator EN/JA/ZH pages use Korean titles and Korean canonicals, while glossary examples have independent translated metadata and canonical. Fix locale-aware URL registry, reciprocal alternate rules, actual page translation, market-correct formula and jurisdiction. Check how Google treats canonical/duplicates via authenticated tools before changing existing traffic URLs.

**P1-E: lastmod and scaled content.** Sitemap uses a global release date; Google accepts lastmod only if it reflects a significant page update and ignores priority/changefreq. Hundreds of pSEO calculator presets require distinct demand/user value/freshness/intent evidence; previous Crossref 100k+ records are discovery breadth, not measured demand.

## 4. Competitor lessons, not copies
- **Investor.gov:** adjustable contribution/annual rate/range/compounding frequency; adopt transparent scenario inputs and non-promissory outputs.
- **NerdWallet:** fact-check date, formula explanations and disclosure; adopt reviewed methodology without copying business partnerships (current plan is ad-only).
- **SmartAsset:** local tax jurisdiction changes actual calculations; never serve US SEO pages with translated South Korean tax formulas.
- **Calculator.net:** calculation schedule and saved scenario can be more valuable than tens of numeric URL variants.
- **CFPB:** no-personal-data exercise supports optional/privacy-conscious entry.
- **Portfolio Charts:** range of outcomes and historical assumptions; distinguish scenarios from certainty.
- **EVE Online:** publish economic activity, production, money supply and consumer effects with transparent datasets; its mature economy does not validate scale predictions for Moneyverse.
- **Capitalism Lab:** product/industry/job/city dynamics offer educational choice and emergent systems; do not force all advanced systems on onboarding.
- **Amplitude:** first value, activation, D1/D7 cohorts, not raw installs or pageviews; third-party retention percentiles are not Moneyverse performance targets.
- **OECD/INFE:** evaluate real learning/behavioral outcomes, not only gamified engagement.

See source registry for dates, official vs commercial evidence tiers, transfer limitations and testable implications.

## 5. Segments and information architecture
**Korean financial-intent visitor:** salary/social contributions, loan/DSR, compound savings, ISA/retirement, stock cost basis, capital gains/gift taxes. Give full tool result quickly, official source jurisdiction and effective date, optional share/export.

**English financial learner:** compound interest, DCA, FIRE, debt-payoff, wealth goals; keep jurisdiction-independent material first. US/UK salary/mortgage/tax must be based on the target country's documented law and locale, not machine-translated KO.

**New simulated-economy explorer:** optional 30–90 second one-choice scenario, no signup wall, explicit simulated stakes, a personalized comparison and safe clear next step.

**Established economic-world participant:** career mastery, production, company operations, citizen budget votes, public goods, guild/community activity, real economic settlement receipts and policy impact.

**Canonical navigation:** Public tools / Learn → Try an Economic Scenario → My Economy (profile, career, budget, wallet, portfolio, company) → Society (treasury, common goods, clubs) → Advanced Markets. Casino/leveraged products are not public onboarding or search acquisition hubs pending legal/policy acceptance.

## 6. Economic design contract
Each user has time-varying `cash`, `income`, `spend`, `tax`, `debt`, `savings`, `risk`, `career`, `company`, `housing`, `goals`. Events alter choices: price changes, taxes, interest, supply and demand, public investment. The simulation must show **causes and consequences**, not only random rewards.

Canonical supply identity:
`M[t+1] = M[t] + authorized_mint - authorized_retirement`.
Treasury tax and transfers move pre-existing WLD, not mint it. Central Bank decides bounded policy; Mint executes authorized issuance/retirement; Treasury budgets/spends; Economy Core double-entry ledger reconciles every mutation with idempotent receipts. AI may analyze/recommend/simulate, not mint or approve monetary transactions. Guard against duplicate payout, concurrency, negative balances, privilege escalation and fraud.

**New planning issue:** v522 integration writes “4 Core Redistribution Functions” but lists five purposes at 40%+40%+30%+10%+20% = 140% if interpreted as a common allocation pool. These may be distinct denominators, conditional refund or burn policy, but those definitions are missing. Treat as **P0 semantics unresolved**, not necessarily a real DB accounting violation. Resolve alongside 30% protected floor vs 85% treasury-cash normalization; do not change economic policy automatically.

## 7. Prioritize/suspend
- **P0, protect and make discoverable:** accurate calculator, ledger, first job, quest, wallet receipts, core bank flow, auth/recovery, mobile/admin accessibility, correct SEO observability.
- **P1, controlled next step:** short scenario, stock/business/treasury social feedback, AI plain-language explanations, cooperative projects, gated transparency dashboards.
- **HOLD, do not promote before evidence:** high leverage, casino/chance mechanics, copy trading, mass AI blog and automatically expanded templated pages. HOLD concerns promotion/discovery, not a command to erase existing records/features. Casino switch/document conflict must undergo independent safety/legal review.

## 8. Local/international roadmap
- Korean search first: validate sources for salaries/taxes/retirement and official issue dates, independent Naver Search Advisor and GSC reports; test 20–40 valuable pages, not all 1,012 at once.
- English next: high-value locale-independent concepts; genuine English title/body/results/canonical; segment GSC by country and device; no arbitrary translated Korean tax pages.
- Japanese/Chinese only after native content, currency/unit, local regulatory assumptions, accurate local SEO metadata and user tests. A partially correct glossary is not proof all calculator variants are localized.
- GeoIP may suggest a language but must never redirect a crawler or override an explicit locale URL or saved preference.

## 9. Funnel analytics, experiments and guardrails
**Events:** `tool_view`, `tool_result_completed`, `scenario_view`, `scenario_completed`, `second_useful_action`, GA4 `sign_up`, `tutorial_begin`, `tutorial_complete`, `earn_virtual_currency`, `first_ledger_receipt_verified`, `economy_decision_completed`. Do not collect raw salary/tax/debt inputs in analytics. Exclude operator/test/bot traffic; use consent/minimization.

**Seven experiments:**
1. One optional economic scenario below KO compound results; test result completion and second useful action.
2. Native translated English tool/canonical on small cohort; measure query-by-page organic search and indexing vs baseline.
3. Government source, calculation assumptions and last revised date in salary and loan tools; measure completion/trust complaints.
4. First virtual-job paycheck and one immutable receipt; measure D1/D7.
5. Economic events rather than repetitive click quests; measure repeat meaningful choices and frustration.
6. Cooperative treasury/community project, gated against abuse; measure cohort D7 and fairness.
7. Explainable, deterministic “why did it change?” before paid-model AI chat; measure correctness/cost.

No claim of statistical power, lift, or retention until baseline and randomized cohort sizes are known. Holdouts protect total tool conversion. Performance guardrails: mobile p75 LCP≤2.5s, INP≤200ms, CLS≤0.1; no user-privacy leakage, forced signup, clickbait, deceptive ads or trading exploits.

## 10. Advertising-only economics
The authoritative v487 cash-monetization gate is **advertising only**. Old premium memberships, affiliate direct-sale/paid WLD, donations and paid APIs are not automatically revived. Sponsored links must be identified, do not place ads near gambling, private messages, accounts, transactional interfaces or accidental tap targets.

Monthly public ad revenue **illustrative**: eligible public pageviews ÷1,000 × net Page RPM. At hypothetical RPM KRW 2,000, KRW 10 million gross ad revenue would require 5 million eligible pageviews/month, **not** 5 million users, and before infra/moderation/legal/content costs. Real country-specific RPM, AdSense approval and eligible pageviews have not been measured; viability is unknown. Optimize quality, qualified engagement, retention and contribution margin before advertising expansion.

## 11. Staged decision gates and timeline
**Week 1:** stop fabricated SEO metrics, obsolete success signals and unsupported rating markup; audit exactly deployed source, Test/backend/admin/identities errors; connect verified GSC, Naver, GA4 and ad properties; no deployment until exact-sha release gates.

**Weeks 2–3:** per-URL SEO eligibility for top 20–40 tools and explanation pages, localized content, canonical/alternate, schema, main content, formulas and Core Web Vitals; **do not mass-noindex without verified GSC outcomes**.

**Weeks 4–6:** 3 calculator-to-virtual-scenario-to-optional-signup-to-ledger-receipt flows, experiment and observability tests; turn optional signup into real game value, not funnel bait.

**Weeks 7–9:** career/economy shocks, community public project, explainable treasury events; guard fairness and monetary conservation; D1/D7 cohorts.

**Weeks 10–12:** choose incremental locale/feature scale **only** with verified search outcomes, first meaningful user action, D7, policy compliance and positive incremental contribution.

**STOP:** ledger invariant violation, unexpected mint, privacy or economic authorization bypass, misleading search telemetry, illegal gambling/ad placement, user harm or material retention regression. **GO:** operator-confirmed KPI truth, approved policy, full applicable auth/admin/mobile/security and real DB tests, exact-SHA Test/backend verification and zero-downtime rollback-capable promotion.

## 12. Unresolved decisions
Real GSC indexed vs discovered, 90-day organic funnel, Naver crawler/index report, page revenue, D1/D7/D30, AI operational policy, treasury percentage scope, current casino legal state, app parity and Test exact-SHA acceptance remain OPEN. This proposal is **advice, not an approved planning change or runtime fix**. On approval, reconcile v602 into the canonical project plan with EN/KO pair, acceptance criteria, scoped implementation branches and QA evidence.

## 13. External source registry
See [machine-readable source inventory](MONEYVERSE_REFERENCE_REGISTER_v2026.10.14.602.csv): priority Google/Naver/Bing standards; SEC/CFPB/OECD financial education; commercial finance calculator implementations; EVE/Capitalism Lab economic simulation; Amplitude activation research; OWASP/NIST/PostgreSQL governance; AdSense/GA4 integration. Each source's transfer limitation is documented. This register is a **curated verified-source list**, not a fabricated claim of hundreds of thousands of personally evaluated papers.
