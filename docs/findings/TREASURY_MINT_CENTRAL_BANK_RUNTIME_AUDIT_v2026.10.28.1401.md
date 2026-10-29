# v2026.10.28.1401 — Treasury, Mint and Central Bank Runtime Audit

**Status:** READ-ONLY AUDIT COMPLETE; financial integrity and release acceptance **NOT VERIFIED / HOLD**.  
**Audit date:** 2026-10-28 KST. **Production application checkout:** `a28bed9aa40ff74d492824ae12892a7d52132fdd`; verified `origin/main` at start, middle and report preparation.  
**Authority:** `docs/planning/PROJECT_PLAN.ko.md` → `docs/planning/INTEGRATED_PLANNING_MASTER.ko.md` → v523 `CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.ko.md` → v542 integrity reconciliation. The older macroeconomic master is historical/conditional.  
**Scope:** production-installed source, local HTTP, backend journal, feature-switch registry, read-only PostgreSQL catalog and aggregate queries on `woldeok_moneyverse_dev`, and isolated mock-based unit tests. The DB's documented overlap with the production backend prevents treating its name as isolation proof. No authenticated money-moving E2E was attempted.

## Executive determination

Backend, frontend, Nginx and database connectivity are active. This **does not** imply the sovereign finance workflows function end to end. Several administrative actions remain available as routes while canonical double-entry settlement, durable proofs or genuine disclosure are absent; some are deliberately held with HTTP 503.

## Functional status by boundary

| Capability | Evidence | Audit status |
| --- | --- | --- |
| Public treasury disclosure | `frontend/src/app/treasury/page.tsx` and `frontend/src/app/api/treasury/overview/route.ts` display 25M WLD, 3.42M expenditures, 1,420 beneficiaries and synthetic dated ledger rows whenever the admin-only API is unavailable. Public live `/ko/treasury` returned HTTP 200 and displayed those literals. | **P0: misleading successful disclosure** |
| Treasury five vaults / ledger | 5 vaults and 552 treasury-ledger rows exist. Main vault and total balance were read without disclosing account details. | Data exists; independent treasury reconciliation not proven |
| Dividend, targeted subsidies and grants | SQL `treasury_disburse_citizen_dividend` and `treasury_disburse_grant` directly update `account_balances` plus text-based treasury balance and domain receipt. Disbursement receipts were written on October 28, but the latest canonical `ledger_transactions` row is October 24. | **P0: missing demonstrated canonical linkage** |
| Treasury donation | 1 domain donation record. Ledger-first migration `272-ledger-first-treasury-donation.sql` not applied; legacy function overload reads/writes balances directly. | **P0: do not assume exactly-once double-entry** |
| Treasury allocation, tax and buyback | Admin controllers, SQL functions, budgets and wealth-tax records exist (18 assessments). End-to-end exact-SHA finance acceptance is absent. | Partially implemented, not fully verified |
| Treasury benefit claim | `frontend/src/app/api/treasury/claim/route.ts` responds HTTP 503 until ledger settlement certified. | Intentionally unavailable |
| Treasury backup | `TreasuryService.getBackupStatus/createBackupSnapshot` fail closed with `TREASURY_BACKUP_EVIDENCE_UNAVAILABLE` / HTTP 503. | Intentionally unavailable |
| Legacy mint | `backend/src/mint/mint.service.ts` seeds sample mint/burn entries in private arrays; create/accept/burn change process memory and do not post canonical supply settlement. A restart loses mutations. | **P0: not a durable monetary authority** |
| Legacy central bank | `backend/src/central-bank/central-bank.service.ts` stores base rate and reserve ratio in memory; M1/M2 derive from fixed multipliers of the legacy minted tally, not measured deposits. | **P0: illustrative, not economic truth** |
| Database monetary policy | 169 policy orders, all CANCELLED; 0 mint certificates and 0 retirement certificates. DB-oriented `MintBureauService` inserts certificates with policy quota reservation, without canonical account settlement. Telemetry sets `verified_invariant=false`. | Candidate components, no certified mint/retire |
| Monetary auto-regulation | Global feature switch = enabled, but DB `monetary_auto_regulation_configs.is_enabled=false`, startup log says scheduler disabled. Code queries obsolete `public.ledger_entries`, a relation absent from current DB. Latest regulation event 2026-10-15. | **Disabled; enabling would encounter schema mismatch** |
| Autonomous SWF | DB `treasury_swf_configs.is_enabled=true`, production scheduler logs fail-closed. Last COMPOUND_GROWTH_CYCLE 2026-10-15; 4 portfolio rows. Liquidation failed twice on 2026-10-28 14:24 KST with PostgreSQL `inconsistent types deduced for parameter $1` in `liquidateToTreasuryVault`. | **P0/P1: partial + runtime error** |
| Treasury bonds and repo | 3 bond products exist. Holdings, orders, coupon logs and repo loans all 0. Subscription and repo routes exist but authenticated money-moving E2E was not performed. Manual coupon distribution returns HTTP 503 pending ledger certification. | Catalog implemented; settlement not verified |
| Citizen budget governance | 1 vote recorded; vote and admin retrieval functions exist. | Data present, not auth-E2E verified |
| Canonical ledger | 890 transactions / 1,810 postings; lower-case debit and credit amounts aggregate equally; 0 transaction-level imbalance. 2 reconciliation snapshots marked healthy, latest 2026-10-24. | **Balanced sampled full data; not monetary-supply/treasury reconciliation** |
| Application DB privileges | `moneyverse_app` retains direct INSERT/UPDATE/DELETE on `account_balances`, `system_treasury_vaults`, `system_treasury_ledger`, `monetary_policy_orders`, mint and retirement certificate tables, contrary to intended function-only least privilege. | **P0 permission boundary violation** |

### High-priority findings and acceptance

- **FIN1401-01 P0 — Public fake fiscal truth:** Remove production default balances, synthetic rows, beneficiary counts and synthetic timestamps; expose a public, role-scoped, genuine SQL read model with `UNAVAILABLE/UNVERIFIED` and a last-verified timestamp when evidence is absent. Prove no private data leakage, including mobile and SEO previews.
- **FIN1401-02 P0 — Canonical settlement:** Route treasury grants, dividends, donations, sink/buyback and SWF flows through certified double-entry, durable idempotency and reconciliation. No business receipt should imply money moved without an independently traceable transaction ID. Never fabricate opening journal entries to conceal legacy drift.
- **FIN1401-03 P0 — Legacy mint/central-bank:** Remove or explicitly sandbox in-memory monetary APIs; make permanent changes require versioned orders, approvals, mint/retirement certificates and the same atomic ledger transaction. Retain deny-by-default public API boundaries.
- **FIN1401-04 P0 — Role grants:** Revoke app direct DML after forward-only SECURITY DEFINER replacements, run actual `moneyverse_app` role tests, and retain negative privilege assertions.
- **FIN1401-05 P0 — SWF SQL liquidation:** Correct cast/parameter type inconsistency, then test rollback, exact cash/portfolio conservation, ledger effects and concurrency using an isolated PostgreSQL fixture, not production balances.
- **FIN1401-06 P1 — Auto scheduler truth:** Align feature-switch registry, DB config and process environment. Replace missing `ledger_entries` source with certified read model; do not turn on automatic issuance or fake growth to prove the schedule runs.
- **FIN1401-07 P1 — Bonds:** Verify subscriptions, cancellations, settlements, accrued coupons, lock/repo, interest and maturity against actual ledger, bank pool and affordability; maintain coupon 503 until accepted.
- **FIN1401-08 P0 release gate:** Development/Production DB isolation, migration 272 provenance and checksum parity, finance ACLs, latest SHA isolated Test with authenticated member/admin/mobile QA, API/DB reconciliation=0, replay/concurrency, backup restore/rollback, and no-downtime promotion evidence are mandatory. No production cutover authorized by this audit.

## Reproducible evidence

- `systemctl` and backend journal: services active; money scheduler and SWF scheduler fail closed; SWF liquidation PostgreSQL parameter type errors at 14:24 KST.
- HTTP: `GET http://127.0.0.1:3000/health` → 200; unauthenticated protected central bank and admin treasury paths → 401 as expected; publicly served `/ko/treasury` → 200 containing synthetic figures. No authenticated E2E.
- Safe catalog/count SELECTs: monetary policy 169 CANCELLED; mint/retirement certificates 0/0; auto regulation 318 historical; treasury 552; disbursements 6; bond catalog 3 / active holdings 0; canonical ledger 890/1,810, imbalance 0; automatic setting disabled, SWF setting enabled, process scheduler disabled.
- Unit tests executed against the actual deployed source checkout: 6 Vitest suites, **40 passed**, mock/unit scope only. No evidence from the tests of finance permissions or HTTP authenticated settlement.
- `docs/worklog/2026-10-28-treasury-mint-central-bank-audit-v1401.md` records before/mid/end checks. No code, migration, service, DB data or production release changed.

**Conclusion:** Production processes are live, but the three economic institutions are **NOT fully operational or reconciled** as specified. Do not promote or enable financial auto-actions on the strength of the current UI or unit tests.
