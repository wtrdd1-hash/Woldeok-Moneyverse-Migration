# Moneyverse Unified Macroeconomic System Design

> Version: v2026.10.01.496
> Status: DRAFT / written-spec user-review gate
> Design branch: `docs/unified-macroeconomy-v2026.10.01.496`
> Parent design: v2026.10.01.495 single treasury and social tax recirculation
> Base `origin/main`: `2bad12eb290cba6b98d08604cd6b1274243e1a4f`
> Research review: `docs/findings/MONEYVERSE_UNIFIED_MACROECONOMY_RESEARCH_REVIEW_v2026.10.01.496.md`
> Korean counterpart: [2026-10-01-unified-macroeconomic-system-design.ko.md](2026-10-01-unified-macroeconomic-system-design.ko.md)
> Scope: architecture/planning only. No runtime, DB, Test, or Production mutation is claimed.

## 1. Product objective

Moneyverse should behave as a coherent virtual economy, not a collection of unrelated reward faucets, hard sinks, tax rules and investment minigames.

The target loop is:

`work/production -> income -> consumption/saving/investment -> firm revenue -> wages/profit -> tax -> single treasury -> public services/support/procurement -> renewed private activity`

with a second financial loop:

`saving -> bank credit/capital markets -> household/firm investment -> repayment/dividend -> financial-sector income/loss -> renewed credit/investment`.

Success means:
1. every WLD stock and flow has an explainable economic source and destination;
2. collected tax never disappears as a currency burn;
3. government money actively recirculates through governed fiscal programs;
4. banks, firms, markets and property do not create unexplained WLD;
5. policy reacts to inflation, output, employment, credit and distribution together;
6. the economy remains understandable and enjoyable as a game rather than becoming a spreadsheet simulator.

## 2. Non-negotiable accounting invariants

1. The existing Economy Core append-only ledger remains the WLD mutation authority.
2. Every WLD-moving command is balanced, idempotent and attributable to a business event.
3. No application endpoint directly rewrites an authoritative balance.
4. Every economically material posting carries `source_sector`, `destination_sector`, `flow_class`, `economic_purpose`, `policy_version` and `business_event_id`.
5. No payment may use an unspecified “system” source.
6. No tax posting may target currency burn/sink.
7. Budget allocation and reserve designation never mint or move WLD.
8. Bank credit creation is represented with a matching bank asset/liability change; repayment reverses principal money creation according to the same contract.
9. Asset trades move WLD between holders; they do not create WLD merely because an asset price rises.
10. Item/resource destruction and WLD destruction are different economic events and are reported separately.
11. Historical ledger entries and applied migrations are immutable; corrections use compensating transactions/migrations.
12. Any unexplained money-supply delta is a P0 reconciliation failure.

## 3. Institutional sectors

Moneyverse adopts six economic sectors plus market infrastructure.

| Sector | Code | Economic role |
|---|---|---|
| Households / users | `HH` | labour, consumption, saving, borrowing, investment, tax, benefits |
| Non-financial firms | `NFC` | production, inventory, wages, sales, capital investment, borrowing, tax, dividends |
| Financial corporations / banks | `FIN` | deposits, credit, payment intermediation, loan loss absorption |
| General government | `GOV` | tax, single treasury, public jobs, procurement, welfare, infrastructure, grants, debt |
| Central monetary authority | `CMA` | monetary base, policy rate, emergency liquidity, macroprudential coordination |
| External / NPC sector | `ROW` | explicit imports/exports/NPC demand needed to bridge a small closed player economy |
| Market/clearing infrastructure | `FMI` | exchange, escrow, settlement and clearing; intermediary, not free value source |

Items/resources are real-side assets, not monetary sectors.

## 4. Stock-flow-consistent economic ledger

The economy maintains two related ledgers/read models:

- **WLD transaction ledger:** authoritative double-entry movement of WLD accounts.
- **Economic balance-sheet subledger/read model:** assets, liabilities and equity needed to explain bank loans, bonds, firm equity and institutional solvency.

Every material flow must change the corresponding stocks.

Examples:
- household wage: firm/government/external cash decreases, household liquid WLD increases;
- bank loan: bank loan asset increases and borrower transaction deposit increases;
- loan principal repayment: borrower deposit decreases and loan principal decreases;
- tax: household/firm private liquidity decreases and treasury liquidity increases;
- public benefit: treasury liquidity decreases and household liquidity increases;
- IPO: investor liquidity decreases, firm cash/equity increases, investor equity asset increases;
- secondary share trade: buyer liquidity decreases, seller liquidity increases, share ownership changes, no new WLD;
- dividend: firm cash/retained earnings decrease and shareholder liquidity increases.

A daily sector-flow table must reconcile `from-whom-to-whom` aggregates and explain every net sector position.

## 5. Money definitions

WLD remains one user-facing monetary unit. The macro layer distinguishes analytical forms without creating confusing user currencies.

- `WLD_BASE`: central settlement/base-money layer used by the financial/public system.
- `WLD_PRIVATE_M1`: liquid household and non-financial-firm transaction balances.
- `WLD_M2`: private M1 plus eligible savings/time-like balances, excluding internal double counting.
- `WLD_TREASURY`: government liquidity held in the single treasury; excluded from private spendable M1 but included in consolidated system accounting.
- `WLD_DORMANT`: subset of private balances inactive beyond policy threshold.
- `BANK_CREDIT_OUTSTANDING`: stock of bank-created loan principal.

Dashboards must not call transfers between these classifications “mint” or “burn” unless actual money creation/destruction occurs.
## 6. Central monetary authority

The central monetary authority is a virtual macro-policy institution, not a user wallet and not a real-world central bank claim.

### 6.1 Allowed functions
- publish a policy rate/reference rate;
- create or retire base WLD only through explicit versioned monetary-policy operations;
- provide bounded emergency liquidity to solvent financial institutions under collateral/recovery rules;
- set macroprudential credit-buffer policy;
- publish money-supply, inflation and financial-stability telemetry;
- run open-market-like liquidity operations if later approved.

### 6.2 Prohibited shortcuts
- no arbitrary per-user balance confiscation;
- no hidden tax-as-burn;
- no direct stock-price writes;
- no monetisation of every treasury shortfall;
- no permanent rescue of insolvent firms/banks without a resolution contract;
- no AI-direct mint/burn action.

### 6.3 Policy-rate transmission

The policy rate is a reference input for:
- new bank loan pricing;
- new savings/deposit products;
- new treasury-bond issuance;
- selected business-finance products.

It is not a global multiplier applied directly to job rewards, every store price or every tax rate.

Rate policy operates with lags. Existing fixed-term contracts preserve issued terms unless an explicitly user-beneficial or emergency legal/game migration is separately approved.

## 7. Commercial banking and credit creation

### 7.1 Product types

Every loan identifies funding mode:

1. `COMMERCIAL_BANK_CREDIT` — bank creates a transaction deposit and matching loan asset.
2. `TREASURY_LOAN` — treasury transfers existing WLD and records a receivable.
3. `EXTERNAL_CREDIT` — external/NPC lender transfers existing or explicitly external-sector WLD.
4. Any future product must map to one of these models before launch.

### 7.2 Commercial-bank credit accounting

At origination:
- bank loan asset + principal;
- borrower transaction deposit + principal;
- `BANK_CREDIT_OUTSTANDING` + principal.

At principal repayment:
- borrower transaction deposit - principal component;
- bank loan asset - principal component;
- `BANK_CREDIT_OUTSTANDING` - principal component.

Interest/fees:
- transfer from borrower to bank income;
- never confused with principal-money destruction;
- bank operating costs, loss provisions, taxes and dividends then determine retained earnings.

### 7.3 Bank solvency and liquidity

Banks maintain:
- equity/capital;
- liquid settlement resources;
- expected-credit-loss reserve/provision;
- credit concentration limits;
- arrears/default telemetry;
- countercyclical `CREDIT_BUFFER_STATE`.

Credit availability depends on capital/liquidity/risk, not an arbitrary daily loan count.

### 7.4 Default and resolution

A default does not silently erase the accounting identity.

Order:
1. use borrower collateral where contractually disclosed;
2. recognise bank credit loss/provision;
3. consume bank retained earnings/equity as applicable;
4. use industry-funded protection/default resources if designed;
5. only systemic last-resort support may use treasury/CMA backing, with explicit recovery terms and audit.

User-facing “deposit insurance” terminology is avoided unless clearly labelled game-only; no real guarantee is implied.

## 8. Household and labour economy

### 8.1 Household income sources
- firm wages/contract income;
- government public-job income and benefits;
- external/NPC export/service income;
- firm dividends;
- deposit/bond interest;
- asset-sale proceeds;
- transfers from other users.

Each source is reported separately.

### 8.2 Jobs must have an employer/funder

Current generic `FAUCET_JOB_REWARD` semantics are replaced over time by:
- `WAGE_PRIVATE`: firm-funded;
- `WAGE_PUBLIC`: treasury-funded;
- `INCOME_EXTERNAL_SERVICE`: external/NPC-funded;
- `MONETARY_DISTRIBUTION`: rare explicit monetary issuance program.

A job cannot mint WLD merely because the button was completed.

### 8.3 Labour-market stabilisation

Track:
- active labour participation;
- labour demand by profession;
- median/P10/P90 wage;
- underemployment/no-eligible-work rate;
- public-job share;
- real wage vs new-user/core CPI;
- profession shortages/oversupply.

When private demand falls, automatic stabilisers may temporarily expand treasury-funded public assignments and support. When private hiring recovers, those programs phase down.

No real-world employment relationship or guaranteed wage is implied.
## 9. Firms, production and insolvency

### 9.1 Firm balance sheet

Each material business can expose/read-model:
- cash;
- inventory;
- productive assets/capacity;
- receivables/payables if used;
- bank/treasury debt;
- equity;
- retained earnings.

### 9.2 Income statement

`operating_profit = revenue - COGS/input_cost - wages - logistics - maintenance - service_cost - finance_cost - depreciation_if_modelled`

`taxable_profit = max(0, operating_profit + policy_adjustments)`

`net_income = operating_profit - corporate_tax - extraordinary_losses`

Revenue source is tagged:
- `PLAYER_CONSUMPTION`;
- `B2B_SALES`;
- `GOV_PROCUREMENT`;
- `EXTERNAL_EXPORT`.

“System revenue” without one of these sources is invalid.

### 9.3 Investment and expansion

Expansion uses retained earnings, equity issuance, loans or grants.

Capital spending increases capacity/quality/logistics/product variety; it does not guarantee positive return. Demand, competition, input constraints and financing costs remain relevant.

### 9.4 Distress, restructuring and exit

State path:
`HEALTHY -> WATCH -> DISTRESSED -> RESTRUCTURING | LIQUIDATION -> EXITED`.

Viable but temporarily illiquid firms may restructure debt/operations. Persistent non-viable firms should not receive endless automatic subsidies.

On liquidation:
- remaining cash pays claims according to a deterministic virtual priority;
- tradable inventory/assets may be auctioned or returned to market;
- debt losses are recognised;
- historical equity/ledger/audit records remain.

Fraudulent abuse is handled separately from honest business failure.

## 10. Tax system

### 10.1 Constitutional tax rule

**Every amount classified as `TAX_*` is transferred 100% to `TREASURY_MAIN`. Tax is never a currency sink.**

A tax receipt records:
`tax_code, taxpayer_sector, taxable_event_id, base, deductions, rate/version, tax_amount, treasury_tx_id, reversal_link`.

### 10.2 Tax families

Policy candidates, all simulation-gated:
- personal/profession income tax with a protected zero/low-income band and progressive brackets;
- corporate profit tax on positive realised taxable profit, not gross revenue;
- consumption/sales tax on defined merchant transactions;
- property/land tax on an approved valuation base;
- capital-income tax on realised dividends/gains if used;
- marketplace/financial transaction levy only when separately justified by market design.

Normal person-to-person transfer defaults to 0%.

### 10.3 Avoid double-tax traps

Do not stack high transaction tax + full realised-gain tax + income tax on the same economic base without explicit incidence analysis.

For stocks, the preferred realistic design candidate is:
- low/zero ordinary transaction tax;
- realised capital-gain/dividend taxation where the cost-basis data is reliable;
- or a small turnover levy as a simpler alternative,
but not both at punitive rates.

### 10.4 Tax changes

Rates are effective-dated, prospective, bounded and slowly changing outside emergencies.

No retroactive tax on already-settled principal/refunds.

## 11. Single treasury and fiscal policy

### 11.1 One spendable government WLD account

`TREASURY_MAIN` is the single spendable government WLD authority. `VAULT_MAIN` may remain a compatibility alias during migration.

Welfare, infrastructure, emergency, citizen dividend, public works and market stabilisation are budget envelopes/commitments.

### 11.2 Treasury arithmetic

`available = ledger_balance - protected_reserve - committed - pending_obligations`

Initial v495 safety seed remains a simulation baseline:
`protected_reserve = max(30% of treasury, 14 days of essential spending)`.

This is a safety hypothesis, not a claim that 30% is economically optimal.

### 11.3 Spending priority
1. refunds/recovery and already-owed obligations;
2. essential public operations;
3. automatic stabilisers and hardship support;
4. productive public jobs/procurement/infrastructure;
5. new-user settlement support;
6. community matching grants;
7. market/item stabilisation;
8. citizen participation dividend/surplus distribution;
9. season/event discretionary budgets.

### 11.4 Tax recirculation

v495 `TRR_30D` remains an observability metric, but v496 changes its interpretation.

A fixed 60% spend target is **simulation seed, not hard fiscal law**. Forced spending can be inflationary or wasteful.

The controller instead observes:
- tax inflow;
- essential obligations;
- reserve;
- output/employment gap;
- inflation;
- public-project demand;
- age of uncommitted tax surplus.

Healthy surplus that remains neither reserved nor productively committed beyond the policy horizon raises an alert and triggers budget review.
## 12. Automatic fiscal stabilisers and public economy

### 12.1 Economic states

The macro system may classify a state using multiple signals:

`EXPANSION | OVERHEATING | SLOWDOWN | RECESSION | RECOVERY | DATA_INSUFFICIENT`.

No single metric changes the state.

Inputs include:
- real activity/output proxy;
- employment/underemployment;
- CPI/PPI;
- real wages/purchasing power;
- private credit growth/default;
- inventory turnover;
- firm profitability;
- private/public job share;
- money/velocity;
- treasury health.

### 12.2 Downturn response

Within pre-approved bounds:
- reduce effective burden for protected low-income cohorts;
- expand temporary public jobs;
- increase targeted hardship/new-user support;
- accelerate already-approved public procurement/infrastructure;
- release bank countercyclical buffer when financial stress warrants;
- avoid raising ordinary user fees merely to balance short-term revenue.

### 12.3 Overheating response

Within pre-approved bounds:
- phase down temporary transfers/public-job expansion;
- reduce monetary issuance;
- tighten new credit conditions/buffers where credit excess is evidenced;
- allow policy rates to rise inside approved ranges;
- delay non-essential stimulus;
- use high-wealth voluntary demand sinks/content before punitive universal charges.

Collected tax is still not burned.

### 12.4 Public-project effectiveness

Projects have:
- purpose;
- budget;
- target cohort/sector;
- expected economic channel;
- milestones;
- settlement evidence;
- post-program metrics;
- expiry/closeout.

Infrastructure may reduce logistics friction, increase capacity or unlock public services, but benefit must be bounded to avoid permanent compounding advantage.

## 13. Treasury bonds and public debt

Virtual treasury bonds become genuine government financing instruments rather than an unexplained fixed-yield faucet.

At purchase:
- investor liquid WLD decreases;
- treasury cash increases;
- investor bond asset increases;
- government bond liability increases.

At coupon/maturity:
- treasury pays from available cash according to issued contract;
- liability decreases at principal redemption;
- interest is fiscal expense and investor income.

If treasury cash is insufficient, options are sequenced:
1. use non-protected available treasury resources;
2. issue/refinance within approved debt limits;
3. reduce/defer discretionary spending;
4. emergency CMA support only under a separately approved crisis rule.

No hidden mint is used to honour routine bond yield.

Debt dashboard:
`debt_outstanding, debt_service_30d, weighted_cost, maturity_profile, debt_to_output_proxy, debt_service_to_revenue, refinancing_concentration`.

## 14. Goods, marketplace and item sinks

### 14.1 Marketplace principal

Buyer-to-seller WLD is a transfer. Asset/item ownership changes in the same atomic settlement.

### 14.2 Marketplace fees

Default v496 rule:
- tax component -> treasury;
- exchange/service fee -> exchange/public-market-service institutional revenue;
- explicit currency-retirement component -> allowed only if separately named, disclosed and policy-approved.

The legacy assumption “all system fees burn” is superseded.

### 14.3 Item stabilisation

When an item category is oversupplied:
- treasury/approved institution buys real listings from sellers;
- WLD is transferred to sellers;
- purchased items may be permanently removed.

Therefore the **item** is sunk while tax WLD recirculates.

Monitor item price, volume, depth, scarcity, substitution and distribution before/after intervention.

## 15. Equity, IPOs, dividends and corporate finance

### 15.1 Primary issuance / IPO

Investor WLD moves to firm cash/equity funding. Shares are issued to investors. No new WLD is created.

Current proportional-allocation IPO mechanics may be retained if settlement, refund and cap-table reconciliation are correct.

### 15.2 Secondary market

Trading is transfer-only before taxes/fees.

### 15.3 Dividends

Dividends require:
- realised/approved distributable earnings or retained earnings;
- sufficient firm cash;
- board/policy payout decision;
- tax treatment if enabled.

A “daily dividend” that has no firm cash/profit source is prohibited.

### 15.4 Buybacks

A firm buyback uses firm cash to acquire outstanding shares. It is not a currency sink; cash moves to selling shareholders.

### 15.5 Price formation

Reference/fundamental value may use bounded inputs:
- earnings/cash flow;
- book assets/equity;
- debt/leverage;
- growth/capacity;
- dividend policy;
- sector/common factor.

Order flow, liquidity, momentum/reversion and events then influence trade price inside bounded integrity controls.

No client, community popularity or unconstrained AI directly writes prices.

### 15.6 Stock-halt protection funding

The existing cost-basis halt-protection promise may remain only when its payer is explicit and funded. Halt settlement must draw from a pre-funded market protection fund, exchange/issuer guarantee arrangement, or separately authorised treasury backstop with recoverable terms. It may not mint unexplained WLD at the moment of a halt.

The protection fund records contributions, assets, liabilities, stress coverage and replenishment policy. If stress coverage is insufficient, new guarantee expansion is blocked until funding is restored; historical user claims already valid under issued terms remain protected according to the approved backstop contract.

## 16. Derivatives and leverage

Existing derivatives runtime/documentation is `AUTHORITY_DRIFT` until this design is integrated with a dedicated clearing specification.

If derivatives remain:
- contracts are zero-sum between participants before fees and default losses;
- initial margin and variation margin are held, not burned;
- mark price is deterministic and manipulation-resistant;
- positions have risk-based margin;
- liquidation transfers/realises losses according to a disclosed waterfall;
- exchange/default fund resources absorb losses before any public backstop;
- public/CMA support is systemic last resort, recoverable and audited;
- no rule automatically burns 50% of liquidated margin.

New leverage expansion remains blocked until real-DB stress, concurrency, stale-price and gap-risk tests pass.

## 17. Property and land economy

Primary public land sale:
`buyer -> treasury/public land agency`.

Secondary land sale:
`buyer -> seller`, with taxes/fees separately posted.

Rent:
`tenant -> owner`.

Property tax:
`owner -> TREASURY_MAIN`.

Maintenance:
`owner -> service provider/public service institution`.

No “property tax deflationary sink” remains.

Land/building value can respond to:
- location demand;
- productive/public infrastructure;
- occupancy/utilisation;
- local business activity;
- supply.

Property ownership must not become a guaranteed risk-free passive faucet.

## 18. External/NPC sector

A low-population virtual economy needs an explicit bridge when player-to-player demand is insufficient.

The external/NPC sector may:
- buy exported goods/services;
- sell imported inputs/items;
- offer bounded external contracts;
- provide baseline demand/liquidity.

Every external flow is tagged and budgeted.

`ROW_NET_INJECTION = WLD paid by external sector - WLD received by external sector`.

Large persistent net injection is treated as macro issuance pressure, not hidden “business revenue.”

NPC demand scales with population/activity/production conditions and cannot guarantee profit for every firm.

## 19. Price indices and purchasing power

Maintain at minimum:
- `CPI_CORE_BASKET`;
- `CPI_NEW_USER`;
- `CPI_HIGH_WEALTH`;
- `PPI_BUSINESS_INPUT`;
- `ASSET_PRICE_INDEX_STOCK`;
- `ASSET_PRICE_INDEX_PROPERTY`;
- `ITEM_CATEGORY_INDEX`.

Each index records:
- basket/version;
- weights;
- eligible clean trades;
- missing/stale-data handling;
- sample sufficiency;
- manipulation exclusions;
- nominal and real change.

Asset-price inflation is never silently substituted for consumer inflation.

## 20. Macro dashboard and national-account analogues

The admin economy dashboard shows sector-consistent measures.

### Real economy
- output/value-added proxy;
- household consumption;
- firm investment;
- government consumption/investment;
- net external demand;
- production and inventory turnover.

### Labour
- participation;
- private/public/external job share;
- median/P10/P90 wage;
- real wage;
- underemployment/no-work rate.

### Money and banking
- WLD private M1/M2;
- treasury liquidity;
- dormant/active balances;
- bank credit outstanding/growth;
- loan arrears/default;
- bank capital/liquidity buffers;
- velocity proxy.

### Fiscal
- tax by code;
- spending by envelope;
- fiscal balance;
- reserve;
- commitments;
- debt outstanding/service;
- TRR/aged surplus.

### Distribution
- P10/P50/P90/P99 liquid wealth;
- top 1%/10% share;
- income distribution;
- new-user purchasing power;
- benefit/tax incidence by cohort.

### Markets
- clean volume;
- spreads/depth;
- price indices;
- wash/manipulation exclusions;
- item production/destruction;
- asset concentration.

No one score replaces these components.
## 21. Macro policy controller

The AI economy controller remains advisory/bounded.

### 21.1 Deterministic authority
Hard limits and accounting identities are deterministic:
- no negative unauthorised balances;
- no unbalanced transaction;
- no tax burn;
- no budget overspend;
- no bank credit beyond hard solvency/liquidity constraints;
- no derivative settlement outside margin/default rules.

### 21.2 Model/AI role
AI/ABM/RL may:
- classify candidate macro regime;
- forecast scenarios;
- estimate elasticity/behaviour;
- propose bounded tax/rate/budget/credit settings;
- explain trade-offs;
- detect anomalies.

It may not directly:
- mint/retire WLD;
- alter user balances;
- set stock prices;
- change issued contracts;
- enable leverage;
- change tax law/policy outside approved parameter ranges.

### 21.3 Policy review bundle

Every macro proposal includes:
`data_window, sample_size, data_quality, current_state, proposed_change, affected_sectors, CPI_effect, output_effect, employment_effect, credit_effect, fiscal_effect, distribution_effect, abuse_risk, uncertainty, rollback_threshold, expiry_or_review_at`.

## 22. Anti-abuse and integrity economics

Economic realism fails if bots/multi-account abuse manufacture fake GDP, jobs, demand or credit.

Required controls:
- related-account graph signals;
- wash/circular-trade exclusion;
- self-dealing detection;
- bot-like work/production;
- loan farming;
- fake firm sales between controlled accounts;
- fabricated IPO demand;
- dividend self-churn;
- external/NPC contract farming;
- public-benefit multi-account farming;
- market manipulation and stale-price exploitation.

Suspected abuse flows remain in the ledger but are excluded/tagged in clean macro indices rather than erased.

## 23. User-facing simplicity

The back end can be macroeconomically rich while the user experience remains simple.

User surfaces emphasize:
- where money came from;
- where it went;
- tax amount and public destination;
- loan total cost and source type;
- business profit/loss;
- portfolio risk/dividend source;
- public economy summary;
- clear “game-only / simulated” wording.

Do not require ordinary users to understand M1/M2, bank capital or national accounts to play.

## 24. Transparency

Public aggregate “World Economy” dashboard may show:
- total private money trend;
- inflation/core-basket trend;
- median real wage;
- employment/public-job trend;
- tax collected and public spending;
- treasury reserve/debt;
- business output;
- market/item supply;
- broad wealth-distribution bands.

Sensitive anti-abuse, account-level banking and operator controls remain private.

The dashboard does not claim a specific taxpayer’s WLD coin funded a specific recipient; fiscal funds are fungible.

## 25. Existing-document authority disposition

| Existing direction | v496 disposition |
|---|---|
| v495 one treasury / 100% tax conservation | **KEEP + EXPAND** |
| Project Plan historical 50% market-tax burn | **SUPERSEDE** |
| Admin treasury 100% treasury tax share | **KEEP + EXPAND** |
| “system receives fee = hard sink” as universal rule | **SUPERSEDE** |
| bank loan principal = generic faucet | **SUPERSEDE** |
| bank-credit safety/idempotency | **KEEP + EXPAND** |
| job reward = generic faucet | **MIGRATE TO FUNDER MODEL** |
| business system revenue = generic faucet | **MIGRATE TO DEMAND-SECTOR MODEL** |
| property tax / land purchase burn | **SUPERSEDE** |
| corporate revenue hard burn | **SUPERSEDE** |
| club tax direct private-vault routing | **SUPERSEDE; treasury then grant if justified** |
| IPO/equity | **KEEP, link to firm accounting** |
| unsupported synthetic dividends | **SUPERSEDE** |
| 10x derivative 50% liquidation burn | **SUPERSEDE + AUTHORITY_DRIFT/BLOCK expansion** |
| casino economic flows after decommissioning | **SUPERSEDED unless re-authorised** |
| append-only ledger/idempotency | **KEEP** |
| economy scenario lab / bounded AI | **KEEP + EXPAND** |
## 26. Migration architecture principles for later implementation

This written spec does not implement the migration. Later planning must use zero-downtime expand/backfill/switch/contract.

Principles:
1. preserve applied migrations and financial history;
2. add sector/flow metadata without breaking old readers;
3. shadow-compute macro accounts before changing money behaviour;
4. reconcile all existing faucet/sink classes to new source/funder semantics;
5. route every tax to central treasury before enabling fiscal automation;
6. convert physical purpose vaults into logical budget commitments;
7. make institutional revenues explicit before retiring legacy hard-sink assumptions;
8. introduce bank-credit balance-sheet accounting behind feature flags/shadow mode;
9. migrate firm/IPO/dividend accounting before changing payouts;
10. keep derivatives expansion blocked until clearing contract exists;
11. preserve compatibility adapters during rolling zero-downtime deployment;
12. require exact zero unexplained WLD delta at every monetary migration boundary.

## 27. Simulation scenarios required before numeric policy adoption

At minimum:
- rapid new-user growth;
- stagnant population with wealthy incumbents;
- high job issuance and weak consumption;
- demand boom with constrained production;
- private-firm recession;
- external/NPC demand shock;
- returning dormant wealthy cohort;
- bank credit boom;
- bank default/arrears shock;
- firm bankruptcy wave;
- property/asset bubble;
- market/item oversupply;
- treasury surplus accumulation;
- treasury revenue collapse;
- bond refinancing stress;
- derivatives gap/default stress if feature retained;
- bot/multi-account fake-demand shock;
- combined inflation + inequality shock;
- deflation/liquidity-hoarding shock.

Compare at least:
`do_nothing`, `fiscal_response`, `monetary_response`, `credit_response`, `mixed_response`.

## 28. P0 acceptance gates for the future system

1. 100% of `TAX_*` reaches `TREASURY_MAIN` net of explicit reversal.
2. Every WLD creation event is classified as CMA issuance, bank-credit creation or external-sector injection.
3. Every WLD retirement event is explicit and never hidden inside tax.
4. Internal transfers never change consolidated money supply.
5. Bank loan origination/repayment reconcile loan assets and deposit-money change exactly.
6. Treasury cannot spend more than available funds plus separately authorised financing.
7. Bonds reconcile investor assets to government liabilities and treasury cash.
8. Firm dividends cannot exceed approved distributable source/cash constraints.
9. IPO/secondary trades do not mint WLD.
10. Property transactions/tax do not silently burn WLD.
11. Marketplace item sinks remove items without pretending seller-paid WLD was destroyed.
12. Sector from-whom-to-whom totals reconcile daily.
13. CPI/PPI/asset indices exclude flagged manipulation and expose data quality.
14. Automatic stabilisers have bounds, expiry/review and rollback.
15. Bank/market/derivative failures fail closed without double settlement or unexplained public bailout.
16. AI cannot bypass deterministic policy or ledger constraints.
17. Real-DB concurrency/replay tests prove all monetary invariants.
18. Test/Production promotion requires exact-SHA evidence and zero-downtime rollback.

## 29. Design outcome

v496 converts Moneyverse from feature-local money mechanics into a coherent virtual macroeconomy:

`production + labour + firms + households + banks + capital markets + taxation + treasury + public spending + external sector`

all reconcile through one economic accounting model.

v495’s core user requirement is preserved and strengthened: **tax does not disappear**. Tax becomes public liquidity, and public liquidity returns to society through explicit, auditable fiscal channels.

At the same time, inflation is no longer controlled mainly by destroying tax revenue. Money stability comes from explicit issuance policy, bank-credit discipline, productive supply, fiscal timing, interest/credit transmission, external-sector control, targeted item/resource sinks, and transparent last-resort monetary retirement where separately justified.

## 30. Next gate

After user review/approval of this written design:
1. write a new v496 authority-integration implementation plan;
2. supersede the earlier v495-only authority-integration plan where v496 broadens it;
3. integrate v496 into the canonical planning hierarchy and all affected detailed economy specs;
4. only then write the separate runtime/database implementation plan.

No runtime implementation begins from conversational approval alone.
