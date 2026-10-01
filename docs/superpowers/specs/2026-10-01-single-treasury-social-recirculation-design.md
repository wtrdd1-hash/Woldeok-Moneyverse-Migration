# Single Treasury and Social Tax Recirculation Design

> Version: v2026.10.01.495
> Status: DRAFT / user-review gate
> Design branch: `docs/treasury-circulation-v2026.10.01.495`
> Design base: `origin/main@2bad12eb290cba6b98d08604cd6b1274243e1a4f`
> Korean counterpart: [2026-10-01-single-treasury-social-recirculation-design.ko.md](2026-10-01-single-treasury-social-recirculation-design.ko.md)
> Scope: planning/design only. No runtime, database, Test, or Production mutation is claimed.

## 1. Goal

Moneyverse must operate a closed fiscal circulation loop instead of collecting tax into fragmented vaults or destroying tax revenue.

**Core loop:** member/business activity → taxable event → one central treasury → protected budget commitments → public spending → members/businesses/community → renewed activity.

The design has two non-negotiable user requirements:
1. collected tax must never disappear through burn/sink semantics; and
2. treasury money must actively support the virtual society instead of accumulating indefinitely.

## 2. Fiscal invariants

1. There is exactly one spendable WLD treasury account: `TREASURY_MAIN` (runtime compatibility may keep the display alias `VAULT_MAIN`).
2. Every `TAX_*` amount is transferred 100% into the central treasury. A tax posting may not target BURN or SINK.
3. Welfare, infrastructure, emergency reserve, dividends, market stabilization, seasons and similar purposes are logical budget envelopes, not separate cash accounts.
4. Budget allocation reserves money; it does not move or mint WLD.
5. Every treasury inflow and outflow uses the canonical double-entry Economy Core path. Direct balance overwrite is prohibited.
6. Treasury-held WLD remains part of money supply until an independently defined non-tax sink removes currency.
7. Reversal/correction is append-only through compensating transactions.
## 3. Tax must not be a sink

All existing and future tax policies must use the following classification.

| Fiscal charge | Destination | Rule |
|---|---|---|
| `TAX_*` | `TREASURY_MAIN` | 100% treasury inflow |
| `FEE_*_TREASURY` | `TREASURY_MAIN` | recirculating fee |
| `FEE_*_SINK` | canonical sink account | explicit non-tax hard sink |
| `BURN_*` | canonical burn/sink path | explicit destruction, never described as tax |

This design explicitly supersedes the current planning/runtime direction that burns part of marketplace tax or automatically burns a fixed percentage of general tax revenue.

If a deflationary currency sink is still economically necessary, it must be created as a separately named and disclosed fee/sink policy. It cannot be hidden inside a tax percentage.

A charge currently named “property tax” but implemented as 100% destruction must be reconciled in one of two ways before authority integration:
- make it a true tax and route 100% to `TREASURY_MAIN`; or
- keep hard-sink behavior but rename/reclassify it as a non-tax maintenance/holding fee.

## 4. One account, many budget envelopes

The central treasury exposes these accounting values without creating additional money accounts:
- `ledger_balance`: authoritative central treasury balance from Economy Core;
- `protected_reserve`: non-spendable logical reservation;
- `committed`: approved but not yet settled public expenditure;
- `pending_obligations`: refunds/recovery already owed;
- `available = ledger_balance - protected_reserve - committed - pending_obligations`.

Initial envelope families:
`ESSENTIAL_REFUND`, `WELFARE_SUPPORT`, `NEW_USER_SUPPORT`, `PUBLIC_WORK`, `COMMUNITY_INFRA`, `CITIZEN_DIVIDEND`, `MARKET_STABILIZATION`, `SEASON_EVENT`, `INCIDENT_RESPONSE`, and `ADMIN_CORRECTION`.

Earmarked taxes may constrain which envelope receives an accounting commitment, but money still enters the same physical treasury account.
## 5. Protected reserve

The protected reserve is a policy calculation inside the central treasury, not a separate vault.

Planning baseline:
`protected_reserve = max(30% of TREASURY_MAIN, 14 days of essential-spend requirement)`.

The 30% percentage is a planning floor carried forward from the recent fiscal design; the 14-day requirement preserves the earlier treasury-management reserve model. Final values remain policy-versioned and simulation-gated.

Reserve health:
- NORMAL: reserve floor satisfied and reconciliation healthy;
- WARNING: approaching the reserve floor;
- CRITICAL: reserve coverage below the approved critical threshold;
- EMERGENCY: optional expenditure is suspended while refunds/recovery remain protected.

Reserved WLD is not burned or removed from supply. It simply cannot be spent while the reservation is active.

## 6. Social circulation engine

Tax collection alone is not a successful fiscal system. The system therefore maintains a **Tax Recirculation Ratio (TRR)**:

`TRR_30D = tax-funded treasury outflow over 30d / net tax inflow over 30d`.

If net tax inflow for the window is zero, TRR is reported as `N/A`, never as zero or infinity. Spending financed from tax surplus accumulated before the window is reported separately as `prior-surplus-funded outflow` so the dashboard does not mislabel historical reserves as current-period tax recycling.

Planning target when reserve/reconciliation/economy health are NORMAL:
- target band: 50–80%;
- initial simulation target: 60%;
- tax money older than the configured circulation horizon creates an operator alert when it is neither protected reserve nor committed expenditure.

The target is not a guarantee that 60% is spent regardless of conditions. Reserve stress, reconciliation failure, abuse signals, extreme inflation, or insufficient eligible public programs may reduce or pause optional spending.

The policy controller may change the target only within an approved band, with versioned reason, simulation evidence, audit history and rollback.
## 7. Public spending channels

### 7.1 Essential refunds and recovery
Highest priority. Refunds, incident recovery and legally/operationally owed corrections settle before discretionary programs.

### 7.2 Welfare and new-user stabilization
Treasury-funded support for low-net-worth or newly established members. Eligibility must use account-age, activity and anti-smurf signals; creating multiple accounts must not increase total household-like benefit.

### 7.3 Public jobs and service contracts
The treasury funds useful repeatable work rather than relying only on faucet rewards. Examples include public quests, community maintenance tasks, event support, moderation-assistance tasks where appropriate, and city/public-project contribution rewards.

A treasury-funded job payout is a transfer from existing treasury WLD, not a faucet.

### 7.4 Community and infrastructure projects
Community proposals may receive matching grants or milestone-based funding. Funds are committed first and settled only when milestone/recipient conditions are satisfied.

### 7.5 Citizen participation dividend
A bounded periodic dividend may return fiscal surplus to recently active eligible members. Eligibility, anti-bot controls, per-period caps and reserve checks are mandatory.

### 7.6 Market stabilization / item buyback
Treasury may buy excess marketplace items from real sellers and permanently remove the **items**. WLD is paid to sellers and therefore re-enters circulation; tax money itself is not burned.

### 7.7 Season and event budgets
Time-bounded public budgets may fund non-P2W events, community challenges and participation rewards. Unused commitments expire back into available treasury balance.
## 8. Automated fiscal cycle

1. Tax settlement posts the tax leg to `TREASURY_MAIN` in the same atomic transaction as the taxable event.
2. Tax receipts record tax code, taxable event, base, rate, amount, policy version, transaction ID and reversal linkage.
3. A fiscal scheduler reads rolling revenue, reserve health, outstanding obligations, economic health and eligible program demand.
4. It proposes/creates budget commitments only up to `available`.
5. High-risk or unusually large commitments require operator/four-eyes approval; routine bounded programs may auto-commit.
6. Program settlement transfers WLD from `TREASURY_MAIN` through Economy Core to the final beneficiary.
7. Reconciliation verifies central treasury ledger balance, tax receipts, commitments, settled outflows and reversals.
8. Reconciliation failure disables new automatic discretionary commitments and large payouts.

No step updates member cash or treasury balance directly.

## 9. Economy safety

Social circulation must not create an inflation faucet. Required guardrails:
- public spending is limited by existing treasury balance and available funds;
- tax-funded payouts never use policy minting as an implicit fallback;
- optional spending shrinks when reserve health deteriorates;
- rapid inflation/velocity spikes can lower the recirculation target without destroying already collected tax;
- concentration and benefit-distribution metrics prevent repeated capture by a small set of accounts;
- per-user/per-business rolling payout caps apply to automated programs;
- related-account, bot, collusion and self-dealing signals can block eligibility;
- administrator manual disbursement requires actor, reason, step-up authentication, idempotency and immutable audit.

Non-tax faucets may continue under their own explicit economy policy, but they are accounted separately from tax-funded fiscal spending.
## 10. Data and ledger model

The canonical money source of truth remains the Economy Core ledger.

Recommended fiscal metadata/read models:
- `treasury_tax_receipts`: tax provenance and policy snapshot;
- `treasury_budget_envelopes`: logical purpose and policy limits;
- `treasury_budget_commitments`: reserved amounts and settlement state;
- `treasury_disbursement_batches`: grouped public-spending execution evidence;
- `treasury_reconciliations`: balance/receipt/commitment/outflow proofs;
- `treasury_policy_versions`: effective-dated rates, reserve rules and TRR target;
- `treasury_alerts`: reserve, stale-tax, reconciliation and abuse alerts.

If `system_treasury_vaults` remains for compatibility, its central balance must become a derived/read model projection rather than an independent mutable source of truth.

Purpose-specific legacy vaults must not remain independently spendable after migration.

## 11. Tax-to-spend transparency

Member receipts show the exact tax charged on each transaction.

The public fiscal dashboard shows aggregate period attribution:
- tax collected by tax code;
- treasury opening/closing balance;
- protected reserve and committed amount;
- public spending by envelope;
- TRR and aged-uncommitted tax;
- reversals/corrections;
- item-sink purchases separately from currency sinks.

The UI must not falsely claim that an individual WLD coin can be traced from one taxpayer to one beneficiary. Tax revenue is fungible; attribution is period/envelope accounting.
## 12. Superseded planning directions

On authority integration, explicitly supersede these conflicting directions rather than deleting history:
- marketplace tax “50% burn / 50% treasury”;
- general-tax automatic “10% burn” allocation;
- welfare/infrastructure/emergency purpose vaults as separate spendable cash accounts;
- tax paths that bypass the central treasury directly into a purpose vault;
- direct mutation of user `cash_balance` or treasury vault balance for fiscal payouts.

Historical migrations and release evidence remain immutable history.

## 13. Migration direction for later implementation

Do not edit applied numbered migrations.

A future implementation uses the next contiguous migration number resolved from the then-current main and:
1. creates/identifies the canonical central treasury Economy Core account;
2. stops new writes to purpose-specific vault balances;
3. records legacy vault balances and reconciliation evidence;
4. moves/consolidates value through explicit ledger-backed compensating/conversion transactions;
5. converts purpose-vault meaning into logical envelopes/commitments;
6. preserves legacy rows read-only for audit;
7. updates reads/UI to central balance + envelope projections;
8. proves no WLD is created, destroyed or lost during consolidation.

## 14. Acceptance gates

P0 acceptance requires:
- exactly one spendable treasury WLD account;
- 100% of every `TAX_*` amount reaches that account, net of explicit reversals;
- no `TAX_*` posting targets sink/burn;
- budget allocation does not change money supply or account balances;
- every public payout is a ledger transaction and is idempotent;
- `sum(tax receipts - tax reversals)` reconciles to tax-tagged treasury inflow;
- treasury outflow reconciles to settled public programs and corrections;
- legacy vault consolidation has zero unexplained delta;
- reconciliation failure fail-closes new discretionary automation;
- concurrency, replay, authorization and insufficient-available-balance tests pass against a real database.

## 15. Authority integration after review

After user approval of this design, integrate it into:
- `docs/planning/PROJECT_PLAN.md` + `.ko.md`;
- `docs/planning/INTEGRATED_PLANNING_MASTER.md` + `.ko.md`;
- `docs/planning/ADMIN_TREASURY_MANAGEMENT_SPEC.md` + `.ko.md`;
- maintained treasury redistribution/fiscal-reform specifications with EN/KO parity;
- update/changelog/worklog records required by documentation policy.

Implementation, Test and Production work remains a separate gated phase.
