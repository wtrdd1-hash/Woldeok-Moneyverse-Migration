# Administrator Treasury, Tax, and Fiscal Operations Specification

> Version: v2026.10.01.488
> Status: implementation-oriented Living product specification
> Baseline date: 2026-09-21
> Updated: 2026-10-01
> Korean counterpart: [ADMIN_TREASURY_MANAGEMENT_SPEC.ko.md](ADMIN_TREASURY_MANAGEMENT_SPEC.ko.md)
> Supersedes: v2026.09.21.323
> Scope: planning/documentation only; no runtime, DB, API, Test, or Production mutation is claimed by this revision.

## 1. Purpose

Define treasury as a server-authoritative fiscal subsystem connecting **tax/fee revenue -> treasury inflow -> protected reserve -> automatic recycling budget -> visible member/public programs -> reconciliation/audit -> economy and participation feedback**.

Treasury is not a member wallet and it is not a hard sink. It uses non-login system accounts, every WLD mutation passes the Economy Core/append-only ledger contract, and a tax collected into treasury remains part of WLD supply until a separate policy actually destroys currency.

v488 adds a missing invariant: **healthy treasury surplus must not accumulate indefinitely without a planned use.** When reserve, reconciliation, data freshness and integrity gates are healthy, eligible idle surplus is automatically converted into bounded budget commitments that create useful player activity rather than arbitrary giveaways.

## 2. Fiscal and player-experience principles

1. Treasury is not burn; tax-to-treasury and hard-sink accounting stay separate.
2. Tax is a tuning instrument, not an objective and not a punishment for ordinary play.
3. Baseline rates stay low and change slowly; launch values are hypotheses until replay/Test evidence exists.
4. Onboarding rewards, baseline work/quest/check-in rewards, refunds and correction principal remain non-taxable.
5. Budget allocation never mints WLD; it reserves and redistributes existing treasury WLD.
6. Healthy surplus should fund **things to do**: public projects, verified contracts, seasonal activities, new/returning-user activation and bounded stabilization.
7. A player's tax amount must never buy competitive power, ranking priority, moderation priority or better market information.
8. Tax-funded participation rewards are based on verified activity and broad participation, not proportional to how much tax a member paid.
9. Reconciliation, reserve or integrity failure is fail-closed for automatic tax changes and discretionary automatic spending.
10. Every member-facing tax must be visible before or at settlement, with an understandable receipt and current policy version.
11. Idle-balance taxes, punitive wealth confiscation and arbitrary holding caps are prohibited.
12. Tax-funded random jackpots, lotteries or wagering are prohibited; treasury entertainment rewards are deterministic or skill/task based.

## 3. Tax and fee portfolio

All values below are **initial planning defaults**, not runtime facts. The absolute policy envelope remains 0-10% unless a future explicit authority changes it.

| Code | Tax / fee | Base / trigger | Initial | Allowed | Treasury share | Player-experience rule |
|---|---|---|---:|---:|---:|---|
| TAX_TRANSFER | Member transfer tax | settled P2P principal | 0% | 0-2% | 100% | keep ordinary social transfers frictionless by default |
| TAX_MARKET_SALE | Marketplace sales tax | executed seller gross | 2% | 0-5% | 100% | shown in quote and receipt |
| FEE_MARKET_LIST | Listing/broker fee | non-immediate listing notional | 0.5% | 0-1.5% | 100% | first starter listings may be waived; fee discourages spam |
| FEE_MARKET_REPRICE | Upward reprice fee | increased notional only | 0.10% | 0-0.5% | 100% | one policy-defined free correction window; no fee on price decreases except minimum processing fee if configured |
| TAX_STOCK_SELL | Virtual-stock sell tax | executed sell notional | 1% | 0-3% | 100% | no tax on watchlist or cancelled/unfilled orders |
| TAX_BUSINESS_PROFIT | Business profit tax | positive recognized profit | 3% | 0-8% | 100% | losses carry no tax; no revenue-only taxation |
| TAX_BUSINESS_SURPLUS | Large-profit surcharge | positive profit above policy threshold | 0% | 0-2% | 100% | off by default; may activate only with measured concentration evidence |
| TAX_B2B | B2B settlement tax | settled business payment | 1% | 0-3% | 100% | charge once per settled event |
| TAX_SHOP_STANDARD | Standard shop consumption tax | designated taxable SKU price | 1% | 0-3% | 100% | starter/core progression SKU exemptions allowed |
| TAX_LUXURY | Luxury/prestige consumption tax | designated prestige SKU price | 3% | 0-8% | 100% | primary high-wealth tax lane |
| TAX_PROPERTY_STAMP | Property/space upgrade stamp duty | designated high-tier room/office/landmark upgrade | 2% | 0-5% | 100% | never applies to starter space |
| FEE_BUSINESS_LICENSE | Business expansion/renewal fee | optional expansion or high-tier license event | policy amount | 0-3% equivalent | 100% | baseline business access must not require recurring punitive fees |
| TAX_CITY_ADMIN | Club/city administration levy | designated non-refundable project/admin fee | 1% | 0-3% | 100% | public use and destination must be visible |
| TAX_SEASON_TEMP | Temporary seasonal luxury levy | explicitly tagged event/prestige transactions | 0% | 0-1% | 100% | disabled by default; auto-expires at season boundary |
| TAX_CASINO | Casino/probability flows | separate casino contract | 0% | fixed 0% | 0% | no tax mechanic may be used to legitimize a blocked chance feature |
| TAX_REWARD | Work/check-in/quest reward | reward payout | 0% | fixed 0% | 0% | remains non-taxable |
| TAX_REFUND | Refund/reversal principal | returned principal | 0% | fixed 0% | 0% | remains non-taxable |

### 3.1 Minimum-tax and starter protection

- A policy may define a minimum taxable base so very small transactions round to zero instead of creating nuisance friction.
- New/low-balance cohorts may receive **fee waivers** for a bounded number of listings, property starter upgrades or business onboarding actions; this is not a personalized hidden tax rate.
- Any mastery/reputation benefit may reduce only designated **service/listing fees**, not core taxes, and must have a public floor. It cannot be bought with real money.
- Aggregate effective burden is monitored by wealth/tenure cohort so a nominally small tax cannot become regressive through transaction frequency.

### 3.2 Earmarking without fake traceability

Policy may earmark a portion of a tax class to a program family, for example luxury/prestige receipts to CITY_COMMUNITY or SEASON_EVENT. Receipts must distinguish:
- actual transaction tax collected;
- treasury destination account;
- policy allocation weight;
- later program settlement.

The UI must not claim that a specific member's exact WLD coin funded a specific later payout when accounting only supports pooled treasury attribution.

## 4. Exemptions

Default non-taxable events include onboarding rewards, baseline job/quest/check-in rewards, incident compensation, correction refunds, stock-halt cost-basis settlement, internal same-account sub-ledger transfers, reversal/refund principal, starter-space entitlement and policy-defined essential-access waivers.

## 5. Tax calculation and settlement

Use integer/basis-point arithmetic only.

\`tax = floor(taxable_base * rate_bps / 10_000)\`

Each receipt records tax code, base, rate, amount, net amount, rounding remainder, exemption/waiver reason, policy version, taxable event ID and ledger transaction ID.

Requirements:
- stable taxable event IDs prevent duplicate collection;
- a transaction with multiple taxes/fees has a server-defined order and maximum effective burden;
- cancelled/unfilled orders do not incur settlement taxes, though an explicitly quoted non-refundable listing fee may remain;
- activated policy versions apply only from \`effective_at\` forward;
- refunds reverse only the tax/fee components whose policy contract says they are refundable;
- policy preview must show the gross-to-net calculation before a high-friction member action is committed.

## 6. Treasury balance states

Expose total, committed, available, protected reserve, stability buffer, pending inflow/outflow, 1d/7d/30d revenue and expenditure, net flow, reserve coverage days, recyclable surplus, oldest eligible-surplus age and program settlement backlog.

\`available = total - committed - protected_reserve - pending_outflow\`

\`recyclable_surplus = max(0, available - stability_buffer)\`

Initial planning reserve target: 14 days of recent essential spending. Initial stability buffer: an additional 7 days of measured discretionary baseline, configurable after Test replay.

States:
- **EMERGENCY**: <3 days essential coverage. Only essential refund/recovery settlement continues.
- **CRITICAL**: 3-7 days. No new discretionary commitments.
- **WARNING**: 7-14 days. Existing commitments settle; new automated programs are heavily restricted.
- **HEALTHY**: >=14 days with clean reconciliation and fresh telemetry. Automatic recycling may run.
- **SURPLUS**: >=28 days essential coverage plus recyclable surplus above the policy threshold for seven consecutive days. Recycling target increases within caps.

## 7. Treasury Recycling Engine

The Treasury Recycling Engine exists so tax collection creates visible play instead of an ever-growing dormant balance.

### 7.1 Eligibility gates

Automatic discretionary commitment requires all of:
- HEALTHY or SURPLUS reserve state;
- latest lightweight and daily full reconciliation inside tolerance;
- no active economy-integrity incident;
- telemetry freshness and minimum sample coverage;
- no release/maintenance freeze that disables payouts;
- program-specific fraud/abuse controls healthy.

If any gate fails, the engine produces a recommendation only and does not commit funds.

### 7.2 Initial auto-commit envelope

Planning defaults:
- HEALTHY: weekly automatic commitments may use up to **25% of recyclable surplus** and no more than **20% of trailing 28-day tax/fee revenue**.
- SURPLUS: weekly automatic commitments may use up to **40% of recyclable surplus** and no more than **30% of trailing 28-day tax/fee revenue**.
- Per-program daily and weekly caps apply inside that envelope.
- Automatic commitments cannot reduce post-commit coverage below the protected reserve and stability buffer.
- Unused allocations roll for at most four weekly cycles before they return to uncommitted treasury and trigger a program-quality review.

These are simulation targets, not Production parameters.

### 7.3 Initial allocation weights

The engine chooses only from pre-approved program templates. Initial recyclable-pool weights:

| Program lane | Weight | Purpose |
|---|---:|---|
| CITY_COMMUNITY_MATCH | 25% | match member contributions to city/community projects |
| PUBLIC_CONTRACTS | 20% | fund verified delivery, crafting, logistics and service missions |
| SEASON_EVENT_PUBLIC_GOODS | 15% | unlock deterministic seasonal/community activities |
| NEW_RETURN_SUPPORT | 15% | starter/returner missions, fee waivers and catch-up tasks |
| BUSINESS_MARKET_STABILIZATION | 10% | bounded temporary support where measured activity/liquidity is weak |
| INFRASTRUCTURE_FEE_RELIEF | 10% | temporary travel/service/listing-fee relief for all eligible members |
| CIVIC_WEEKLY_CHALLENGE | 5% | cross-system cooperative challenge with cosmetic/title/community rewards |

Weights can be shifted only within versioned limits. Essential refunds, incident response and administrator corrections are outside this discretionary pool.

## 8. Fun and participation systems funded by treasury

### 8.1 Treasury Today meter

The home/economy surfaces may show:
- tax/fee collected today and this week;
- protected reserve status;
- amount already returned to public programs;
- current community project;
- next unlock threshold;
- current treasury-funded missions.

The purpose is to make fiscal flow legible, not to celebrate higher taxation.

### 8.2 Community matching projects

Members contribute WLD/items/actions to approved city/community projects. Treasury matches verified contributions up to:
- per-member cap;
- project cap;
- daily/weekly program cap;
- anti-alt/related-account rules.

Completion can unlock non-P2W public outcomes such as a visual city upgrade, temporary service-fee discount, community space decoration, public event, archive/museum exhibit, profile collectible or new cooperative mission chain.

### 8.3 Treasury public contracts

Treasury can publish bounded contracts such as:
- deliver specified crafted items;
- complete logistics routes;
- restore/community-maintain facilities;
- fulfill diversified profession work;
- supply low-stock non-critical resources;
- create approved community content artifacts.

Every contract has quantity, reference-price band, deadline, verification rule, participant cap, payout cap and idempotent settlement. The treasury never buys at arbitrary administrator-entered prices.

### 8.4 Seasonal public works

A season may expose a visible public budget meter. Reaching verified contribution and participation milestones unlocks new content stages. Treasury funding can pay deterministic task rewards or reduce public-service costs during the stage.

No random tax-receipt lottery, paid spin, wagering or chance-based treasury payout is permitted.

### 8.5 New/returning-user activation

Treasury can fund:
- first-week diversified mission bonuses;
- limited listing/service fee waivers;
- catch-up quests that encourage two or more systems;
- non-transferable starter utility/cosmetic entitlements;
- matched contributions to a first community project.

Direct large WLD grants are a last resort because they raise issuance pressure and alt-account abuse.

### 8.6 Infrastructure relief events

When treasury is healthy, an automatic program may temporarily reduce selected public fees such as travel, listing, restoration or community-service costs. The treasury records the foregone/covered amount as a fiscal program so the benefit is visible and budgeted.

### 8.7 Market and item-stability drives

Where item oversupply is measured, treasury may run an approved buyback/salvage drive:
- only allowlisted items;
- bounded reference price derived from non-manipulated history;
- per-account and global limits;
- purchased items are destroyed or converted according to the sink contract;
- WLD paid comes from treasury, so this is an **item sink plus WLD recirculation**, not a WLD hard sink.

## 9. Tax-linked progression without pay-to-win

To make fiscal mechanics learnable rather than purely punitive:
- an Accounting/Commerce mastery track may reduce designated listing/broker/admin service fees within a published floor;
- discounts come from gameplay progression or reputation, never real-money purchase;
- core taxes such as TAX_MARKET_SALE and TAX_LUXURY do not disappear for high-level users;
- community participation can award titles, badges, profile frames and civic archive entries based on verified project contribution **breadth**, not tax amount paid;
- seasonal summaries can show “projects helped” and “public programs joined” rather than a richest-taxpayer leaderboard.

## 10. Participation optimization objective

Treasury spending optimizes a multi-objective vector, not raw spend or click count:

1. unique weekly participants in treasury-funded programs;
2. first-action latency after login;
3. program completion rate;
4. D1/D7 return rate for eligible new/returning cohorts;
5. number of distinct product systems used per weekly active member;
6. community-project contributor count and concentration;
7. repeat participation across different programs;
8. payout concentration by top 1%/10% recipients;
9. abuse/alt-account/wash-transaction rate;
10. WLD velocity, purchasing power and inflation guardrails;
11. member support/complaint rate;
12. reserve and reconciliation health.

A program is paused when it increases low-quality repetitive actions, payout concentration, price distortion or abuse without improving broad verified participation.

## 11. Anti-abuse rules

Tax collection and treasury spending must resist farming:
- no reward for self-transfer loops or related-account circular trades;
- no program credit for cancelled/reversed transactions;
- deterministic actor/account/device/risk controls on matching programs;
- diminishing or capped rewards for identical repetitive actions;
- public contracts require independent deliverable verification;
- marketplace programs ignore wash-price prints and manipulated thin-market outliers;
- claims use stable program/actor/idempotency identity;
- suspicious claims remain reviewable without changing past ledger rows.

## 12. Spending priorities

Priority order:
1. refunds/recovery;
2. incident response and mandatory corrections;
3. committed treasury-funded rewards;
4. new/returning-user protection;
5. community/city matching and public contracts;
6. economic/business/market stabilization;
7. season/event public goods and fee relief;
8. audited administrator discretionary correction.

Treasury may not arbitrarily enrich selected accounts, compensate speculative losses, reimburse casino losses or erase ledger history to force a balance.

## 13. Budget envelopes

Initial envelopes:
- ESSENTIAL_REFUND
- INCIDENT_RESPONSE
- REWARD_POOL
- NEW_USER_SUPPORT
- RETURNING_USER_SUPPORT
- CITY_COMMUNITY
- PUBLIC_CONTRACTS
- SEASON_EVENT
- INFRASTRUCTURE_FEE_RELIEF
- BUSINESS_STABILIZATION
- MARKET_STABILIZATION
- ITEM_BUYBACK_SALVAGE
- CIVIC_WEEKLY_CHALLENGE
- ADMIN_CORRECTION

Each stores stable ID, period, allocation, committed, settled, remaining, priority, automation eligibility, policy/config version, actor/source, reason, experiment cohort where applicable and immutable history.

## 14. Automatic fiscal tuning

Observe faucet/sink, treasury flow, velocity, marketplace/stock turnover, business profitability, asset concentration, cohort affordability, reserve coverage, reconciliation variance and participation quality.

Tax-rate automatic changes remain more conservative than spending allocation:
- max +/-0.5 percentage points per change;
- max once per week;
- minimum seven-day hold;
- absolute 0-10% envelope;
- no automatic activation of a previously disabled tax class;
- stale data, sample insufficiency, reserve stress or reconciliation failure disables automatic changes.

Automatic spending may rebalance only between approved program templates and within published caps. It cannot invent a new tax, sink, reward type or economic entitlement.

## 15. Admin UI

Admin -> Economy -> Treasury:
1. Overview
2. Revenue
3. Taxes & Fees
4. Recycling Engine
5. Programs & Public Contracts
6. Expenditure
7. Budgets
8. Corrections
9. Reconciliation
10. Policy & Alerts
11. Audit

Tax policy UI shows current rate, allowed band, next eligible change time, actor/reason, 24h/7d revenue, effective burden by cohort, estimated impact and rollback version.

Recycling UI shows reserve state, recyclable surplus, auto-commit cap, current weights, each program's unique participants, completion, payout concentration, abuse flags, remaining budget and pause/rollback control.

## 16. Member UI and receipts

Every taxed transaction exposes gross/base amount, tax/fee name, rate, amount, net settlement, exemption/waiver reason when applicable, policy version and transaction ID.

A member-facing Treasury page may expose:
- current reserve state without sensitive operator internals;
- collected vs program-spent totals;
- active public projects and contract pools;
- “where it goes” allocation weights;
- project/program history;
- the member's verified project participation.

Hidden taxes are prohibited.

## 17. Ledger categories

Minimum categories:
- TAX_MARKETPLACE
- FEE_MARKET_LIST
- FEE_MARKET_REPRICE
- TAX_STOCK_SELL
- TAX_BUSINESS_PROFIT
- TAX_BUSINESS_SURPLUS
- TAX_B2B
- TAX_CONSUMPTION
- TAX_LUXURY
- TAX_PROPERTY_STAMP
- TAX_CITY_ADMIN
- TREASURY_FEE
- TREASURY_PROGRAM_COMMIT
- TREASURY_REWARD
- TREASURY_MATCH
- TREASURY_CONTRACT
- TREASURY_SUBSIDY
- TREASURY_FEE_RELIEF
- TREASURY_ITEM_BUYBACK
- TREASURY_GRANT
- TREASURY_REFUND
- TREASURY_INCIDENT
- ADMIN_CORRECTION_IN
- ADMIN_CORRECTION_OUT
- REVERSAL

Treasury and burn use distinct double-entry paths.

## 18. API direction

Member reads:
- treasury public summary;
- public programs/projects/contracts;
- member program participation/claims;
- tax/fee policy quote details.

Admin reads:
- treasury summary, transactions, revenue, expenditure, taxes/fees, recycling state, programs, budgets, reconciliation and audit.

Mutations:
- tax/fee preview and commit;
- recycling policy preview and commit;
- program create/pause/close;
- public-contract publish/cancel under safe rules;
- budget create/update;
- claim/fulfillment settlement through actor-scoped DB functions;
- correction preview/commit;
- reconciliation run.

Every mutation requires server authorization, CSRF where browser-applicable, request hash, idempotency key, DB-side actor validation and immutable audit.

## 19. Data model direction

Recommended tables:
- treasury_accounts
- treasury_transactions
- treasury_tax_policies
- treasury_tax_policy_versions
- treasury_recycling_policies
- treasury_budgets
- treasury_budget_commitments
- treasury_programs
- treasury_program_allocations
- treasury_program_claims
- treasury_public_contracts
- treasury_matching_contributions
- treasury_reconciliations
- treasury_adjustments
- treasury_alerts

Core constraints include amount > 0, rate_bps between 0 and 1000, unique taxable-event/tax-code pair, unique program/actor/claim identity, unique actor/action/idempotency key, append-only settled transactions and immutable activated policy versions.

## 20. Reconciliation

Plan hourly lightweight reconciliation and daily full reconciliation across treasury account balance, ledger aggregates, tax/fee sources, budget commitment/settlement, program payouts, matching contributions, contract fulfillment, fee relief, buyback settlement, refunds and reversals.

Variance never triggers destructive auto-fix. It creates evidence, freezes affected automatic spending and can place the engine in recommendation-only mode.

## 21. QA acceptance

Verify at minimum:
- tax base/timing and exemptions;
- basis-point rounding and minimum-tax rules;
- duplicate collection prevention;
- listing/reprice fee quote and cancellation semantics;
- concurrent settlement and duplicate claim protection;
- effective_at policy boundaries;
- reserve-state transitions;
- recyclable-surplus and auto-commit formulas;
- no commitment can breach protected reserve/stability buffer;
- program allocation weights/caps;
- project matching per-user/global caps;
- public-contract price-band and fulfillment verification;
- wash-trade/related-account exclusions;
- payout concentration guardrails;
- program pause/rollback;
- reconciliation safe mode;
- member receipt/public-budget accuracy;
- BOLA/IDOR, re-auth, CSRF and idempotency;
- responsive 320/360/390/768/1024/1440 behavior;
- BigInt-safe formatting;
- exact-SHA Test backend/API/DB evidence before runtime promotion.

## 22. Research basis adopted for v488

Design implications were rechecked against current/reference game-economy material:
- EVE Online separates broker fees charged on order creation from seller sales tax and allows bounded fee reductions through skill/standing systems; Moneyverse borrows the separation and learnable-fee idea, not EVE's exact rates.
- Old School RuneScape's Grand Exchange tax/item-sink intervention shows that transaction taxation and item removal can be combined, while empirical research also shows market interventions can have category-specific price effects; Moneyverse therefore measures volume, price and substitution instead of assuming “more tax = healthier economy.”
- New World connected territory taxes to upkeep and Town Projects, demonstrating the player-experience value of making collected funds visibly support settlement functions.
- Guild Wars 2 uses explicit Trading Post listing/exchange fees and guild treasury contributions that unlock visible guild upgrades/missions; Moneyverse adopts transparent pre-settlement fees plus visible pooled-project outcomes.

Evidence review: [TREASURY_TAX_ENGAGEMENT_RESEARCH_REVIEW_v2026.10.01.488.md](../findings/TREASURY_TAX_ENGAGEMENT_RESEARCH_REVIEW_v2026.10.01.488.md).

## 23. Delivery sequence

- **v2026.10.01.488-01** — tax/fee event, exemption, quote and receipt contract.
- **-02** — treasury/recycling/program schema, DB actor boundaries and append-only ledger paths.
- **-03** — atomic tax/fee settlement plus duplicate/concurrency tests.
- **-04** — reserve states, recyclable-surplus calculation and fail-closed Recycling Engine in SHADOW.
- **-05** — community matching, public contracts and program settlement with anti-abuse.
- **-06** — member Treasury Today/public-project UI plus admin Recycling/Programs control tower.
- **-07** — participation/economy telemetry, cohort burden, payout concentration and experiment guardrails.
- **-08** — real-DB concurrency/reconciliation/security/responsive E2E and economic replay.
- **-09** — re-read latest Living Project Plan/main, reconcile concurrent work and verify exact candidate SHA on Test.
- **-10** — only after evidence: merge, rebuild exact merged SHA, zero-downtime Production promotion and smoke/reconciliation verification.

## 24. Current implementation status

This revision is **PLANNING/documentation only**. Existing ledger, economy policy, admin and analytics infrastructure may be reused, but v488 does not claim that the expanded tax portfolio, Treasury Recycling Engine, public projects, public contracts, matching, fee relief, member Treasury page, APIs, DB schema or Test/Production behavior already exists.
