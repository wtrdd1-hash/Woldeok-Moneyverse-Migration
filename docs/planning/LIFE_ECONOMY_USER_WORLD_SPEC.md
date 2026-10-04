# Moneyverse Life Economy & User World Specification

> Version: v2026.10.04.526
> Status: AUTHORITATIVE PLANNING CANDIDATE / documentation-only
> Date: 2026-10-04
> Canonical language: English
> Korean counterpart: [LIFE_ECONOMY_USER_WORLD_SPEC.ko.md](LIFE_ECONOMY_USER_WORLD_SPEC.ko.md)
> Parent authority: [PROJECT_PLAN.md](PROJECT_PLAN.md)
> Integrates with: Central Bank/Mint/Treasury/Economy Core, AI Economy Controller, Economy Simulation Tuning, Season System, Global Growth Execution, Treasury Recirculation
> Runtime claim: none. This cycle changes planning/documentation only.

## 0. Product thesis

Moneyverse becomes a persistent fictional economic world in which a user lives an economic life rather than merely visiting disconnected mini-games. The primary loop is:

`work -> receive income -> pay living costs/taxes -> save/borrow/invest -> build skills -> start/join businesses -> respond to economic events -> build resilience and net worth -> unlock new choices`.

The product must optimize for meaningful economic agency, learning-through-play, retention and social interaction without representing WLD as real money, a deposit, a security, a guaranteed return, or a cash-redeemable asset.

## 1. Non-negotiable economic and legal boundaries

1. WLD and all derived scores are service-internal fictional/game values only.
2. No cash-out, external exchange, guaranteed real-world value, paid wagering, real-money yield, or user-to-user conversion into fiat.
3. Taxes, transfers, bank deposits, funded loans, business payments, city budgets and ordinary trades move existing WLD and do not change total WLD.
4. Only the canonical Central Bank authorization + Mint execution path may change total WLD supply.
5. User-facing "bank", "loan", "credit score", "bond", "portfolio", "insurance", "salary" and "tax" labels must visibly state that they are Moneyverse simulation mechanics, not real financial services.
6. Korean release keeps game-result exchange/cash-conversion blocked and requires current classification/compliance review before materially changing chance/reward/value-transfer mechanics.
7. International release uses jurisdiction-specific labels/disclosures and never infers legal permission merely from translation availability.
8. Ads remain excluded from sensitive wallet/loan/transaction/security actions under existing advertising authority.

## 2. Core life-state model

Each user has a versioned `LifeEconomyProfile` with:
- life stage, virtual residence/city and household archetype;
- profession/job, employer, skill levels and work history;
- salary and variable compensation;
- recurring living costs and discretionary budget;
- taxes and fiscal benefits;
- deposits, savings goals and funded loan obligations;
- internal credit score and credit tier;
- insurance-style risk-protection contracts;
- investment/portfolio allocations using existing fictional assets only;
- business ownership, employment equity/role where applicable;
- liquid net worth, total net worth and cash-flow history;
- financial-resilience score and choice/freedom indicators;
- achievements, career-book entries, season milestones and public-profile privacy settings.

Primary progress metrics are not a single wealth leaderboard. They are a balanced vector:
`net_worth`, `free_cash_flow`, `financial_resilience`, `credit_health`, `skill_capital`, `business_health`, `economic_reputation`, and `career_progress`.

## 3. Feature 1 — Personal Economic Life Simulator (P0)

### User experience
- New users choose a starter life archetype with equal expected value but different trade-offs: stable employee, growth-seeking apprentice, freelancer/creator, small trader, or public-service path.
- Day 1 must teach one complete cycle in under 5 minutes: work -> salary -> mandatory costs/tax -> one saving/investment choice -> end-of-day statement.
- A "life dashboard" shows cash on hand, next payday, bills due, tax forecast, debt payments, savings goals, resilience buffer and current opportunities.
- Monthly/seasonal statements explain why net worth changed instead of only showing a number.
- Unexpected but bounded events create trade-offs: repair bill, temporary reduced hours, promotion opportunity, training cost, moving offer, business demand spike.

### Financial-resilience model
Use a Moneyverse-native score inspired by financial-well-being/capability literature, not a copy of any real scoring product:
- liquidity buffer days;
- recurring-cost coverage;
- debt-service burden;
- income diversification;
- savings consistency;
- shock absorption;
- goal progress;
- avoidable penalty/late-payment rate.

The score must explain components and never imply real-world financial fitness.

### Economy contract
Every salary, expense, tax and transfer maps to a ledger transaction family. Simulation UI may project outcomes, but only committed actions write the ledger.

## 4. Feature 2 — AI Personal Economy Assistant (P0/P1)

### Role
The assistant is a read/analyze/recommend layer. It may:
- summarize spending and cash-flow trends;
- identify upcoming obligations;
- compare user-selected scenarios;
- surface concentration, liquidity and debt-service risks;
- explain Moneyverse policy/news impact;
- suggest goals and optional actions.

It may not:
- transfer WLD;
- originate a loan;
- buy/sell assets;
- change business payroll;
- vote;
- alter tax settings;
- approve monetary/fiscal actions;
- silently personalize prices.

### Action pattern
`observe -> explain evidence -> recommend -> show counterfactual -> user confirms -> deterministic service validates -> Economy Core executes`.

Every recommendation must include evidence inputs, uncertainty/assumptions, expected upside, downside/constraints and "do nothing" alternative. High-impact recommendations require explicit confirmation and recent-state revalidation.

### Security
Prompt content cannot grant new permissions. Tool/function access is least-privilege, allowlisted and schema-constrained. External/UGC/news text is untrusted data and cannot issue actions.

## 5. Feature 3 — Jobs & Companies (P0)

### Jobs
Jobs have:
- occupation family and skill requirements;
- base salary band;
- hours/effort budget;
- job quality dimensions;
- promotion ladder;
- performance/learning metrics;
- layoff/business-risk exposure;
- locality/city modifiers;
- season/economic-cycle sensitivity.

### Skills and mobility
Skill trees use transferable competencies plus profession-specific mastery. Users can invest WLD/time in training, then qualify for adjacent jobs. Job switching should generally trade off salary, stability, learning and location rather than be a strictly dominant upgrade.

### NPC companies
NPC firms provide baseline labor demand and stabilize early-game employment.

### User companies
Eligible users may form firms, set roles, hire users/NPC capacity, pay wages from funded balances, buy inputs, set prices, hold inventory, pay taxes/fees, retain earnings and fail if insolvent.

No company may create WLD through bookkeeping. Payroll and dividends require funded company balances.

## 6. Feature 4 — Internal Credit Score & Funded Loans (P0/P1)

### Credit score
Create a Moneyverse-only 300-900 style presentation or, preferably, a neutral 0-1000 score to avoid confusion with real bureau scores.

Inputs:
- repayment punctuality;
- debt-service ratio;
- utilization of approved internal credit;
- account age/history depth;
- income stability;
- liquidity buffer;
- resolved delinquency recovery;
- verified anti-abuse signals.

Excluded inputs:
- real-world identity traits;
- protected/sensitive characteristics;
- ad behavior;
- social popularity;
- device price/location proxies unrelated to simulation risk.

### Explainability
The UI shows top positive/negative factors and exact recovery steps. A late payment decays in effect over time; recovery is possible and visible.

### Loan model
Initial lending remains fully funded from existing-WLD lending pools. Core parameters:
`APR_sim = policy_base + funding_spread + risk_spread + product_spread - relationship_discount`.
This is a game formula, not a real APR offer.

Loan approval uses affordability and risk rules. A loan may be denied without using an LLM as final decision-maker.

## 7. Feature 5 — Competitive Virtual Banks (P1)

Create several fictional banks with distinct strategies:
- low-fee transactional bank;
- high-savings-rate digital bank;
- SME/business bank;
- conservative secured-lending bank;
- regional/community bank.

Banks compete on deposit rates, funded-loan rates, service fees, eligibility, loyalty and service quality. Rate movement responds to policy rate, funding needs, risk and competition within bounded deterministic formulas.

A user's saved WLD remains existing WLD held by ledger accounts; deposits do not authorize fractional-reserve money creation under the current v523 boundary.

Future user-founded banks are a separate P2 research lane and must not launch until governance, insolvency and systemic-risk simulation are mature.

## 8. Feature 6 — Moneyverse Economic News (P0/P1)

Generate in-world news from verified internal events:
- Central Bank policy decision;
- Treasury budget change;
- city project vote/result;
- company earnings/layoff/hiring;
- inflation/cost-of-living movement;
- credit conditions;
- seasonal shock/recovery.

Architecture:
`event store -> fact builder -> policy-safe template/LLM narration -> fact checker -> publication`.

News generation cannot invent price moves, policy decisions or company facts. Every article stores source event IDs and confidence. Material economic notices use deterministic data tables alongside prose.

Public SEO exposure is allowed only for useful, non-personal, fact-backed evergreen/explainer pages; transient personalized feeds remain noindex.

## 9. Feature 7 — Business Cycle & Crisis Live Events (P1)

The world maintains a bounded macro state:
`expansion | mature_expansion | slowdown | recession | recovery | inflation_shock | deflation_risk | supply_shock`.

State transition probabilities depend on measured Moneyverse variables and configured scenario rules, not pure dice rolls. Operators may schedule narrative events but must not secretly force user losses.

User effects may include:
- hiring demand;
- wage growth;
- sales demand;
- deposit/loan rate changes;
- living-cost index;
- bankruptcy risk;
- Treasury support programs;
- skill-demand shifts.

Crisis events must preserve new-user survivability and avoid irreversible wipeouts. A recovery path is mandatory.

## 10. Feature 8 — Regional & City Economies (P1/P2)

Each fictional city has:
- wage index;
- rent/housing-cost index;
- tax/fee modifiers within global bounds;
- dominant industries;
- job vacancy mix;
- business input/logistics costs;
- infrastructure/public-service scores;
- local project budget;
- population/activity pressure.

Moving requires a visible cost-benefit comparison and cooldown rather than arbitrary lock-in. Cities must offer multiple viable strategies; one city cannot permanently dominate every metric.

Internationalization uses fictional regions inspired by economic patterns, not direct claims that a city equals Korea/US/Japan. Locale and legal jurisdiction remain separate from virtual residence.

## 11. Feature 9 — User Businesses & Shops (P0/P1)

### Business loop
`capital -> inputs -> production/service capacity -> listing/sales -> wages/fees/tax -> retained earnings -> reinvestment/dividend`.

Business types launch in curated templates before freeform creation:
- retail/resale;
- crafting/manufacturing;
- food/service abstraction;
- logistics;
- media/creative;
- professional service;
- local infrastructure contractor.

### Unit economics
Each firm exposes:
- revenue;
- COGS/input cost;
- gross margin;
- payroll;
- rent/logistics;
- taxes/fees;
- operating profit;
- cash runway;
- inventory turnover;
- customer concentration.

Anti-abuse detects wash trading, circular payments, self-dealing, collusive price manipulation and multi-account subsidy farming.

## 12. Feature 10 — Public Project Voting / Participatory Budgeting (P1)

Treasury/city authorities earmark a bounded existing-WLD project envelope. Users may propose or vote among eligible projects such as:
- transport/logistics efficiency;
- training/education subsidy;
- unemployment support;
- city events;
- small-business grants;
- public amenities.

Rules:
- only pre-funded budgets may be allocated;
- voting cannot authorize Mint;
- eligibility and conflicts are checked before ballot;
- proposal costs and expected effects are published;
- anti-Sybil controls apply;
- results and execution progress are auditable;
- operators retain a safety veto only for invariant/legal/security violations, with reason disclosed.

Use a hybrid of preference voting and outcome review rather than popularity alone.

## 13. Feature 11 — Economic Achievements & Career Book (P0)

The Career Book is a chronological, user-owned history:
- first salary;
- first tax contribution;
- first emergency fund target;
- debt payoff;
- first promotion;
- first profitable month;
- first company;
- first employee hired;
- crisis survival;
- recovery after delinquency;
- city move;
- public project participation;
- season milestones.

Achievements should favor behaviors and milestones, not only absolute wealth. Avoid "rich get richer" reward multipliers.

## 14. Feature 12 — Economic Seasons & Long Goals (P1)

Integrate with the existing Season System. A 6-8 week season contains:
- world macro theme;
- personal goal track;
- business goal track;
- social/public goal track;
- optional competitive league;
- cosmetic/profile/history rewards;
- catch-up mechanics.

Season reset must never erase core assets/debt/history. Only seasonal ladders, temporary modifiers and theme-specific progress reset.

## 15. Feature 13 — Friend Co-Business (P1/P2)

2-5 users may create a partnership/corporation with:
- contribution ledger;
- ownership shares;
- roles and permissions;
- salary/dividend rules;
- spending approval thresholds;
- change-of-control process;
- inactive-member handling;
- voluntary exit/buyout using existing WLD;
- dispute/audit history.

High-value actions use multi-party approval. One member cannot drain shared funds merely by being CEO.

## 16. Feature 14 — Economic Rivals & Fair Leagues (P1)

Match users by comparable progress/risk bands. League metrics rotate:
- net-worth growth rate;
- savings consistency;
- business margin improvement;
- resilience improvement;
- skill progression;
- debt reduction;
- public contribution.

Absolute wealth is not the default ranking metric. Smurfing, collusion, wash trades and intentional loss-transfer farming invalidate results.

## 17. Feature 15 — 30-second to 2-minute Micro Sessions (P0)

Daily quick-check surface:
1. economic briefing;
2. due obligations;
3. collect/acknowledge earned results (without exploitative idle compounding);
4. one recommended action;
5. one optional daily choice;
6. business alert;
7. season/public vote status.

The product must support useful short sessions without punishing users who do not check repeatedly. Avoid dark-pattern countdowns and false urgency.

## 18. Feature 16 — Daily Economic Choice (P0)

One bounded decision per day from a rule-authored library:
- take training vs keep cash;
- accept higher salary with higher layoff risk;
- fixed vs variable virtual loan choice;
- rent vs move;
- inventory discount vs hold stock;
- treasury/community choice.

Each decision declares possible outcomes and uncertainty. The next-day result is driven by stored rules and world state, not retroactively manipulated against the user.

Daily Choice is an onboarding/education/retention feature, not a wagering mechanic.

## 19. Feature 17 — Economic Time Machine / Sandbox (P0/P1)

A read-only counterfactual engine:
- save more for 30/90/365 simulated days;
- accelerate debt repayment;
- change investment allocation;
- move city;
- take a different job;
- hire an employee;
- change business price;
- stress-test income loss/inflation/rate rise.

The sandbox never writes live accounts. It returns:
`baseline`, `scenario`, `delta`, `assumptions`, `uncertainty`, `risk flags`.

### Public utility/SEO lane
Potential indexable tools:
- compound growth calculator;
- loan repayment simulator;
- inflation/purchasing-power simulator;
- salary/budget simulator;
- fictional business margin calculator.

Public tools must provide independent user value, transparent formulas, locale-correct units, original explanatory content and quality gating. Do not mass-generate thin pages.

## 20. Feature 18 — Public Economic Profile & Share Cards (P1)

Opt-in only. Never public by default.

Shareable fields may include:
- career archetype;
- city;
- achievement count;
- company count;
- league tier;
- percentile bands;
- selected badges;
- resilience/credit tier as coarse labels.

Do not expose exact balances, exact debt, transaction history, private employer/member data, or sensitive behavioral signals.

Profiles use revocable public IDs, crawler/index controls and per-field visibility. Share cards are generated from approved fields only.

## 21. Cross-feature day/week/month loop

### Daily
- work/business results;
- obligations and cash-flow;
- briefing;
- daily choice;
- small progression action.

### Weekly
- payroll/business close;
- credit update;
- league snapshot;
- public project/season progress;
- AI assistant review.

### Monthly/seasonal
- tax/fiscal settlement where designed;
- net-worth/resilience statement;
- company financials;
- city/macroeconomic update;
- season milestone;
- policy feedback.

The cadence must be simulated time and configurable; it must not require 30 real days to test.

## 22. Data model

Suggested tables/read models:
- `life_economy_profiles`;
- `life_economy_snapshots`;
- `employment_contracts`, `job_postings`, `skill_profiles`;
- `companies`, `company_members`, `company_financial_snapshots`;
- `bank_products`, `bank_rate_snapshots`;
- `credit_profiles`, `credit_factor_events`;
- `funded_loan_accounts`, `loan_payment_schedules`;
- `living_cost_obligations`;
- `city_economies`, `city_metric_snapshots`;
- `economic_world_states`, `economic_event_instances`;
- `economic_news_items`;
- `public_project_proposals`, `public_project_votes`, `public_project_execution`;
- `career_book_entries`, `economic_achievements`;
- `daily_economic_choices`, `daily_choice_results`;
- `counterfactual_scenarios`;
- `public_economic_profiles`;
- `ai_personal_advice_records`.

Economic writes reference canonical ledger transaction IDs; derived tables never become the monetary source of truth.

## 23. API boundary

Example user APIs:
- `GET /life-economy/summary`;
- `GET /life-economy/cashflow`;
- `GET /jobs`, `POST /jobs/:id/apply`;
- `GET /companies/:id`, controlled company mutation endpoints;
- `GET /banks/products`;
- `GET /credit/profile`;
- `POST /loans/:productId/simulate`, `POST /loans/:productId/apply`;
- `GET /economy/news`;
- `GET /cities`, `POST /cities/:id/move-preview`;
- `GET /public-projects`, `POST /public-projects/:id/vote`;
- `GET /career-book`;
- `GET /daily-choice`, `POST /daily-choice/:id/answer`;
- `POST /time-machine/simulate`;
- `GET/PUT /public-economic-profile`;
- `POST /ai/personal-economy/advice`.

Every state-changing API uses auth, authorization, idempotency, invariant validation, audit reason/context and canonical settlement.

## 24. AI authority matrix

### Allowed automatically
- summarize;
- classify internal facts;
- generate explanations from fixed facts;
- produce candidate advice;
- produce draft news wording;
- select from approved daily-choice templates.

### User-confirmation required
- any recommendation that results in transfer, purchase, investment, business spending, borrowing, move, employment change or public vote.

### Never delegated to AI
- Mint/retire;
- monetary order approval;
- treasury budget authorization;
- final credit eligibility;
- ledger mutation bypass;
- moderation/security access override;
- legal/jurisdiction classification.

## 25. Anti-abuse and fairness

Required defenses:
- business wash/circular trading graph detection;
- loan cycling and self-funding detection;
- multi-account salary/fiscal subsidy farming;
- vote Sybil resistance;
- collusive league boosting;
- fake company payroll;
- duplicate/replay settlement protection;
- market manipulation separation from genuine business activity.

Anti-abuse actions must be appealable where user-impacting and must not silently alter legitimate users' economy parameters.

## 26. Analytics and KPI framework

North-star family:
- D1/D7/D30 retention after first completed life cycle;
- weekly meaningful economic decisions/user;
- percentage of users with positive free cash flow;
- financial-resilience improvement by cohort;
- job/skill progression;
- business survival at 7/30/90 simulated days;
- healthy funded-loan repayment rate;
- feature breadth without forced use;
- social co-business retention lift;
- public-project participation;
- Time Machine to signup conversion for public tools;
- public share -> qualified signup conversion.

Guardrails:
- new-user bankruptcy/softlock;
- inequality/concentration acceleration;
- support complaints;
- abuse false positives;
- AI advice override/disagreement rate;
- loan regret/rapid delinquency;
- session compulsion indicators;
- thin-page SEO/index-quality failures.

## 27. Release phases

### Phase A — P0 foundation
Life profile, salary/living costs, simple employment, Career Book, Daily Choice, micro-session dashboard, Time Machine v1, internal statements.

### Phase B — P0/P1 finance
Credit profile, fully funded loans, 2-3 fictional banks, personal AI assistant in read/recommend mode.

### Phase C — P1 production economy
User companies/shops, payroll, business statements, economic news.

### Phase D — P1 world
Cities, business cycles/live events, participatory budgeting, fair rival leagues, season integration.

### Phase E — P1/P2 social/global
Co-business governance, public profiles/share cards, public SEO calculators, expanded localized cities/banks.

Every phase follows branch -> isolated Test -> backend/DB/API/UI verification -> full-route QA -> zero-downtime Production promotion. Docs-only v526 authorizes none of those runtime steps.

## 28. Domestic vs overseas planning

### Korea
- Korean is product/public fallback.
- Keep WLD non-cashable and prevent exchange/re-purchase businesses.
- Avoid framing simulated banks/loans/credit as licensed financial products.
- Any chance-based reward tied to transferable/economic value receives separate GRAC/legal review.
- Public profiles default private and use conservative disclosure.
- Public tools use Korean financial-literacy language but clearly state Moneyverse simulation status.

### Overseas
- Launch locale-by-locale after content/UX/legal readiness, not by GeoIP force redirect.
- Use separate locale URLs and reciprocal hreflang.
- Localize terminology, taxes/labor/housing analogies as fictional mechanics rather than claiming legal/financial accuracy.
- Maintain jurisdiction feature flags for public profiles, social features, promotions and age gates.
- Do not replicate real credit-bureau scores or call internal products insured deposits/investments unless legally true.

## 29. UX/accessibility requirements

- Explain every score/rate with "why" and "what changes it".
- Never use red/green alone; provide labels and numbers.
- Provide compact mobile cards for cash flow, debts and business health.
- Support keyboard/screen-reader navigation, visible focus and text alternatives for charts.
- Use progressive disclosure: beginner "today" view, advanced detailed ledger/statement view.
- Avoid shame language for debt, low credit or business failure.
- Recovery paths must be discoverable.

## 30. Reference-backed design basis

Primary/official references used in this planning cycle include:

Financial capability and well-being:
1. CFPB, Financial Well-Being Scale — https://www.consumerfinance.gov/data-research/research-reports/financial-well-being-scale/
2. CFPB, Financial well-being resources — https://www.consumerfinance.gov/consumer-tools/educator-tools/financial-well-being-resources/
3. World Bank, Financial Capability — https://responsiblefinance.worldbank.org/en/responsible-finance/financial-capability

Credit/banking/monetary transmission:
4. BIS, New forms of money and transmission of monetary policy (2026) — https://www.bis.org/speeches/20260622-new-forms-money-and-transmission-monetary-policy
5. BIS, Digitalisation of banking and deposit pricing (2026) — https://www.bis.org/publications/working-paper-1357-digitalisation-banking-and-social-media-implications-deposit-pricing
6. BIS, How central banks influence interest rates — https://www.bis.org/speeches/20151002-how-central-banks-influence-interest-rates
7. IMF, Financial Structure, Bank Lending Rates, and Monetary Transmission — https://www.imf.org/en/publications/wp/issues/2016/12/30/financial-structure-bank-lending-rates-and-the-transmission-mechanism-of-monetary-policy-1081
8. myFICO, Payment History — https://www.myfico.com/credit-education/credit-scores/payment-history
9. myFICO, New Credit — https://www.myfico.com/credit-education/credit-scores/new-credit

Jobs, skills and entrepreneurship:
10. ILO, Employment and Social Trends 2026 — https://www.ilo.org/publications/flagship-reports/employment-and-social-trends-2026
11. ILO, Job quality dimensions — https://www.ilo.org/resource/news/job-quality-concern-all-workers-0
12. OECD, Occupational mobility, skills and training needs — https://www.oecd.org/en/publications/occupational-mobility-skills-and-training-needs_30a12738-en.html
13. OECD, SMEs and entrepreneurship — https://www.oecd.org/en/topics/smes-and-entrepreneurship.html
14. OECD, Business Dynamics and Productivity — https://www.oecd.org/en/publications/business-dynamics-and-productivity_9789264269231-en.html
15. World Bank, Jobs — https://www.worldbank.org/ext/en/jobs
16. World Bank, Entrepreneurship trends 2026 — https://blogs.worldbank.org/en/psd/a-global-snapshot-of-entrepreneurship-trends

Cities/public participation:
17. OECD, Regions and Cities at a Glance 2022 — https://www.oecd.org/en/publications/oecd-regions-and-cities-at-a-glance-2022_14108660-en.html
18. OECD, What Works for Inclusive Growth in Cities (2026) — https://www.oecd.org/en/publications/2026/06/what-works-for-inclusive-growth-in-cities_aee775c0.html
19. World Bank, Building Productive Cities (2026) — https://data360.worldbank.org/en/atlas/urban-development/
20. OECD, Guidelines for Citizen Participation Processes — https://www.oecd.org/en/publications/2022/09/oecd-guidelines-for-citizen-participation-processes_63b34541.html
21. Participedia, participatory budgeting case database — https://participedia.net/search?layout=list&query=Participatory+Budgeting&selectedCategory=case

Retention/progression:
22. GameAnalytics, Retention — https://docs.gameanalytics.com/products-and-features/analytics-iq/engagement-tools/retention/
23. GameAnalytics, Progression Events — https://docs.gameanalytics.com/events-metrics-and-filtering/event-types/progression-events/
24. GameAnalytics, Metrics — https://docs.gameanalytics.com/events-metrics-and-filtering/metrics/

AI governance/security:
25. NIST AI RMF Core — https://airc.nist.gov/airmf-resources/airmf/5-sec-core/
26. NIST AI RMF FAQ — https://www.nist.gov/itl/ai-risk-management-framework/ai-risk-management-framework-faqs
27. OECD.AI trustworthy AI implementation — https://oecd.ai/en/one-ai-working-group-implementing-trustworthy-ai
28. OWASP GenAI, Excessive Agency — https://genai.owasp.org/llmrisk/llm062025-excessive-agency/

International SEO:
29. Google Search Central, multi-regional/multilingual sites — https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
30. Google Search Central, localized versions/hreflang — https://developers.google.com/search/docs/specialty/international/localized-versions
31. Google Search Central, generative AI content guidance — https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
32. Google Search Central, spam policies/scaled content abuse — https://developers.google.com/search/docs/essentials/spam-policies

Korean legal boundary references:
33. Korean Game Industry Promotion Act, Article 32 exchange/re-purchase prohibition — https://www.law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1032690633
34. Korean Game Industry Promotion Act, Article 2 definitions — https://www.law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1028311545
35. Korean Virtual Asset User Protection Act, Article 2 exclusions — https://law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1024562465
36. Korean Electronic Financial Transactions Act, Article 2 prepaid means definition — https://law.go.kr/LSW/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1024558603

These sources inform product patterns and safety boundaries; they do not substitute for formal legal advice or prove that a specific Moneyverse implementation is compliant.

## 31. Definition of Done for planning

v526 planning is complete when:
- all 18 approved features have explicit scope and priority;
- monetary/fiscal/AI authority boundaries remain consistent with v523;
- domestic/overseas differences are explicit;
- data/API/analytics/anti-abuse/release requirements are specified;
- a phased P0/P1/P2 roadmap exists;
- English canonical and Korean synchronized documents exist;
- PROJECT_PLAN and integrated master adopt the specification;
- start/mid/final work records and internal/GitHub update notes exist;
- no runtime/Test/Production implementation is falsely claimed.
