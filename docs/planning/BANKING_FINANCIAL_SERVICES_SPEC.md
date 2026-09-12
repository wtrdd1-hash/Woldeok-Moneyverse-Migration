# Woldeok Moneyverse — Banking & Financial Services Specification

> Version: v2026.09.12.17
> Status: Living implementation-oriented product specification
> Date: 2026-09-12
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`
> Related implementation doc: `docs/features/banking.md`
> Korean counterpart: [BANKING_FINANCIAL_SERVICES_SPEC.ko.md](BANKING_FINANCIAL_SERVICES_SPEC.ko.md)

## 0. Purpose

This document turns Moneyverse banking from a balance/loan page into a durable service layer that supports budgeting, virtual credit, virtual bonds, business protection, records, storage/showcase services and recurring WLD sinks without creating punitive debt traps or real-finance ambiguity.

All products are in-service game mechanics. They are not real deposits, securities, insurance, credit products, investment returns or cash-redeemable claims.

The system follows two standing rules:

1. **Unlimited by default.** User-facing activity counts are not arbitrarily capped. Limits exist only for security, integrity, finite inventory, market integrity, legal/policy needs or explicit contract terms.
2. **Spend by choice, not confiscation.** High-wealth players should receive desirable services, prestige, records and convenience to spend on rather than hidden wealth taxes.

## 1. Product goals

Banking should answer six player needs:

- **Understand:** where WLD came from and where it went.
- **Plan:** create budgets, savings goals and repayment plans.
- **Recover:** restructure virtual debt without a compounding failure spiral.
- **Store:** organize collectibles, records and long-term account history.
- **Simulate:** learn borrowing, interest, diversification and fixed-term products safely.
- **Spend:** consume WLD on useful or prestigious services without buying direct competitive power.

## 2. System taxonomy

Every banking action must be classified before implementation.

| Type | Meaning | Examples |
|---|---|---|
| Transfer | WLD moves between circulating accounts | loan principal disbursement, bond principal return |
| Faucet | new WLD enters circulation by explicit policy | interest subsidy if treasury-funded/minted |
| Hard sink | WLD permanently leaves circulation | origination fee, report fee, vault service fee |
| Converter | WLD/resources convert into another non-currency entitlement | archive certificate, decorative statement book |
| Hold | WLD is reserved but not destroyed | collateral reserve, pending bond purchase |

Admin dashboards must never count transfer principal as burned currency.

## 3. Banking home information architecture

`/bank` should use five primary tabs:

1. **Overview** — liquid WLD, savings balance, upcoming obligations, goals and recommended actions.
2. **Savings & Goals** — savings pockets, goal tracking and optional automation.
3. **Credit** — active virtual loans, eligibility explanation, repayment and restructuring.
4. **Bonds & Learning** — virtual fixed-term contracts and historical education/replay.
5. **Services & Records** — reports, archive books, vault/showcase, certificates and business protection services.

Primary dashboard rule: show at most three recommended actions at a time. Never surface a new borrowing CTA as the first action when the player already has arrears.

Required UI states: loading, empty, locked-by-policy, pending settlement, success, idempotent replay, insufficient funds, stale quote/config, arrears, restructuring review, maintenance and server error.

## 4. Savings pockets and goals

### 4.1 Savings pockets

Players may create multiple named savings pockets such as `Emergency`, `Headquarters`, `Season Museum`, or `Next Business`.

Default policy:

- pocket count: `null` / unlimited;
- no fee to create a basic pocket;
- transfers between own liquid account and savings pocket are transfers, not sinks;
- each pocket stores target amount, optional target date, icon/theme and privacy state;
- balance moves remain ledger-authoritative and idempotent.

### 4.2 Optional paid customization

Non-power services:

| Service | Initial planning price | Classification | Repeatable |
|---|---:|---|---|
| Pocket theme recolor | 100 WLD | hard sink | yes |
| Custom icon pack | 300 WLD | hard sink | yes/new packs |
| Goal certificate | 250 WLD | hard sink/converter | yes |
| Goal completion archive card | 500 WLD | hard sink/converter | yes |
| Framed milestone record | 1,500 WLD | hard sink/converter | yes |

These purchases do not change interest rates, job rewards, market execution or loan eligibility.

## 5. Deposit interest contract

Existing integrity rules remain authoritative: balance changes reset accrual timing as defined by implementation; sub-unit interest accumulates instead of forcing a minimum payout; one idempotency key can settle one claim; and application code cannot directly mutate protected accrual state.

### 5.1 Product rule

Deposit interest is a faucet or treasury transfer depending on funding design. The source must be explicit in ledger accounting.

Recommended initial operating modes:

- `TREASURY_FUNDED`: interest moves from a transparent system treasury balance.
- `POLICY_MINTED`: explicit faucet; admin dashboard reports it as minted WLD.
- `DISABLED`: no interest; goals still function.

No hidden source is allowed.

### 5.2 Rate configuration

Config fields:

- `interest_mode`;
- `annualized_rate_bps` or service-period equivalent;
- `minimum_accrual_unit`;
- `claim_mode = automatic | manual | mixed`;
- `effective_from`;
- `policy_version`.

Changing a rate does not retroactively rewrite already-settled interest.

### 5.3 Anti-abuse

Detect deposit/withdraw oscillation designed to exploit accrual boundaries, timestamp replay, duplicate settlement and stale policy claims. Integrity controls may throttle abusive requests but do not impose a normal-player daily savings limit.

## 6. Virtual credit and loans

### 6.1 Design principle

Loans provide temporary liquidity and teach repayment planning. They must not become an uncontrolled faucet, infinite leverage path or punishment spiral.

### 6.2 Eligibility

Eligibility may consider:

- account age and verified progression;
- recent income consistency;
- outstanding principal;
- repayment history;
- active arrears/restructuring;
- business purpose when the product is business-specific;
- abuse/integrity restrictions.

Eligibility is server policy and must return reason codes understandable to the UI.

### 6.3 No arbitrary loan-count cap

Do not use a permanent global rule such as “one loan ever” or “three loans per month.” Instead evaluate aggregate exposure and contract state.

A borrower may hold multiple contracts when policy permits, but new borrowing is rejected when total exposure, repayment capacity or integrity checks fail.

### 6.4 Loan pricing seed

Initial planning examples, not production constants:

| Product | Principal seed | Duration | Service/origination fee | Total contract interest seed |
|---|---:|---:|---:|---:|
| Starter Builder | 5,000–25,000 WLD | 7–14d | 1.0% min 50 WLD | 1–3% |
| Business Working Capital | 20,000–250,000 WLD | 14–30d | 1.5% min 200 WLD | 2–5% |
| Expansion Credit | policy-based | 30–60d | 2.0% min 1,000 WLD | 3–7% |

The origination/service fee is a **hard sink**. Principal is a **transfer/faucet only according to its documented source**. Repayment of principal is not a sink if it returns to a circulating treasury; a burned fee portion is.

### 6.5 Repayment

Support:

- manual partial repayment;
- full payoff;
- scheduled server settlement where implemented;
- clear allocation order: fees due -> interest due -> principal, or another explicitly versioned contract order;
- exact integer arithmetic;
- stable idempotency key for each repayment request.

Early repayment must not carry a punitive penalty at initial launch.

## 7. Arrears, hardship and restructuring

Moneyverse should prefer recovery over permanent punishment.

### 7.1 Arrears states

`CURRENT -> DUE_SOON -> PAST_DUE -> HARDSHIP_ELIGIBLE -> RESTRUCTURED -> CURRENT`

Exceptional outcomes:

- `PAST_DUE -> DEFAULTED`
- `DEFAULTED -> RECOVERY_PLAN`
- `RECOVERY_PLAN -> CLOSED`

### 7.2 Hardship safeguards

When a player cannot repay:

- present a repayment plan before offering more borrowing;
- allow maturity extension or installment restructuring under policy;
- freeze new credit if needed without freezing unrelated gameplay;
- do not compound administrative fees indefinitely;
- cap the number of fee-bearing restructuring events **per contract** only where needed to prevent debt spirals; this is a contract safety rule, not a general play cap;
- never reset permanent cosmetics, collections or unrelated property to force repayment.

### 7.3 Restructuring service fee

Default seed:

`fee = min(500 WLD, max(50 WLD, outstanding_principal * 0.5%))`

Admin config may set it to zero for hardship cohorts. The fee is a hard sink when charged.

## 8. Credit reputation

Use an explainable game-only credit reputation, not a real-world credit score.

Possible inputs:

- on-time repayment ratio;
- unresolved arrears;
- account progression;
- stable verified earning history;
- abuse/integrity holds.

Forbidden inputs:

- real-world demographic proxies;
- political/religious/social categories;
- hidden social graph punishment;
- spending on cosmetics or real-money products;
- stock-trading profitability.

The UI must show broad reasons, not a mysterious single number that implies real creditworthiness.

## 9. Virtual bonds and fixed-term learning products

### 9.1 Purpose

Virtual bonds teach maturity, opportunity cost and fixed settlement while creating optional service sinks.

### 9.2 Contract

Each bond instance stores:

- `bond_product_id`;
- `policy_version`;
- purchase principal;
- purchase timestamp;
- maturity timestamp;
- exact maturity amount or deterministic formula inputs;
- early-exit rule;
- source account and settlement destination;
- status.

Existing contracts are not retroactively repriced.

### 9.3 Purchase and settlement

Principal purchase is a transfer/hold according to implementation. Any disclosed issuance/service fee is a hard sink.

Example planning fee:

`max(10 WLD, principal * 0.10%)`.

No arbitrary bond purchase-count cap. Exposure can be bounded only if required for economy integrity, contract inventory or abuse prevention, and the reason must be documented.

### 9.4 Early exit

If early exit exists, prefer a transparent service discount/fee rather than opaque random loss. The user sees exact proceeds before confirming.

## 10. Budgeting and analytical services

Basic financial understanding is free. Paid options are presentation/convenience sinks, not privileged economic information.

### 10.1 Free baseline

- income/expense summary;
- faucet/sink categories for own account;
- upcoming loan obligations;
- savings-goal progress;
- stock/business exposure summary links;
- downloadable plain statement where technically practical.

### 10.2 Paid cosmetic/report services

| Service | Planning price | Classification | Value |
|---|---:|---|---|
| Styled monthly statement | 250 WLD | hard sink | cosmetic PDF/card styling |
| Annual ledger book | 1,500 WLD | hard sink/converter | collectible archive |
| Business finance report theme | 800 WLD | hard sink | visual formatting |
| Season finance scrapbook | 2,000 WLD | hard sink/converter | permanent archive item |
| Custom chart skin pack | 500 WLD | hard sink | visualization only |

Raw data and basic understanding must not be paywalled.

## 11. Vault, safe-deposit and showcase services

This is an inventory/display service, not real custody.

### 11.1 Basic vault

Users can organize collectibles and certificates into vault collections. Basic organization is free.

### 11.2 Paid services

| Service | Seed price | Duration | Type |
|---|---:|---:|---|
| Premium display drawer | 1,000 WLD | permanent | hard sink/converter |
| Themed vault room | 7,500 WLD | permanent | hard sink/converter |
| Museum lighting package | 2,500 WLD | permanent | hard sink |
| Archive retrieval ceremony | 500 WLD | per use | hard sink |
| Provenance certificate | 750 WLD | per item | hard sink/converter |
| Prestige vault wing | `50,000 * 1.45^n` WLD | permanent | hard sink |

`n` can grow without an arbitrary player-facing maximum. Content/rendering performance may use pagination/virtualization rather than restricting ownership.

## 12. Virtual business protection service

This feature must never be described as real insurance. Product copy should use names such as **Business Protection Contract** or **Operational Recovery Plan**.

### 12.1 Purpose

Provide a predictable sink and reduce frustration from configured in-game disruption events without guaranteeing profit.

### 12.2 Covered game events

Examples:

- inventory spoilage event;
- equipment breakdown event;
- temporary logistics disruption;
- storefront incident event.

It must not reimburse ordinary poor business performance, stock losses or intentional abuse.

### 12.3 Pricing

Example formula:

`service_fee = base_fee + covered_business_value * rate_bps + risk_modifier`

Seed tiers:

- Basic: 1,000 WLD per contract period;
- Standard: 3,000 WLD;
- Prestige: 10,000+ WLD for high-value businesses.

The fee is a hard sink. Any payout source must be explicit: treasury transfer or configured faucet, never hidden minting.

### 12.4 Anti-abuse

Contract must exist before event creation; no retroactive purchase after incident. Event IDs, policy IDs and claims use unique/idempotent settlement keys. Suspicious repeated incident clusters enter review instead of auto-paying.

## 13. Financial-service prestige sinks

High-wealth users need voluntary long-horizon sinks that do not increase earning power.

Examples:

- Founder Treasury Room: 100,000 WLD;
- Personal Financial Archive Hall: 250,000 WLD;
- Platinum Ledger Binding: 50,000 WLD per volume;
- Named scholarship-style city education sponsorship: 500,000+ WLD hard sink, recognition only;
- Historical Market Research Wing: 1,000,000+ WLD, museum/display unlock only;
- Legacy Treasury Gallery extension: `500,000 * 1.5^n` WLD.

Recognition may appear on profile, museum, city project page or season archive. It cannot modify loan rates, stock returns, business revenue or competitive ranking.

## 14. Market-learning integration

Moneyverse should keep learning, replay and competition separate from the main economy when possible.

Recommended model:

- historical replay uses isolated simulated balance;
- league accounts use equal starting simulated funds;
- replay commission can be configurable for realism;
- basic replay learning is free;
- optional themed replay scenarios/visual archives may be WLD sinks;
- main WLD cannot purchase leaderboard score or simulated starting capital.

A replay result should emphasize return, drawdown, diversification and journal/reflection rather than transaction count.

## 15. Season integration

Every season should add at least one banking/service layer without increasing financial power.

### Season 1 — First Capital

- savings-goal tutorial;
- first statement archive collectible;
- budgeting questline;
- basic business protection tutorial;
- `Founding Ledger` archive skin.

### Season 2 — Industrial Expansion

- warehouse/project savings goals;
- industrial business protection visual theme;
- logistics cost report;
- virtual bond education chapter;
- industrial archive book.

### Season-end treatment

Loan contracts, savings balances, bond contracts and permanent archive items persist across season reset. Season-only cosmetics or tokens follow Season System Spec rules. No debt disappears merely because a season ends.

D-14/D-7/D-3/D-1 season messaging may highlight seasonal statement books, expiring cosmetic offers and next-season financial-learning content, but must not imply that users need to borrow or trade before time expires.

## 16. Ledger transaction types

Recommended semantic transaction types:

- `BANK_SAVINGS_TRANSFER`
- `BANK_INTEREST_SETTLEMENT`
- `LOAN_PRINCIPAL_DISBURSEMENT`
- `LOAN_ORIGINATION_FEE_SINK`
- `LOAN_REPAYMENT`
- `LOAN_RESTRUCTURE_FEE_SINK`
- `BOND_PURCHASE`
- `BOND_SERVICE_FEE_SINK`
- `BOND_MATURITY_SETTLEMENT`
- `BANK_REPORT_SERVICE_SINK`
- `VAULT_SERVICE_SINK`
- `BUSINESS_PROTECTION_FEE_SINK`
- `BUSINESS_PROTECTION_SETTLEMENT`
- `FINANCIAL_PRESTIGE_SINK`

A transaction type alone does not prove that currency was burned. Posting destinations determine accounting classification.

## 17. Recommended data model

### `bank_service_catalog`

- `service_code` PK;
- `service_type`;
- `price_mode`;
- `price_wld` nullable;
- `formula_config jsonb`;
- `duration_seconds` nullable;
- `repeatable` boolean;
- `active_from`, `active_until`;
- `policy_version`;
- `metadata jsonb`.

### `user_savings_goals`

- `id`;
- `user_id`;
- `name`;
- `target_amount`;
- `target_at` nullable;
- `linked_ledger_account_id`;
- `theme_code`;
- `status`;
- timestamps.

### `loan_contracts`

Must preserve immutable issued terms: principal, rate/fee values, maturity, policy version and issued-at state. Later policy updates create new contracts only.

### `loan_restructure_events`

- `id`;
- `loan_id`;
- `request_id` unique/idempotent;
- `old_terms_snapshot jsonb`;
- `new_terms_snapshot jsonb`;
- `fee_wld`;
- `reason_code`;
- `created_at`.

### `virtual_bond_contracts`

Stores policy/version, principal, exact settlement formula inputs/result, maturity and settlement IDs.

### `bank_service_purchases`

- `id`;
- `user_id`;
- `service_code`;
- `service_policy_version`;
- `quoted_price_wld`;
- `ledger_transaction_id`;
- `idempotency_key` unique per user/action domain;
- `result_payload jsonb`;
- timestamps.

### `business_protection_contracts`

Stores business ID, coverage config/version, effective window, fee transaction and settlement state.

## 18. API contracts

Suggested routes:

- `GET /api/bank/overview`
- `GET /api/bank/services`
- `POST /api/bank/services/:serviceCode/purchase`
- `GET /api/bank/savings-goals`
- `POST /api/bank/savings-goals`
- `POST /api/bank/savings-goals/:id/transfer`
- `GET /api/bank/loans/eligibility`
- `POST /api/bank/loans`
- `POST /api/bank/loans/:id/repay`
- `POST /api/bank/loans/:id/restructure`
- `GET /api/bank/bonds/catalog`
- `POST /api/bank/bonds/:productId/purchase`
- `POST /api/bank/business-protection/quote`
- `POST /api/bank/business-protection/contracts`

Every value-changing route requires authenticated actor, authoritative server quote/policy version, idempotency key and database-backed authorization/ledger settlement.

Responses must transport authoritative WLD values as integer-safe strings.

## 19. Admin console

Read views:

- total savings liabilities;
- interest faucet/treasury funding;
- outstanding loan principal;
- arrears/default/restructure cohorts;
- origination and restructuring fee burns;
- bond outstanding principal and maturity schedule;
- protection fees vs protection settlements;
- bank-service sink volume by service code;
- P50/P90/P99 user liquid/savings balances;
- top 1%/10% wealth concentration;
- net issuance contribution from banking.

Config views:

- activate/deactivate service catalog item;
- set price/formula and effective timestamp;
- loan eligibility/rate/fee policy version;
- bond product versions;
- hardship/restructure policy;
- protection product config.

High-risk mutations require the existing admin authorization, recent reauthentication/second factor where applicable, before/after preview, reason capture and append-only audit.

## 20. Analytics events and KPIs

Events:

- `bank_overview_viewed`
- `savings_goal_created`
- `savings_goal_funded`
- `savings_goal_completed`
- `loan_quote_viewed`
- `loan_issued`
- `loan_repayment_submitted`
- `loan_restructure_started`
- `loan_restructure_completed`
- `bond_product_viewed`
- `bond_purchased`
- `bank_service_purchased`
- `business_protection_quoted`
- `business_protection_purchased`
- `financial_archive_created`

Core KPIs:

- D7/D30 share using a savings goal;
- median savings-goal completion time;
- loan repayment on-time rate;
- arrears recovery rate;
- restructuring success rate;
- repeat borrowing after successful close;
- banking hard-sink WLD and share of all hard sinks;
- protection fee-to-settlement ratio;
- report/archive/vault purchase days per active user;
- high-wealth balance growth after prestige-sink exposure;
- complaint/error/duplicate-settlement rate.

Never optimize only for loan take-up or fees collected.

## 21. Abuse and integrity cases

Explicitly test:

- duplicate origination request;
- duplicate repayment request;
- duplicate interest settlement;
- stale quote/policy version;
- concurrent loan and repayment requests;
- negative/zero/overflow principal;
- forged client interest/rate/fee;
- maturity boundary replay;
- bond double settlement;
- protection contract purchased after known incident;
- repeated synthetic incident claims;
- savings transfer race leading to negative balance;
- report/service duplicate debit;
- privileged/admin direct ledger mutation attempt.

Normal users should not encounter arbitrary daily request limits; abusive automation may be rate-limited at the security layer.

## 22. Economy controls

Banking economy dashboard must separate:

`banking_hard_sinks`, `banking_transfers`, `banking_faucets`, `interest_issuance`, `loan_principal_outstanding`, `bond_liabilities`, `protection_fees`, `protection_settlements`.

Example review triggers, not automatic hard caps:

- interest issuance exceeds 5% of rolling 7-day total faucet volume;
- banking hard sinks fall below 2% of total sink volume for 30 days while banking usage is high;
- arrears recovery drops materially for two cohorts;
- protection settlements exceed collected fees by a configured risk threshold;
- loan-originated WLD contributes materially to abnormal net issuance.

Response should be policy review, simulation and config adjustment—not retroactive contract rewriting.

## 23. A/B experiments

Safe experiments:

- savings-goal onboarding placement;
- statement/archive presentation;
- repayment reminder timing;
- restructuring explanation format;
- prestige-vault discoverability;
- business protection explanation.

Do not A/B test hidden interest terms, undisclosed fees, more aggressive debt pressure, or competitive benefits.

## 24. Rollout plan

### P0

- savings goals/pockets;
- clear loan eligibility and repayment UX;
- banking service catalog for reports/themes/archive cosmetics;
- banking sink analytics;
- loan restructuring contract and recovery UX.

### P1

- vault/showcase services;
- virtual bond education/catalog improvements;
- business protection contracts;
- season financial archive integration.

### P2

- high-wealth treasury/archive prestige spaces;
- advanced historical finance reports;
- city education sponsorship and museum financial history projects.

## 25. Definition of Done

A banking feature is not complete until:

- UI states and accessibility are defined;
- authoritative server policy/quote exists;
- all WLD is integer/string safe;
- database actor/ownership authorization exists;
- ledger postings reconcile;
- faucet/transfer/sink classification is testable;
- idempotency is enforced for every value-changing request;
- concurrency tests cover double settlement/debit;
- historical contracts are immutable;
- analytics events exist;
- admin read/config/audit requirements are implemented where required;
- abuse cases and rate limits are tested;
- English-primary and Korean-parity docs are updated;
- exact candidate SHA passes CI and isolated Test backend/database/API verification before Production.

## 26. External design references reviewed

- TradingView demo/Paper Trading/Bar Replay patterns: learning and replay are separated from real-value risk, supporting Moneyverse's isolated simulation and reflection-first design.
- Microsoft PlayFab Economy patterns: catalog/store configuration and inventory transactions support separating durable item/service identity from operator-adjustable storefront pricing and policy.

These references are design inputs, not implementation dependencies.
