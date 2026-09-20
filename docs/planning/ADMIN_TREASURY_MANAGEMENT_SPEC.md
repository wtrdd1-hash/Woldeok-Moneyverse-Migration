# Administrator Treasury Management Specification

> Version: v2026.09.20.311
> Status: implementation-oriented Living product specification
> Baseline date: 2026-09-20
> Korean counterpart: [ADMIN_TREASURY_MANAGEMENT_SPEC.ko.md](ADMIN_TREASURY_MANAGEMENT_SPEC.ko.md)

## 1. Purpose

Add a dedicated **Treasury Management** surface to the administrator control center. The treasury is the server-authoritative public/economy reserve used to account for platform-controlled inflows and outflows. It is not a normal member wallet and must never be implemented as an unrestricted balance-edit field.

The implementation must preserve the existing ledger, BigInt-safe amount handling, database authorization, immutable audit, exact-SHA Test gate and zero-downtime Production promotion contracts.

## 2. Product boundaries

Treasury Management covers:
- current treasury balance and available/reserved amounts;
- categorized revenue and expenditure;
- tax, fee, sink, subsidy, grant, reward-funding and system-adjustment flows when those flows are configured to settle through treasury;
- manual administrator deposits/withdrawals only through explicit correction transactions;
- planned/scheduled budget allocations and transfers;
- transaction history, reconciliation status and variance evidence;
- reserve thresholds, alerts and operational notes;
- exportable accounting views that do not bypass authorization or expose secrets.

It does not permit:
- direct SQL/table editing from the UI;
- editing or deleting historical ledger entries;
- silently rewriting member balances;
- using the treasury to bypass normal reward, tax, shop, stock, bank or business contracts;
- floating-point amount arithmetic;
- unaudited “set balance” operations.

## 3. Administrator information architecture

Add **Admin → Economy → Treasury** with these sections:

1. **Overview**
   - total balance;
   - available balance;
   - reserved/committed amount;
   - today / 7-day / 30-day inflow and outflow;
   - net flow;
   - reserve ratio and threshold status;
   - last successful reconciliation time;
   - unresolved reconciliation variance count.

2. **Transactions**
   - immutable chronological ledger view;
   - filters for date, direction, category, source system, reference type, actor and status;
   - cursor pagination;
   - stable transaction/reference IDs;
   - before/after treasury balance snapshots where the ledger contract can safely provide them;
   - linked source record for tax, fee, reward, grant, correction or other originating event.

3. **Revenue**
   - tax/fee/system revenue summaries;
   - source breakdown;
   - gross vs refunded/reversed values;
   - period comparisons without changing ledger truth.

4. **Expenditure**
   - rewards, subsidies, grants, operational economy transfers and other configured treasury-funded flows;
   - recipient/reference information constrained by least privilege;
   - committed vs settled amount where reservations are supported.

5. **Budget / Allocation**
   - create named budget envelopes;
   - optional period, purpose, cap and remaining amount;
   - allocation does not create money by itself;
   - spending must settle as ledger transactions against the treasury.

6. **Corrections**
   - privileged manual inflow/outflow;
   - mandatory reason, amount, category, evidence/reference and idempotency key;
   - preview of resulting balance and reserve impact;
   - step-up authentication before commit;
   - no direct balance overwrite.

7. **Reconciliation**
   - compare treasury ledger balance with configured source aggregates;
   - show exact variance and affected period/source;
   - reconciliation findings are evidence, not automatic destructive fixes;
   - fixes use a separate audited correction transaction.

8. **Policy / Alerts**
   - low-reserve warning threshold;
   - optional critical reserve floor;
   - unusual inflow/outflow thresholds;
   - reconciliation staleness threshold;
   - read-only display for policy values controlled elsewhere unless this surface has an actor-scoped safe mutation.

## 4. Treasury accounting model

Use a dedicated treasury account identity that cannot log in and cannot be treated as a member account.

Every monetary mutation must produce an append-only ledger entry with at least:
- treasury transaction ID;
- direction;
- integer-string amount;
- asset/currency identifier;
- category;
- source/reference type and reference ID;
- acting system/admin identity;
- reason code and optional note;
- idempotency key for mutable commands;
- created/settled timestamp;
- reversal/correction linkage when applicable.

The displayed treasury balance is derived from authoritative ledger/accounting state. The UI must never calculate the canonical balance from a partial transaction page.

## 5. Categories

Initial normalized categories should include:
- TAX_REVENUE
- PLATFORM_FEE
- SHOP_OR_MARKET_FEE
- ECONOMY_SINK_TRANSFER
- REWARD_FUNDING
- SUBSIDY
- GRANT
- EVENT_BUDGET
- SYSTEM_TRANSFER
- ADMIN_CORRECTION_IN
- ADMIN_CORRECTION_OUT
- REVERSAL

New categories require schema/API/documentation parity rather than free-text-only categorization.

## 6. Manual correction safety

A manual correction is a high-risk operation.

Required controls:
- superadmin/operator permission according to the current administrator authority model;
- recent re-authentication / step-up authentication;
- CSRF protection for browser mutation;
- positive integer-string amount with server-side limits;
- explicit inflow/outflow direction;
- mandatory structured reason plus human-readable note;
- optional/required evidence reference according to amount threshold;
- preview endpoint or deterministic server-side preview;
- idempotency key;
- database-side actor verification;
- transaction-level atomicity;
- immutable audit record;
- post-write readback showing exact committed transaction.

For large amounts, the policy may require an additional confirmation challenge. This does not introduce a second administrator role when the product is configured for a single superadmin.

## 7. Budget and reserved funds

Budget allocation is an accounting commitment, not minting.

A budget envelope should contain:
- stable budget ID;
- name and purpose;
- period/start/end;
- allocated amount;
- committed amount;
- settled amount;
- remaining amount;
- status;
- creator/updater actor;
- timestamps.

Reserved/committed funds must not be counted as freely available. Expiry or cancellation releases commitment without falsifying historical expenditure.

## 8. API direction

The implementation should expose actor-scoped administrator APIs approximately equivalent to:
- treasury summary;
- transaction list/detail;
- revenue/expenditure breakdown;
- budget list/create/update/status;
- correction preview/commit;
- reconciliation status/run;
- policy/alert read and narrowly scoped mutation where supported.

All mutation APIs must be server-authoritative, validated, idempotent where replay is possible, and protected by administrator authorization plus database-side actor checks.

## 9. Security and authorization

- deny by default;
- no direct protected-table writes for the application role;
- do not trust UI role state as final authorization;
- prevent IDOR/BOLA across treasury transactions, budgets and evidence;
- never log secrets, session cookies, CSRF tokens or unrestricted private member data;
- use least-output DTOs for recipient/member references;
- rate-limit high-risk mutations;
- record actor, request correlation ID, previous policy value and new policy value for settings changes;
- audit every manual correction, budget mutation, reconciliation execution and policy mutation.

## 10. UI/UX requirements

- Desktop may use dense accounting tables; mobile switches to readable transaction cards rather than horizontal clipping.
- Amounts use locale-aware formatting while preserving exact integer-string values in transport.
- Inflow/outflow must not be distinguishable by color alone.
- Critical mutations require explicit confirmation describing direction, amount, destination/source, reason and resulting treasury balance.
- Loading, empty, partial-data, unauthorized, stale-reconciliation and error states are explicit.
- A failed mutation must never be displayed as committed.
- CSV/export actions must honor the same filter and authorization scope and must not export secrets.

## 11. Observability and alerts

Track:
- treasury balance and available balance;
- inflow/outflow rate;
- failed correction count;
- duplicate/idempotency rejection count;
- reconciliation duration/result/variance;
- low-reserve and critical-reserve state;
- stale reconciliation;
- mutation latency and error rate.

Alerting must not create money or automatically “fix” a variance.

## 12. QA acceptance

Production is blocked until tests cover:
- unauthorized/non-admin access;
- stale/forged admin identity;
- CSRF and missing step-up auth;
- negative, zero, decimal, overflow and malformed amounts;
- duplicate idempotency keys;
- concurrent corrections;
- failed transaction rollback;
- exact balance after inflow/outflow/reversal;
- budget available/committed arithmetic;
- pagination/filter integrity;
- reconciliation match and mismatch;
- immutable audit presence;
- responsive 320/360/390px layouts;
- keyboard and screen-reader operation;
- BigInt-safe formatting;
- no secret/private-data leakage in logs/export;
- exact-SHA Test backend/API/database verification.

## 13. Delivery sequence

- **v2026.09.20.311-01** — finalize treasury accounting/domain contract and category mapping.
- **v2026.09.20.311-02** — schema/functions/read models with DB actor authorization and ledger invariants.
- **v2026.09.20.311-03** — admin summary/history/revenue/expenditure APIs.
- **v2026.09.20.311-04** — correction, budget and reconciliation commands with step-up auth/idempotency/audit.
- **v2026.09.20.311-05** — responsive administrator Treasury UI, export and alert surfaces.
- **v2026.09.20.311-06** — security/concurrency/accounting/reconciliation E2E on exact-SHA Test.
- **v2026.09.20.311-07** — re-read latest plan, resolve drift, merge, rebuild exact merged SHA and zero-downtime Production promotion only after all gates pass.

## 14. Current implementation status

Planning/documentation only. The current repository contains administrator economy controls, but this document does not claim a dedicated treasury ledger/UI/API is already implemented. Runtime work must begin on a new implementation branch after re-reading the latest Living Project Plan.
