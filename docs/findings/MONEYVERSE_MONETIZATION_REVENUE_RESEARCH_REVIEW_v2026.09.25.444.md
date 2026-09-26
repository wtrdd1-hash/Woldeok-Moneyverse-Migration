# Moneyverse Monetization & Revenue Research Review — v2026.09.25.444

Date: 2026-09-25
Status: PLANNING / RESEARCH
Authority target: `PROJECT_PLAN.md` + `MONETIZATION_COMPLIANCE_SEO_SPEC.md`
Corpus: `MONEYVERSE_MONETIZATION_REFERENCE_CORPUS_v2026.09.25.444.csv`

## 1. Corpus construction

This cycle created a traceable discovery corpus focused on subscription, advertising, digital goods, in-app purchases, freemium, marketplace/platform fees, sponsorship/creator economics, pricing and recurring revenue.

- OpenAlex first pass: 13,231 collected candidates -> 11,429 unique candidates.
- Crossref expansion: 24,000 collected candidates.
- Combined raw rows: 35,429.
- DOI-first and normalized-title fallback deduplication: **33,341 unique discovery candidates**.
- Source split: Crossref 21,912 / OpenAlex 11,429.
- Recent cohorts: 2026 = 851, 2025 = 1,175, 2024 = 932, 2023 = 1,003, 2022 = 875.

The corpus is a discovery index, not a claim that 33,341 papers were read in full or are equally applicable. Broad bibliographic search introduces false positives; production decisions use the focused primary/normative/peer-reviewed review below.

## 2. Evidence hierarchy

Tier A: current first-party store rules, statutes/regulator guidance, official public-company filings/results, and directly observed Moneyverse telemetry.
Tier B: peer-reviewed research, field experiments, systematic/meta-analytic studies, and high-quality working papers with methods visible enough to assess.

Tier C: discovery-corpus candidates used to locate themes and related work. Corpus membership alone cannot authorize pricing, rollout or a legal conclusion.

## 3. High-confidence findings

### M444-01 — Hybrid monetization fits the product better than a single revenue source
Digital platforms commonly combine free access, ads, subscriptions and direct digital-goods purchases. The optimal mix depends on audience, ad aversion, premium value and transaction economics; there is no universal winning mix.

Public-company evidence shows different viable centers of gravity. Reddit reported Q2 2026 revenue of $805M, including $762M advertising revenue. Duolingo's 2025 10-K reported $873.4M subscription revenue and $164.1M other revenue, while continuing to protect a large free experience. Roblox states that substantially all bookings come from virtual-currency sales, with advertising/licensing still comparatively small.

Moneyverse must treat these as model examples, not revenue forecasts. Its finance-simulation, virtual currency and casino boundaries make direct paid economic power materially less suitable than ad-free membership, direct non-P2W cosmetics and low-risk sponsorship.

### M444-02 — Free core value must remain strong; premium must demonstrate incremental value
A 2024 IJIM meta-analytic study across 55 studies found functional, hedonic, social and price value linked to willingness to pay for freemium services, with trust mediating virtual-item willingness to pay. A September 2026 JAMS field-study paper finds free-tier habits can both help conversion and create free-tier inertia, while experienced premium benefits and premium-side habits generally support conversion and retention.

Product implication: do not deliberately damage the free tier. Premium previews/trials should let users experience clear convenience/presentation value before purchase.

### M444-03 — Advertising revenue requires retention and trust guardrails
Ads can fund a large free audience, but ad load is not free money. Better Ads Standards explicitly prohibit disruptive experiences, and empirical work shows advertising can cannibalize engagement or IAP in some settings.
A 2026 Korean simulation-game A/B study reported higher short-term revenue with banner ads but weaker onboarding/retention signals. Separate large-scale game research also identifies IAP cannibalization as a key ad-deployment parameter.

Moneyverse therefore keeps contextual/public-content advertising on allowlisted low-risk surfaces, with no ads inside wallet, transfer, loan, WDX order, casino, account-security or administrator decision flows. Ad experiments require holdouts and D1/D7/D30, task completion, complaint, accidental-click, latency and conversion guardrails.

### M444-04 — Direct non-functional cosmetics are the safest paid-goods lane
A 2026 Journal of Business Research paper reports that paid non-functional virtual goods can increase enjoyment through psychological ownership. This supports profile themes, frames, nameplates, room/office cosmetics, dashboard themes, archive presentation packs and season visuals.

Paid cosmetics should be sold as direct, clearly priced entitlements. **Do not require buying WLD first.** Real-money entitlement accounting remains separate from the WLD ledger.

### M444-05 — Paid random rewards remain blocked
Research continues to associate loot-box spending with gambling-like harm, and experimental evidence shows opaque odds/selected feedback can increase willingness to pay. FTC enforcement against Genshin Impact and Epic/Fortnite highlights child/teen, disclosure and unintended-purchase risk. Apple requires odds disclosure for paid randomized virtual items, and Korea has probability-item disclosure rules.

Moneyverse therefore retains `PAID_RANDOM_ITEM = BLOCK`, no paid probability boosts, and no paid -> casino-stake path.

### M444-06 — Store/payment economics must be effective-date and channel aware
As of 2026-09-25, Google Play's announced new fee schedule rolls out in Korea on **2026-12-31**, so September Korea forecasts must not prematurely use that future schedule. Current Korea alternative billing uses the applicable Play service fee reduced by four percentage points, subject to program rules.

Apple documents 70% developer proceeds for standard auto-renewing subscriptions during a subscriber's first paid year and 85% after one year, less applicable taxes; Small Business Program members receive 85% from the start. Korea external-purchase entitlement has separate-binary and entitlement requirements.

Unit economics must therefore key on market, channel, effective date, install cohort where applicable, transaction type, billing path and program.
### M444-07 — Subscription cancellation is a product requirement, not a legal minimum
Korea's e-commerce rules require a 30-day notice/consent window for recurring-price increases or free-to-paid conversion under the current regime. In the US, the 2024 FTC Click-to-Cancel rule is not treated as current binding authority; the FTC reopened negative-option rulemaking in March 2026 while continuing ROSCA/FTC Act enforcement against deceptive enrollment/cancellation practices.

Moneyverse keeps simple online cancellation, explicit recurring price/interval/renewal disclosure, durable consent evidence, and no cancellation obstruction regardless of minimum legal requirements.

### M444-08 — Sponsorship/B2B can diversify revenue without touching player power
2026 creator-economy research shows subscription revenue, sponsorship and advertising can substitute for one another. Moneyverse can use clearly disclosed sponsor-funded season visuals, educational/lore modules, community projects and future business/API services, provided sponsors cannot influence WDX prices, ranking, moderation, loan terms, reward rates or privileged user data.

## 4. Adopted monetization portfolio

1. **Free core:** all essential economy/game/community functionality remains usable without payment.
2. **Contextual public ads:** only low-risk public discovery/content surfaces; no sensitive economic/action surfaces.
3. **Moneyverse Plus:** ad-free experience plus presentation/convenience value such as themes, archive/export presentation, extra saved layouts/watchlists where non-competitive, and optional premium recaps.
4. **Direct cosmetic SKUs:** profile/space/club/dashboard/season visual goods purchased directly as entitlements, never through paid WLD.
5. **Sponsored modules:** clearly labeled sponsor-funded lore/education/season visuals with strict separation from economic authority.
6. **Later-stage creator/B2B/API lanes:** only after rights, moderation, privacy, revenue-share, metering and support controls exist.

Blocked: cash purchase of WLD, paid randomized items, paid casino stake/value, P2W economic advantage, faster moderation for money, paid superior WDX information, and financial-product affiliate placements that can be confused with Moneyverse simulated-finance decisions.

## 5. Revenue accounting and experiment gates
Primary profitability metric is contribution margin, not gross revenue:
`gross receipts - store/platform fee - PSP fee - tax/VAT cost - refunds/chargebacks - creator/revenue share - ad sales cost - incremental infrastructure - support/moderation - localization/content - compliance/legal operating cost`.

Track ARPU/ARPDAU/ARPPU, subscriber conversion/churn, ad eCPM/fill/viewability, cosmetic attach/repeat, sponsorship revenue, refund/chargeback rate, support cost, D1/D7/D30 by monetization cohort, trust/complaint signals and contribution margin by market/channel/SKU.

All prices, conversion rates, eCPM, churn, CAC, LTV and revenue forecasts remain `HYPOTHESIS/TEST TARGET` until measured on Moneyverse telemetry. A monetization experiment is stopped or rolled back when retention, trust, support, safety or economy guardrails regress beyond its pre-registered threshold.

## 6. Focused references

- Google Play service fees and 2026 regional rollout: https://support.google.com/googleplay/android-developer/answer/112622
- Google Play lower-fee rollout: https://support.google.com/googleplay/android-developer/answer/16954621
- Google Play South Korea alternative billing: https://support.google.com/googleplay/android-developer/answer/11222040
- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Apple auto-renewable subscriptions: https://developer.apple.com/app-store/subscriptions/
- Apple Small Business Program: https://developer.apple.com/app-store/small-business-program/
- Apple South Korea external purchase entitlement: https://developer.apple.com/support/storekit-external-entitlement-kr
- Korea e-commerce law / recurring-payment rule: https://www.law.go.kr/
- Korea Fair Trade Commission dark-pattern implementation guidance: https://www.ftc.go.kr/
- PIPC behavioral-advertising policy: https://www.pipc.go.kr/
- FTC Negative Option Rule docket / 2026 rulemaking: https://www.ftc.gov/legal-library/browse/rules/negative-option-rule
- FTC Genshin Impact settlement (2025): https://www.ftc.gov/news-events/news/press-releases/2025/01/genshin-impact-game-developer-will-be-banned-selling-lootboxes-teens-under-16-without-parental
- Google Better Ads Standards: https://support.google.com/publisherpolicies/answer/11127848
- Reddit Q2 2026 results: https://investor.redditinc.com/
- Duolingo 2025 Form 10-K: https://investors.duolingo.com/
- Roblox investor results / bookings disclosures: https://ir.roblox.com/
- Tyrväinen & Karjaluoto (2024), IJIM, DOI 10.1016/j.ijinfomgt.2024.102787.
- Kreimer et al. (2026), Journal of the Academy of Marketing Science, DOI 10.1007/s11747-026-01205-w.
- Zhang et al. (2026), Journal of Business Research, DOI 10.1016/j.jbusres.2026.116180.
- Li et al. (2024), European Journal of Operational Research, DOI 10.1016/j.ejor.2023.10.024.
- Acemoglu et al. (2024), NBER Working Paper 33017, DOI 10.3386/w33017.
- von Meduna et al. (2020), Technology in Society, DOI 10.1016/j.techsoc.2020.101395.
- What drives demand for loot boxes? (2024), JEBO, DOI 10.1016/j.jebo.2024.106755.

## 7. Runtime claim

This cycle changes research/planning documentation only. It does not claim billing implementation, Test verification, Production deployment, revenue generation or legal clearance.
