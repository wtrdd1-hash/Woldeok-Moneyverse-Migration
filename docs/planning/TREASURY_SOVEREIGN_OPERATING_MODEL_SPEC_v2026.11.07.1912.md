# Moneyverse Sovereign Treasury, Central Bank, Mint and Public Financial Services — Detailed Operating Design

> **Version v2026.11.07.1912** | **State: PLANNING / DRAFT** | **No runtime change**
> Canonical English document | [한국어](TREASURY_SOVEREIGN_OPERATING_MODEL_SPEC_v2026.11.07.1912.ko.md)
> [Research matrix](../research/2026-11-07-sovereign-treasury-reference-matrix-v1912.md) | [Worklog](../worklog/2026-11-07-treasury-sovereign-design-v1912.md)
> Authority: PROJECT_PLAN.md → INTEGRATED_PLANNING_MASTER.md → adopted detailed specifications. This proposal does not supersede those artifacts before adoption.
> Source baseline: origin/main 0b5b2b1385d2a75614d39458dff94f7d3098ed03; current Test/Production money settlement is NOT certified by this document.

## 1. Purpose, boundaries and baseline

A complete virtual sovereign economy needs **cash management, revenue, budget control, public services, monetary policy, Mint execution, banking, bonds, pension, sovereign investment and independent audit**. The objective is a working financial system with observable real ledger movement, not an admin page that displays decorative numbers.

Moneyverse WLD is virtual game currency, not KRW or legal tender; no actual Korean or international central bank operates or guarantees it. Government practice supplies design patterns, not a legal identity.

Existing canonical architecture must be reused: v523 Central Bank/Mint/Treasury separation; Treasury Core v1618.2 for funded transfers; Finance Integrity Core v1701 around canonical economy_post_transaction; v542 fiscal integrity and conditional reserve decisions. Main source in November 2026 contains SOE/SWF/NPS changes that must be assessed at their actual deployed SHA and **not claimed Production verified from a source merge**. Historical unfunded payouts are LEGACY_UNVERIFIED unless independently proved.

Product states: PLANNED, SOURCE_IMPLEMENTED, UNIT_TESTED, ISOLATED_DB_TESTED, OFFICIAL_TEST_VERIFIED, PRODUCTION_VERIFIED, LEGACY_UNVERIFIED. Every read model carries source identity, fiscal epoch, as-of, ledger high-water mark, proof state and policy version.

## 2. Institution design and authority

| Owner | Exact responsibilities | Forbidden actions |
|---|---|---|
| Central Treasury (CT) | Collect tax and real non-tax revenue; own fiscal cash; forecast; budget, commit and disburse funded money; issue auditable public fiscal reports | Create WLD, auto top-up deficits, directly modify a user balance |
| Central Bank (MCB) | Inflation/liquidity diagnosis; interest and monetary policy; source-specific approved issuance/retirement ceilings; liquidity facilities | Spend tax cash, credit any user directly, invent an issuance certificate |
| National Mint (MMB) | Execute valid bounded issuance/retirement orders and generate linked canonical certificates | Choose monetary targets, create orders, change fiscal recipients |
| Economy Settlement/Finance Integrity Core (ECSL) | Posted transfers, exact balances, idempotency, receipt proof, outbox, invariant checks | Make public policy or silently repair drift |
| Payments/Banking | Funded customer deposits, transfers, lending contracts, collateral and finality controls | Duplicate money in internal projection or unsecured unbounded credit |
| Debt Office / SWF / SOEs / NPS / KDIC analog | Bond issuance, asset mandates, actual dividends, segregated escrow and valid insurance/pension claims | Label unrealized gain or absent capital as spendable Treasury cash |
| Independent Audit/Disclosure | Read-only cross-proof, exception report, public accountability | Money mutation or evidence replacement |

One superadmin is the administrative approval principal under the owner's current rules; old multiple-person approval must **not** return. Repetitive 15-minute reauthentication is not a dependency. Use authenticated current session, correct scoped privilege, per-action CSRF, explicit reason, immutable audit, bounded DB-side transaction rules and operational freeze control. Any security-policy change needs its own decision.

## 3. Treasury Single Account, vaults and actual fund ownership

IMF TSA and Korean national cash management inspire one **consolidated Treasury cash authority**, while separate physical DB accounts may protect restrictions. Do not create a second source of WLD truth.

Proposed verified classifications:
- TREASURY_POSTED_CASH: independently proven net actual Treasury-owned WLD, comprising valid funded Treasury accounts.
- TREASURY_COMMITTED: remaining payable commitments reserved against posted unrestricted Treasury cash. Budget allocation is a claim, not a money transfer.
- TREASURY_RESTRICTED: separately funded protected or earmarked cash **within** Treasury ownership, not pension/SWF funds owned by others.
- TREASURY_AVAILABLE: posted cash minus committed and restricted, with no overlaps or negative silently clamped into success. An insufficient/unknown component produces UNVERIFIED, not pretend 0.
- TREASURY_FORECAST: modeled future collections or debt proceeds, never money available to settle.
- PAYABLES, DEBT, GUARANTEES, SWF_ASSETS, PENSION_ESCROW: separate categories; none is counted as Treasury spendable balance by default.

Preserve current VAULT_MAIN and other vault identifiers, map them to canonical account IDs and ledger evidence; do not directly edit system_treasury_vaults in place of a financial posting. An existing 25 million WLD cash floor or 30% restriction is a **conditional, versioned policy only**, never unlimited government funding. On genuine zero-WLD Treasury, cash is VERIFIED_EMPTY, available cash 0 and reserve ratio N/A where denominator is zero.

## 4. Revenue and tax capabilities

Domains: marketplace tax, stock sale levy, B2B levy, business profit tax, purchase/consumption tax, optional wealth levy, account transfer tax if approved, fines/fees, SOE dividends, realized SWF proceeds, cost recovery and overpaid-tax refunds. **Bond proceeds are financing and create public debt; they are not tax income.**

Each event lifecycle: BUSINESS_EVENT_CONFIRMED → TAX_POLICY_SNAPSHOT → BASE_CALCULATION → CANONICAL_SETTLEMENT → IMMUTABLE_RECEIPT → PERIODIC_RECONCILIATION. Validate that the base was actually settled, that the policy was effective at the event timestamp and that exemptions, cap and beneficiary ownership are authentic. Example exact formula: tax_WLD = floor(base_WLD × bps / 10000). Use integer/NUMERIC and decimal-string APIs, no JS Number on large WLD.

Store source_event_id, source_type, tax_code, effective_policy_hash, base, bps, tax, net, rounding remainder, ledger_transaction_id, treasury_account_id, actor_source, timestamp, hash and snapshot epoch. Unique (source_event_id, tax_code, applicable period) prevents double collection. Reverse by new compensating journal legs with original ID; never erase taxed event or ledger history. Rate modifications undergo impact preview, a seven-day normal cooling rule from existing v323 where still authoritative, explicit effective_at and bounded policy version. No retroactive unexpected tax.

## 5. Budgeting, spending and social services

### Budget model

Fiscal epoch → yearly/season program → budget envelope → project/beneficiary cohort → verified commitment → recipient payment → closing/performance report. Each records approved ceiling, earmarked funding, amount committed, paid, returned, remaining, actor, eligibility rules and policy version. New enrollment or funding must never depend on an imaginary income forecast.

Priority programs, each separately funded: refunds and recovery; earned service rewards; welfare/newcomer support; citizen dividends from surplus; project grants and infrastructure; employment and public procurement; market liquidity stabilization; emergency aid; administrative correction through reversal/compensation. Each program has amount/payout caps, cooldown, cohort rule, anti-sybil protection, per-user receipts and appeal trail. Avoid hidden gambling loss reimbursements or guaranteed speculative profits.

### Exactly-once multi-recipient pipeline

DRAFT → SIMULATED → AUTHORIZED → ENCUMBERED → SETTLING → SETTLED → RECONCILED.

Alternate terminal/control states: REJECTED, CANCELLED_BEFORE_SETTLEMENT, RETRY_PENDING for unsettled recipient, QUARANTINED for mismatch and REVERSED through a new journal entry only.

- **Simulate:** freeze budget/policy version, beneficiary snapshot, eligible count, total debit, confirmed available funds, resulting reserve and sample precision. No money moves.
- **Authorize:** permitted session-bound superadmin or strictly constrained automated policy actor; single administrator workflow, no two-person signoff.
- **Encumber:** lock and atomically reserve committed spend against verified funded cash. An unfunded budget is rejected.
- **Pay:** each payee gets a unique batch+recipient+policy intent, a single canonical DB transaction, one immutable receipt and outbox notification. Identical retries return the same receipt; changed replay payload fails.
- **Finalize:** batch result derives from settled item receipts. A failure cannot mark a partial batch fully settled, and already paid users are never paid again.
- **Cancel/repair:** before settlement release commitment; after settlement use an explicit compensated or recovered entry with custody and sufficient balance, never delete a confirmed payment.

Example funded 40-WLD citizen dividend from Treasury holding 100 WLD: TREASURY -40, USER_CASH +40, global WLD supply change 0. For a 500-recipient failure at item 300, 299 verified receipts remain settled; only unverified/unsettled items are retried. Queue delivery is not proof of payment.

## 6. Central Bank monetary services and Mint execution

Central Bank operations:
- Track proven WLD supply, net new money, monetary velocity estimate, game price-index quality, market depth, concentration, bank liquid reserves and economy shock metrics.
- Publish versioned proposals for policy rates, liquidity facilities, maximum issuance budget by funded source, retirement and emergency pause.
- Forbid an AI agent or Treasury deficit from bypassing monetary issue gates. Interest rate adjustments alone do not mint WLD.
- Optional simulated market operations exchange actually funded assets; do not invent collateral or cash.

Monetary order fields: unique order UUID; MINT, RETIRE, FREEZE or RESUME; amount ceiling, source and recipient restrictions, valid-from/until, policy digest, attested evidence high-water mark, initiating superadmin and issuance/retirement remaining. Mint executor checks each prerequisite, reserves ceiling under DB lock, posts canonical ledger/certificate/outbox **in the same transaction**, and returns stable certificate_id. No certificate after a rolled-back money command. Issuing digital/game money is distinct from physically manufacturing banknotes (KOMSCO reference).

Monetary invariants: every posted transaction has zero-sum postings **including MINT/SINK system classes**; outstanding supply after t equals independently verified opening supply plus certified gross mint minus certified retirement; all ordinary fiscal taxes/transfers/deposits/bond principal transfers have supply delta exactly 0. Certificates cannot consume an order ceiling twice. Ledger category/account-class aggregation independently cross-checks supply equation by epoch.

## 7. Banking, public debt, enterprises, investment and pensions

| Module | Detailed features | Funding/validity boundary |
|---|---|---|
| Member bank | Deposits, withdrawals, account history, transfer intent, holds, bank liquidity, interest accrual, limits | Same canonical WLD owner projection and settlement receipt; no raw transfer in two databases |
| Credit | Underwritten loan contract, repayment schedule, collateral lock, interest, overdue/default, recovery | Loan proceeds/repayment must be funded and journaled; no negative spending beyond permitted collateral/credit model |
| Government bond | Announce→bid/subscribe→allocation→principal cash settlement→security registration→coupon→maturity/repo | Proceeds create liability, maturity/coupon need actual posted funding; due != paid |
| SWF | Treasury capital contribution, asset allocation, holdings/mark, realized sale, distributions, mandate limit | Unrealized appraisal profit is not spendable cash; protect SWF/Treasury double counting |
| SOE | Actual business revenue/expense, investment, profit, capital, declared/paid dividend, government share | Estimated enterprise profit or hypothetical hourly dividend is not a funded Treasury deposit |
| NPS | Contributions, separate pension escrow and liabilities, claims, funded accrual and benefit, opt-out/withdraw | Preserve original historical unresolved records, no phantom fixed payout or principal guarantee |
| KDIC analog | Real premium-backed fund, eligible institution/beneficiary, exposure cap, insured payout, recovery | Real escrow and available liquidity required; insufficient fund produces pending claim |
| FX/CBDC concept | Educational simulation and public disclosure, privacy and offline double-spend risk research | No real exchange/official CBDC or offline value transfer without new scoped approval |

Cash, debt securities, equity share claims, contingent liabilities and pension promises must have **separate account and valuation semantics**. The U.S. TreasuryDirect auction is a useful interaction model, not a contract template. Norway GPFG illustrates mandate-based asset investment, not guaranteed return.

## 8. Data model and database control

Reuse existing accounts, account_balances, ledger_transactions, ledger_postings, outbox_events, Treasury Core receipts, Finance Integrity proof, vault/pension/bond/SWF tables and DB-owned economy_post_transaction. Candidate additions only **after current migration inventory**: treasury_budget_versions; treasury_commitments; treasury_disbursement_batches; treasury_disbursement_items; treasury_source_evidence; treasury_cash_forecasts; treasury_reconciliation_runs; monetary_order_consumptions. Avoid a duplicate canonical balance row.

Required schema invariants: UUID business event and UUIDv4 idempotency key, unique (actor, operation, idempotency_key) plus request_digest; issuer/receiver account FK; monotonic ledger sequence; immutable policy versions/settled receipts; nonnegative spendable funds unless explicitly designated; policy/version reference; account currency WLD; exact NUMERIC in authoritative DB and exact decimal string in API; JSONB evidence/chunked amount presentation where useful but never independently recalculated separate money. Canonical numeric precision must be chosen against real DB maximum, not reduced to IEEE-754.

Single atomic write boundary: Android/web → same-origin Next BFF → authenticated Nest domain command → restricted SECURITY DEFINER SQL wrapper owned by migrator → economy_post_transaction + domain receipt + Finance Integrity proof + outbox in same transaction → verified response. The app role has no direct DML to financial tables and no raw EXECUTE on posting primitive. No internet-accessible internal core API; deny PUBLIC grants and restrict private network. A missing proof rejects response even if a frontend toast says success.

Concurrent same-key retry returns same receipt, changed digest returns conflict; transaction serializes relevant account and budget locks in consistent ordering. Immutable receipt proofs record request digest, transaction ID, amount/account before/delta/after, ledger high-water mark, hash and policy. SHA256 in the same DB is not an independent defense against a privileged attacker: require separately restored signed backups and offsite evidence.

## 9. Reconciliation, incidents and recovery

Reconcile: posting sum zero; transaction before+delta=after for every touched account; account projection vs source postings; Treasury revenue/spend/cash/commitment; certificate vs supply; debt/security obligations; loan/pension/insurance escrow; SWF realization; immutable audit provenance.

Proposed hourly incremental plus daily independent full reconcile, with proof fields run_id, epoch, snapshot time, ledger high-water mark, actual/expected, zero/nonzero variance, source schema, runtime SHA and severity. States: PASS; VERIFIED_EMPTY (legitimate zero money); STALE; UNKNOWN; DRIFT; LEGACY_UNVERIFIED; QUARANTINED. An empty valid Treasury must not yield a panic banner; reserve percentage with zero denominator is N/A, not fabricated 0% or 100%. A missing source is UNKNOWN, not 0.

When drift occurs: stop **affected new financial writes**, preserve safe reads and unaffected proven domains; snapshot evidence; find first divergent transaction; run isolated restored DB replay; require separately reviewed compensated correction where warranted. Never auto-force zero, erase user balances, recalculate balances from a partial ledger, manufacture backfill transactions or silently unpause high-risk money transfer. Reopening requires exact-SHA/proof acceptance. Alerts contain bounded redacted evidence and auto-resolve only on proven normal state.

Backups/WAL reside on designed persistent storage; second disk is not a second ledger or substitute for off-host restore. Production backup checksum, isolated restore, migration parity, RPO/RTO and DR exercise are release gates. The observed DEV database port 0.0.0.0:5433 is a pre-existing **security investigation**: plan loopback/private binding, role and firewall verification without claiming a network change here.

## 10. API, admin console, public website and Android

The following endpoints are **candidates**, not a statement of current routes:
- GET /api/v1/treasury/public-overview (proof-backed totals and explicit empty/unknown)
- GET /api/v1/admin/treasury/revenue, /budgets, /commitments, /disbursements, /audit, /reconciliations
- POST /api/v1/admin/treasury/budget/preview, /budget/authorize, /disbursement/settle
- GET /api/v1/admin/central-bank/summary and /orders; POST /orders/preview, /orders/authorize
- POST /api/v1/internal/mint/execute (private, server-to-server only)
- GET /api/v1/me/fiscal-benefits and the underlying immutable receipts.

Candidate response states: VERIFIED, VERIFIED_EMPTY, PENDING, DENIED, POLICY_LIMIT, REPLAY_CONFLICT, PROOF_UNAVAILABLE, STALE, LEGACY_UNVERIFIED. HTTP 503/UNKNOWN must not be converted to an empty array, fake zero or permanent failure. Financial private responses must be no-store/noindex; Android account change clears financial cache.

Admin areas: Treasury Overview, Revenues/Taxes, Budget Planning, Expenditure/Benefits, Debt/Bonds, SWF/SOE, Pensions/Insurance, Central Bank Monetary Policy, Mint Certificates, Integrity/Reconciliation, Incident Control and Audits. Public overview: only honestly backed aggregates, spending classifications and policy history; member wallet: exact payment origin, program, net amount, time, receipt and pending/settled state. All show 'virtual WLD', epoch/as-of, confidence and proof state. Missing evidence gets a precise explanation, not false success or constant red warnings.

## 11. Economic analytics and AI

KPIs: gross tax, net fiscal receipts, actual cash balance, committed and available, 7/30-day forecast, execution completion, overdue liabilities, distribution inequality, beneficiary counts, economic velocity estimate, liquidity and default risk, certified mint/retire, realized investment returns, source freshness and error counts. Low sample size or missing trades means NO RELIABLE PRICE INDEX rather than asserted inflation.

AI may propose tax-band modifications, fiscal programs, bounded surplus allocation, liquidity freeze or policy-rate scenario, all supported by deterministic risk simulation and immutable proposal. AI cannot issue money, fund deficits, write a balance, approve itself, fabricate dividend cash or bypass human-admin and DB safety constraints. Policy changes must not retroactively alter existing loans, tax receipts or game contracts.

## 12. Execution work packages and acceptance gates

| Stage | Work package | Required acceptance proof |
|---|---|---|
| P0-1 | Exact live Test/Production identity, SQL migration/privilege inventory, historic discrepancy casebook | Read-only evidence by epoch; no changes; owner of each amount known |
| P0-2 | Unified Treasury funded cash and Finance Integrity proof contract | Independent restored DB, correct 0-WLD, 20+ digit amount, 100 duplicate/concurrent tests, actor-spoof denied |
| P0-3 | Funded tax/revenue → budget commitment → item settlement | Full refund/reversal, zero-funds block, crash/retry exactly once, separate completed/pending recipient proof |
| P0-4 | Admin/public/member/Android evidence parity | HTTP/auth/session switch/CSRF/no-store, clear zero vs UNKNOWN vs legacy semantics |
| P1-1 | Mint/CB order/certificate and monetary supply scan | Valid limited order only, no unauthorized issuance, order cap and independent supply proof |
| P1-2 | Bonds, SWF, SOE, NPS, insurance cash provenance | Proven receipts, liability vs asset separation, no unearned yield/phantom funding |
| P2-1 | Forecasting, AI policy simulation, fair distribution analytics | Reproducible forecasts, no AI settlement right, simulation non-mutating |
| Release | Full CI → official exact-SHA Test FE/BE/DB/security → verified rollback and no-downtime Production | No outstanding P0 financial mismatch; immutable backups and source/runtime match |

Every future implementation task requires an isolated branch, revised mid-work main check, bilingual worklog, updates/changelog, tests, official Test and safe Production gates. This planning-only v1912 branch changes **no source code, DB, financial policy, WLD balance or runtime**.

## 13. Unresolved policy decisions

Reserve buffer formula and release; program caps/fairness; exact WLD integer precision; freeze scope; statutory-looking bond yields; pension and insurance claim coverage; automated disbursement ceiling; public transparency privacy; foreign-language descriptions (English canonical/Korean second). They remain PROPOSALS and must be resolved against current integrated/master authority and actual user goals before implementation.

## 14. Evidence and external literature

The paired research matrix links **16 official primary sources**: Bank of Korea Treasury, BOK-Wire+, BOK issuing/manufacturing and policy; KFIS dBrain+; Korea Mint Act; IMF TSA, GFSM and Fiscal Transparency Code; BIS PFMI, CBDC design and offline risk; Federal Reserve monetary tools; U.S. TreasuryDirect auctions; Norges Bank GPFG; and ISO 20022. Sources are used for specific process ideas rather than borrowed national legal authority.
