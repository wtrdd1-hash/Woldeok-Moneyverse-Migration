# Moneyverse Feature, SEO and Growth Expansion — v2026.10.14.604

> Status: PLANNING / proposed, not adopted or deployed. Korean companion: FEATURE_SEO_GROWTH_EXPANSION_SPEC.ko.md.
> Authority: PROJECT_PLAN → INTEGRATED_PLANNING_MASTER; preserve v530 UI blocker, v523 conservation and v527 keyword admission.

## Product loop and metrics
Search intent → genuinely useful free tool → optional virtual-economy scenario → signup → first meaningful economy action → D1/D7/D30 retention → observed monetization. North-star: proportion of organic entrants completing a meaningful economy action within seven days. Track nonbrand clicks, qualified indexed pages, calculator completion, scenario/signup conversion, ledger activation, retention, ad yield, cost and error rates. Never present estimates as observed metrics.

## Feature-to-search contracts
| ID | Priority | Product behavior | Search connection | Acceptance |
|---|---|---|---|---|
| F01 | P0 | Five-minute guest career/income/spending/debt simulator; opt-in save after signup | salary, budget, net worth | no guest WLD issuance, privacy and mobile completion |
| F02 | P0 | Daily budgeting, saving and learning quests with idempotent rewards | budgeting and savings guides | abuse prevention, ledger reconciliation |
| F03 | P0 | Versioned compound, DCA, DSR, loan, FIRE, dividend, tax, real-estate, break-even tools | task-specific calculators | validated formula, jurisdiction, effective date |
| F04 | P0 | Public money supply/treasury/macro methodology dashboard | educational economic data pages | reconciled provenance, no invented live data |
| F05 | P1 | Explainable AI budget and economy coach; user-approved actions | debt, budget, retirement | advice/execution separation |
| F06 | P1 | Careers, businesses, production, payroll, bankruptcy | business break-even | funded transfers, no negative inventory |
| F07 | P1 | Property purchase, vacancy, repairs, mortgages | rental yield, mortgage | scenario stress tests |
| F08 | P1 | Isolated policy sandbox for rates/taxes/supply | inflation and rate education | cannot mutate real economy |
| F09 | P1 | Reproducible recession, employment and supply-shock events | recession simulator | fairness and replay |
| F10 | P1 | Jurisdiction-aware cross-country salary, tax and living-cost comparisons | localized take-home pay/FIRE | native intent and legal review |
| F11 | P2 | Escrow, marketplace, contracts, refunds and disputes | fee calculator | double entry and fraud controls |
| F12 | P2 | Learning paths, quizzes and career licenses | glossary and learning intent | accurate explanations and anti-farming |

## Korea search strategy
Clusters: salary/take-home pay/social contributions; debt/DSR/amortization; savings/compound interest; dividend/stock cost basis/capital gains; ISA/pension/FIRE; gifts/property; budgeting/net worth. Each cluster gets a canonical hub, a genuinely useful tool, sourced explanations and a next-step simulation CTA. Existing routes take precedence over new URLs. Tax pages require law, jurisdiction, effective date and reviewer. Naver DataLab trend is not absolute search volume.

## International search strategy
English-first clusters: compound interest, DCA, savings goal, amortization, mortgage, FIRE/SWR, take-home pay, net worth, budgeting, DRIP and business break-even. Keep US/UK and other tax rules separate. Preserve existing Korean fallback until explicitly changed. JA/ZH and other markets launch only after native-intent, parity, legal and demand gates. Verify real routes before using /en or /ko examples. Use reciprocal hreflang, self canonical, server-rendered metadata and localized sitemaps.

## SEO admission contract
Record locale, market, intent, cluster, evidence state/provider/date, unique user task, canonical candidate, jurisdiction, reviewer, freshness deadline, translation readiness and conversion event. Demand evidence → dedupe → unique value → factual/legal review → technical checks → index admission → measured optimization/merge/noindex. The 10,473 v527 keyword candidates remain HOLD; the 111,313 reference corpus is not traffic evidence. Ban scaled low-value doorway pages, fabricated ratings, keyword stuffing and claims of guaranteed indexing. IndexNow submission does not imply indexing. FAQ rich results are not guaranteed.

## Page template
User-question H1, usable interactive tool, transparent results/assumptions/formula, worked examples, sources and effective date, limitations, related tasks, optional signup CTA, non-obstructive ads. Structured data must accurately reflect visible content. Exclude admin/account/private transaction/API/chance-related surfaces from public SEO; robots alone is not access control.

## Architecture and analytics
Versioned formula and jurisdiction registry; separate SEO read model from private account/ledger writes; no personal data in shareable URLs. Consent-aware, deduplicated events: landing_view, calculator_start/complete, scenario_start/complete, signup_start/complete, first_economy_action, d7_return, ad_viewable and subscription_conversion. Preserve Central Bank approval, Mint-only supply mutation, funded Treasury spending and Economy Core double-entry settlement. AI never directly mints/retires.

## Delivery gates
G0 remediate v603 security, v530 UI and ledger blockers before new economy writes. G1 audit current URLs/features and assign content owners. G2 read-only calculators and guest scenarios with SSR/meta/canonical/hreflang, accessibility and mobile checks. G3 consent, security, idempotency and exact-SHA isolated Test. G4 five complete passes across public and authenticated admin routes plus actual HTML crawl and Web Vitals. G5 separately approved zero-downtime promotion with rollback evidence. This documentation branch does not authorize deployment.

## Authority and provenance
Current planning authority and deployment labels are not interchangeable; preserve documented drift. Existing calculators, SEO templates, treasury and careers are not counted as new implementations. Main baseline c56af867ad8f7556e53f895b0bb294c4bfc8a02d; Debian13/minipc offline; isolated docs branch docs/feature-seo-growth-plan-v2026.10.14.604. Recheck main before merge.
