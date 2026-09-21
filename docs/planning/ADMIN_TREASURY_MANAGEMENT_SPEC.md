# Administrator Treasury, Tax, and Fiscal Operations Specification

> Version: v2026.09.21.323
> Status: implementation-oriented Living product specification
> Baseline date: 2026-09-21
> Korean counterpart: [ADMIN_TREASURY_MANAGEMENT_SPEC.ko.md](ADMIN_TREASURY_MANAGEMENT_SPEC.ko.md)
> Supersedes: v2026.09.20.306
> Scope: planning/documentation only; no runtime, DB, API, or Production mutation in this revision.

## 1. Purpose

Define treasury as a server-authoritative fiscal subsystem connecting **tax/fee revenue → treasury inflow → budget commitment → authorized expenditure → reconciliation/audit → economy stabilization**.

Treasury is not a member wallet. It uses a non-login system account and every WLD mutation must pass the Economy Core/ledger contract.

## 2. Principles

1. Treasury is not burn. WLD held by treasury remains supply unless an explicit non-recirculating sink policy says otherwise.
2. Tax is a tuning instrument, not an objective. It must not become an onboarding barrier.
3. Baseline rates stay low and move slowly. Any tax/fee policy stays within the approved 0–10% envelope and normally remains unchanged for at least seven days.
4. Budget allocation never mints money; it reserves existing treasury balance.
5. Fiscal changes are evidence-driven using faucet/sink, velocity, turnover, profitability, concentration, reserve and reconciliation metrics.
6. Reconciliation failure is fail-closed for automatic tax changes, subsidies, and large payouts.

## 3. Initial tax schedule

| Tax | Tax base / event | Initial | Allowed | Treasury share |
|---|---|---:|---:|---:|
| Member transfer tax | settled transferred WLD | 0% | 0–2% | 100% |
| Marketplace sales tax | executed seller gross | 2% | 0–5% | 100% |
| Stock transaction tax | executed sell notional | 1% | 0–3% | 100% |
| Business profit tax | positive profit after recognized costs | 3% | 0–8% | 100% |
| B2B transaction tax | settled business payment | 1% | 0–3% | 100% |
| Standard shop consumption tax | taxable SKU price | 1% | 0–3% | 100% |
| Luxury SKU tax | designated luxury SKU price | 3% | 0–8% | 100% |
| Club/city administration tax | designated non-refundable fee base | 1% | 0–3% | 100% |
| Casino/probability flows | governed by casino contract | 0% | fixed 0% | 0% |
| Job/check-in/quest reward | reward payout | 0% | fixed 0% | 0% |
| Halt cost-basis refund | refunded principal | 0% | fixed 0% | 0% |

These are launch hypotheses and must be revalidated against simulation and measured economy data before runtime activation.

## 4. Exemptions

Default non-taxable events: onboarding rewards, baseline job/quest/check-in rewards, incident compensation, correction refunds, stock-halt cost-basis settlement, internal same-account sub-ledger transfers, and reversal/refund principal.

## 5. Tax calculation

Use integer/basis-point arithmetic only. Tax = floor(base × bps / 10,000). Stable taxable event IDs prevent duplicate tax. Receipts record base, bps, tax, net amount, rounding remainder, policy version and transaction ID. New policy versions apply only from effective_at forward.

## 6. Treasury balances

Expose total, committed, available, protected reserve, pending inflow/outflow, 1d/7d/30d flow, net flow and reserve coverage days.

available = total - committed - protected_reserve.

## 7. Spending priorities

Priority order:
1. refunds/recovery;
2. treasury-funded rewards;
3. economic stabilization;
4. temporary business subsidies;
5. community/city projects;
6. season/event budgets;
7. audited administrator corrections.

Treasury may not arbitrarily enrich selected accounts, compensate speculative losses, reimburse casino losses, or erase ledger history to force a balance.

## 8. Budget envelopes

Initial envelopes: ESSENTIAL_REFUND, REWARD_POOL, NEW_USER_SUPPORT, RETURNING_USER_SUPPORT, BUSINESS_STABILIZATION, MARKET_STABILIZATION, CITY_COMMUNITY, SEASON_EVENT, INCIDENT_RESPONSE, ADMIN_CORRECTION.

Each stores stable ID, period, allocation, committed, settled, remaining, priority, automation eligibility, actor and immutable history.

## 9. Reserve policy

Initial protected reserve target: 14 days of recent essential spending.
- Warning: <14 days
- Critical: <7 days
- Emergency: <3 days

Emergency state suspends optional/event spending and new discretionary subsidies while preserving essential refunds and recovery.

## 10. Automatic fiscal tuning

Observe faucet/sink, treasury flow, velocity, marketplace/stock turnover, business profitability, asset concentration, new-vs-established wealth gap, reserve coverage and reconciliation variance.

Automatic changes: max ±0.5 percentage points per change, max once per week, minimum seven-day hold, absolute 0–10% envelope. Disable automation on stale data, sample insufficiency, or reconciliation failure. Never retroactively alter casino probabilities, existing loan contracts, or historical transactions.

## 11. Admin UI

Admin → Economy → Treasury:
Overview, Revenue, Taxes, Expenditure, Budgets, Corrections, Reconciliation, Policy & Alerts, Audit.

Tax policy UI shows current rate, allowed band, next eligible change time, actor/reason, 24h/7d revenue, effective burden, estimated seven-day impact and rollback version.

## 12. Member receipts

Every taxed transaction exposes gross/base amount, tax name, rate, tax amount, net amount, policy version and transaction ID. Hidden taxes are prohibited.

## 13. Ledger categories

TAX_MARKETPLACE, TAX_STOCK_SELL, TAX_BUSINESS_PROFIT, TAX_B2B, TAX_CONSUMPTION, TAX_LUXURY, TREASURY_FEE, TREASURY_REWARD, TREASURY_SUBSIDY, TREASURY_GRANT, TREASURY_REFUND, TREASURY_INCIDENT, ADMIN_CORRECTION_IN, ADMIN_CORRECTION_OUT, REVERSAL.

Treasury and burn use distinct double-entry paths.

## 14. API direction

Read: treasury summary, transactions, revenue, expenditure, taxes, budgets, reconciliation, audit.
Mutation: tax preview/commit, budget create/update, correction preview/commit, reconciliation run.

Every mutation requires actor-scoped authorization, step-up authentication, CSRF protection, request hash, idempotency key, DB-side actor validation and immutable audit.

## 15. Data model direction

Recommended tables: treasury_accounts, treasury_transactions, treasury_tax_policies, treasury_tax_policy_versions, treasury_budgets, treasury_budget_commitments, treasury_reconciliations, treasury_adjustments, treasury_alerts.

Core constraints: amount > 0; rate_bps between 0 and 1000; unique taxable-event/tax-code pair; unique actor/action/idempotency key; append-only transaction rows; activated policy versions immutable.

## 16. Reconciliation

Plan hourly lightweight reconciliation and daily full reconciliation across treasury account balance, ledger aggregate, tax/fee sources, budget settlement and refund/reversal aggregates. Variance never triggers destructive auto-fix; it creates evidence and safe-mode restrictions.

## 17. QA

Verify tax base/timing, exemptions, basis-point rounding, duplicate prevention, concurrency, effective_at boundaries, budget invariants, reserve floors, safe mode, correction preview/commit consistency, BOLA/IDOR, re-auth/CSRF/idempotency, responsive 320–1440px views, BigInt-safe formatting and exact-SHA Test backend/API/DB behavior.

## 18. Reference application

The design draws from large-scale game-economy, virtual-economy intervention and public-financial-management bodies of work. It does not claim manual review of 10,000 individual pages. Applied patterns are source/sink separation, measured post-intervention impact, centralized authoritative cash view, controlled budget execution, reconciliation and immutable accounting evidence.

## 19. Delivery sequence

v2026.09.21.323-01 domain/tax event contract; -02 schema/auth; -03 atomic tax settlement; -04 budget/reserve/safe-mode; -05 admin API/UI + member receipts; -06 real-DB concurrency/reconciliation/security/responsive E2E; -07 re-read latest Living Project Plan and exact-SHA Test; -08 merge, rebuild exact merged SHA, zero-downtime Production promotion and smoke verification.

## 20. Current implementation status

Planning/documentation only. Existing economy/ledger/policy infrastructure may be reused, but this document does not claim the tax schedule, dedicated treasury ledger, budgets, reconciliation, UI or APIs are already implemented.
