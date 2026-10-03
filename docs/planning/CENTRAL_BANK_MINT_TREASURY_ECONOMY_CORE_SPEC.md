# Moneyverse Central Bank, Mint, Treasury & Economy Core Specification

> Version: v2026.10.04.523
> Status: AUTHORITATIVE PLANNING / implementation contract
> Date: 2026-10-04
> Canonical language: English
> Korean counterpart: [CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.ko.md](CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.ko.md)
> Parent authority: [PROJECT_PLAN.md](PROJECT_PLAN.md)
> Runtime claim: none. This cycle changes planning/documentation only.

## 1. Decision

Moneyverse SHALL separate four institutional responsibilities that were previously partially conflated:

1. **Moneyverse Central Bank (MCB)** — monetary-policy authority.
2. **Moneyverse Mint Bureau (MMB)** — execution-only currency issuance and retirement service.
3. **Central Treasury (CT)** — fiscal cash, tax, budget and expenditure authority.
4. **Economy Core & Settlement Ledger (ECSL)** — transaction, double-entry, reconciliation and invariant authority.

The product may present them as related public institutions, but code, permissions, APIs, ledgers and audit trails must preserve these boundaries.

Primary invariant:

`change in Total WLD Supply = Authorized Minted WLD - Authorized Retired/Burned WLD`

Taxes, transfers, treasury spending, budget allocation, deposits, withdrawals, market trades and internal vault movement MUST NOT change total WLD supply.

## 2. Reference-derived design principle

IMF public-finance guidance separates treasury cash management from monetary policy while requiring explicit coordination. A Treasury Single Account consolidates government cash without turning treasury spending into currency creation. ECB and US arrangements also show that issuing authority can be institutionally separated from physical production. Moneyverse adopts this separation pattern, not the legal form of any single jurisdiction.

For a game economy, this additionally prevents tax-funded payouts, admin corrections, loans, event rewards and genuine new-money issuance from collapsing into the same generic balance increment.

## 3. Institution map

| Institution | Owns | Can do | Cannot do |
|---|---|---|---|
| **Central Bank** | monetary-policy registry, issuance envelopes, supply targets, emergency monetary decisions | approve issuance/retirement envelopes; set bounded monetary policy; order Mint execution | spend treasury tax revenue; directly edit player balances; raw DB balance updates |
| **Mint Bureau** | mint/retire execution queue, issuance certificates, retirement certificates | execute a valid signed/authorized order exactly once | invent policy; decide recipients; collect tax; spend budgets; issue without order |
| **Central Treasury** | tax/fee revenue, fiscal vaults, budgets, grants, refunds, public spending | collect existing WLD; reserve/commit budget; transfer existing WLD | create WLD; classify transfer as mint; disguise burn as treasury expense |
| **Economy Core / Settlement Ledger** | double-entry postings, balances/projections, idempotency, reconciliation, supply aggregates | settle transfers; enforce invariants; derive money-supply views | define monetary/fiscal policy by itself |
| **AI Economy Controller** | diagnosis, simulation, bounded recommendations | recommend or auto-tune allowlisted low-risk parameters | directly mint/retire WLD, spend treasury, change constitutional limits or bypass approval gates |

## 4. Central Bank contract

The Central Bank owns:
- target ranges for money-supply growth, net issuance and circulation health;
- issuance envelopes by source such as `WORK_REWARD`, `QUEST_REWARD`, `EVENT_REWARD`, `INCIDENT_COMPENSATION` and approved stabilization;
- retirement policy classes;
- monetary-state telemetry and public monetary reports;
- emergency pause/freeze of new issuance;
- policy versioning and approval lineage.

Required telemetry includes:
- `M_total`: all outstanding WLD not retired;
- `M_circulating`: active player/business spendable balances;
- `M_treasury`: WLD owned by Central Treasury;
- `M_bank_liquidity`: pre-funded WLD in banking/lending pools;
- `M_locked`: escrow, pending settlement and time-locked balances;
- `M_dormant`: dormant-account balances;
- gross mint and retirement by source;
- net issuance;
- velocity proxy;
- price indices where depth is sufficient;
- P50/P90/P95/P99 liquid balance;
- top 1%/10% concentration;
- treasury flows shown separately from supply creation.

No single faucet/sink ratio is sufficient to authorize monetary action.

### 4.1 Monetary Policy Order

Every mint/retire authority is represented by a versioned order containing:
- stable `monetary_order_id`;
- policy version/hash;
- action `MINT | RETIRE | FREEZE | UNFREEZE`;
- maximum amount;
- permitted source/reason code;
- validity window;
- actor/quorum;
- simulation/evidence snapshot;
- idempotency scope;
- rollback/compensation semantics;
- authorization evidence.

An order authorizes a ceiling, not a requirement to use the full amount.

## 5. Mint Bureau contract

The Mint Bureau is a high-integrity executor, not a policy engine.

### 5.1 Mint execution

A mint may occur only when:
1. a valid Central Bank order exists;
2. the order is active and unexhausted;
3. the business event is valid and idempotent;
4. Economy Core reconciliation is healthy;
5. no issuance freeze is active;
6. amount/source/recipient match the order;
7. execution is committed atomically with ledger evidence.

The Mint emits `mint_certificate_id` and increments cumulative minted supply exactly once.

### 5.2 Retirement / hard burn

A hard sink becomes a supply reduction only when:
- spendable WLD is debited;
- canonical retirement posting is committed;
- `retirement_certificate_id` is created;
- `M_total` decreases by exactly the retired amount.

Moving WLD to a treasury vault or a "dead-looking" spendable account is NOT sufficient.

### 5.3 Mint prohibitions

The Mint SHALL NOT select tax rates, welfare recipients, event reward sizes, loan rates or emergency liquidity policy. It accepts no public/client mint call and no raw administrator amount without an eligible monetary order.

## 6. Central Treasury contract

### 6.1 Treasury Single-Account pattern

Central Treasury uses one consolidated fiscal cash authority with purpose sub-ledgers/envelopes. Physical DB accounts may remain separated for safety, but the product must expose a consolidated treasury position.

Recommended logical views:
- `TREASURY_MAIN`
- `TREASURY_WELFARE`
- `TREASURY_INFRA`
- `TREASURY_EMERGENCY`
- `TREASURY_COMMITTED`
- `TREASURY_AVAILABLE`

Purpose sub-ledgers are accounting controls, not separate money supplies.

### 6.2 Treasury inflows

Marketplace/stock/business/consumption taxes, administrative fees, public-service fees and approved bond-related receipts are transfers of existing WLD unless a separate Central Bank mint order explicitly says otherwise.

### 6.3 Treasury outflows

Refunds, incident recovery, citizen dividend, welfare/new-user support, fiscal market stabilization, community projects, subsidies, event/season budgets and audited corrections are transfers of existing WLD.

Treasury expenditure must satisfy:
- `treasury_before - treasury_after = settled_outflow`
- `change in M_total = 0`

If the same business process contains a separately authorized mint/retire leg, only that leg changes supply.

### 6.4 Reserve terminology

Existing `VAULT_RESERVE` and protected-reserve concepts are reclassified as **fiscal liquidity reserves**, not central-bank issuance reserves. They protect spending capacity and do not authorize new WLD issuance.

## 7. Debt, bonds and bank lending

### 7.1 Treasury bonds

A Treasury bond is a fiscal liability, not newly minted WLD.
- purchase: investor WLD -> Treasury;
- maturity/coupon: Treasury WLD -> investor;
- total WLD supply unchanged.

If Treasury lacks funds at maturity, use the defined fiscal stress/default/restructuring path or a separately approved monetary intervention. Silent minting is prohibited.

### 7.2 Virtual bank lending

Initial Moneyverse policy keeps bank lending **fully funded from existing WLD liquidity pools**. Loan disbursement transfers existing WLD; repayment transfers existing WLD; interest reallocates existing WLD.

Commercial-bank deposit-money creation is intentionally excluded from the initial architecture because it would require a distinct reserve/capital/insolvency/money-aggregate/resolution model. A future deposit-money layer needs a new approved specification.

## 8. Canonical flow classification

| Event | From | To | Supply effect | Authority |
|---|---|---|---:|---|
| newly issued job/quest reward | Mint issuance account | player | + | Central Bank order + Mint |
| player transfer | player A | player B | 0 | Economy Core |
| market tax | player/business | Treasury | 0 | Treasury tax policy |
| citizen dividend from tax revenue | Treasury | player | 0 | Treasury budget |
| public project | Treasury | project/escrow | 0 | Treasury budget |
| hard sink | player/system pool | retired supply | - | retirement rule + Mint |
| bank loan, initial model | funded bank pool | borrower | 0 | Banking policy |
| loan repayment | borrower | bank pool | 0 | Banking policy |
| treasury bond purchase | investor | Treasury | 0 | Treasury/debt policy |
| emergency monetary injection | Mint issuance account | stabilization pool | + | high-risk Central Bank order |
| mistaken admin balance edit | n/a | n/a | forbidden | blocked |

## 9. Supply accounting and reconciliation

Required independent identities:

`M_total = M_players + M_businesses + M_treasury + M_bank_liquidity + M_locked + M_other_valid_system_balances`

`M_total(t) = M_total(t-1) + Minted(t) - Retired(t)`

`TreasuryBalance(t) = TreasuryBalance(t-1) + FiscalInflows(t) - FiscalOutflows(t)`

A treasury deficit/surplus must not be corrected by changing `M_total`.

Every reconciliation run records source-ledger high-water mark, policy versions, mint/retire certificate ranges, treasury aggregate, account projection aggregate, variance and repair state. Any unexplained supply variance is P0 and disables automatic issuance and large fiscal automation.

## 10. Permission and API boundary

Suggested server-only commands:
- `centralBank.previewPolicyOrder`
- `centralBank.proposePolicyOrder`
- `centralBank.approvePolicyOrder`
- `centralBank.freezeIssuance`
- `mint.executeAuthorizedOrder`
- `mint.retireAuthorizedAmount`
- `treasury.previewBudget`
- `treasury.commitBudget`
- `treasury.executeDisbursement`
- `economy.reconcileSupply`
- `economy.reconcileTreasury`

No public/mobile client receives mint authority. Admin UI calls policy-level endpoints, never raw balance mutation. High-risk operations require step-up authentication, dual/quorum approval where configured, idempotency, reason, request hash and immutable audit.

## 11. AI Economy Controller boundary

AI may diagnose inflation/deflation/liquidity anomalies, forecast scenarios, recommend issuance-envelope changes and recommend fiscal-policy changes. It may auto-tune only existing low-risk allowlisted parameters already permitted by `AI_ECONOMY_CONTROLLER_SPEC`.

AI may NOT:
- create or approve a monetary order;
- execute Mint directly;
- use Treasury balance as permission to issue currency;
- convert a fiscal shortfall into automatic minting;
- alter supply invariants;
- delete/rewrite audit evidence.

Initial `BOUNDED_AUTO` excludes direct WLD issuance/retirement and constitutional fiscal-reserve changes.

## 12. Admin and public transparency

### `/admin/economy/monetary`
Show total/circulating/dormant/locked/treasury WLD, gross mint, gross retirement, net issuance, active policy orders and remaining envelope, certificates, inflation/velocity/concentration signals, reconciliation state and issuance-freeze state.

### `/admin/treasury`
Show fiscal data only: consolidated treasury cash, fiscal reserves, taxes/fees, commitments, expenditures, fiscal runway and treasury reconciliation.

### Public economy transparency
A read-only public page may show total supply, 30d minted/retired, treasury balance, 30d tax revenue/public spending and major policy version, with clear "virtual game economy" labeling. Security-sensitive thresholds and controls remain private.

## 13. Migration from current terminology

1. Preserve existing treasury transaction history.
2. Map Treasury reserve vaults to fiscal-reserve semantics.
3. Classify every balance-increase path as transfer of existing WLD, treasury-funded transfer, true issuance, or correction/reversal.
4. Replace ambiguous `INJECTION` with `MONETARY_MINT`, `TREASURY_TRANSFER`, `REVERSAL` or `CORRECTION`.
5. Prove every "burn" reaches canonical retirement rather than a spendable system account.
6. Keep historical transaction-type aliases readable; never rewrite ledger history.
7. Use compatibility views until exact-SHA Test reconciliation succeeds.

## 14. Release and QA gates

P0 acceptance requires:
- every WLD increase path classified;
- every true issuance has one valid monetary order and one mint certificate;
- every retirement has one retirement certificate;
- tax/treasury transfers prove supply change = 0;
- duplicate/replay/concurrency tests prove exactly-once economic result;
- treasury and money-supply reconciliation independently equal zero variance;
- unauthorized Mint calls fail closed;
- AI cannot reach Mint execution;
- ambiguous legacy injection endpoints are removed or fail closed;
- restart/retry does not duplicate mint or disbursement;
- exact candidate SHA, DB schema, policy versions and evidence bundle are recorded.

Production promotion follows the repository zero-downtime procedure only after isolated Test backend/API/DB verification. This v523 planning cycle itself performs no deployment.

## 15. Reference basis

Primary and first-party references reviewed for v523:

1. IMF, *Government Cash Management: Relationship between the Treasury and the Central Bank*  
   https://www.imf.org/en/Publications/TNM/Issues/2016/12/31/Government-Cash-Management-Relationship-between-the-Treasury-and-the-Central-Bank-40111
2. IMF, *Treasury Single Account: Concept, Design and Implementation Issues*  
   https://www.imf.org/en/Publications/WP/Issues/2016/12/31/Treasury-Single-Account-Concept-Design-and-Implementation-Issues-23927
3. ECB, *Issuance and circulation*  
   https://www.ecb.europa.eu/euro/cash_strategy/issuance/html/index.en.html
4. ECB, *Banknotes and coins production*  
   https://www.ecb.europa.eu/stats/policy_and_exchange_rates/banknotes+coins/production/html/index.en.html
5. US Federal Reserve, *2026 Federal Reserve Note Print Order*  
   https://www.federalreserve.gov/paymentsystems/2026_currency_print_order.htm
6. US Federal Reserve, *Currency and Coin Services*  
   https://www.federalreserve.gov/paymentsystems/coin_about.htm
7. US Mint, *Coin Production*  
   https://www.usmint.gov/learn/production-process/coin-production
8. Bank of Korea, currency issuance/circulation materials  
   https://www.bok.or.kr/eng/main/contents.do?menuNo=400119
9. Bank of England, *Money creation in the modern economy*  
   https://www.bankofengland.co.uk/quarterly-bulletin/2014/q1/money-creation-in-the-modern-economy
10. EVE Online Economic Council, *Monthly Economic Report — May 2026*  
    https://www.eveonline.com/news/view/monthly-economic-report-may-2026
11. EVE Online Economic Council, *Monthly Economic Report — July 2026*  
    https://www.eveonline.com/news/view/monthly-economic-report-july-2026
12. EVE Online Economic Council, *Monthly Economic Report — August 2026*  
    https://www.eveonline.com/news/view/monthly-economic-report-august-2026

These references motivate architecture and observability. They do not substitute for Moneyverse-specific replay, telemetry, Test validation or product judgment.
