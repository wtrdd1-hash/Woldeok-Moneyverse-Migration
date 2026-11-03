# v2026.11.03.DB-AUDIT.1 — Live Database Keys, Ledger and Privilege Audit

**Status:** evidence-only audit; proposed remediation NOT implemented, Test/Production not promoted, and no database rows/ACLs altered.
**Observed:** 2026-11-03 approximately 13:29–13:39 KST.
**Database:** miniPC connector `woldeok_moneyverse_dev`, PostgreSQL 17.11; live query identity `moneyverse_migrator`. This DB name must be cross-bound to every serving production process before a production-wide claim.
**Git baseline:** `45599a6a49668c646dd70f36cbd1a3e7bfe08f92`, checked from `main` before publishing. At the observation point, `production-current` pointed to `prod-v2026.11.03.1651-45599a6a4966`, v1651 frontend/backend services were active, and the public Treasury overview answered HTTP 200. That is not authenticated money-operation verification.

## Source of truth and method
Reviewed `AGENTS.md`, `DOCS_INDEX.md`, `PROJECT_MEMORY.md`, `docs/DOCUMENTATION_POLICY.ko.md`, `docs/planning/PROJECT_PLAN.ko.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.ko.md`, `docs/architecture/TREASURY_CORE.ko.md`, v1611/v1623/v1626/v1651 financial worklogs and database README. Used only SELECT-based PostgreSQL catalog/aggregate queries and a SHA-256 comparison of all 327 applied migration filenames against `origin/main` SQL bytes. Refrained from DDL, DML, balance transfers, GRANT/REVOKE, or production QA writes.

## Verified healthy invariants
- Public schema: **266 regular tables, 266 primary keys, 318 foreign keys, 126 UNIQUE constraints, 0 unvalidated constraints, 0 invalid indexes, and 0 PK-less tables**.
- Ledger: **891 transactions, 1,829 postings, 42 accounts and 42 cached balances**. No transaction with fewer than two postings, no unbalanced transaction, **0 cached-vs-journal mismatches** using debit-positive accounting, total net account balance **0 WLD**. Do not mistake the opposite credit-positive sign convention (24 mismatches) for a defect.
- 1,546 archived legacy finance rows spanning 8 source tables: all 1,546 JSONB text SHA-256 values rechecked with `encode(digest(payload::text,'sha256'),'hex')`, **0 mismatches**; 5 Treasury vault balances each zero.
- `ledger_transactions.idempotency_key` UNIQUE; financial postings have FK to transactions/accounts; current Core funded-receipt tables have FK/UNIQUE linkage. 327 applied SQL files, all with stored checksums, and source filename coverage complete.

## P0 — Application role can mutate core financial tables
The actual `moneyverse_app` role can SELECT 218, INSERT 195, UPDATE 195, DELETE 194, TRUNCATE 213 public tables. Explicit ACL `moneyverse_app=arwdDxtm/postgres` is present on `accounts`, `account_balances`, `schema_migrations`, `system_treasury_ledger` and `system_treasury_vaults`. The first three have RLS disabled; `schema_migrations` has no application triggers. The app owns none of these tables, and has no inherited role memberships. The role had 2 idle sessions at observation time. This conflicts with `AGENTS.md`/`packages/database/README.md` least-privilege expectations. Financial transaction tables `ledger_transactions`/`ledger_postings` themselves remain read-only to the app, but that DOES NOT protect direct cache/metadata corruption. This demonstrates an exploitable privilege boundary if application SQL execution is compromised; it does NOT assert exploitation occurred.
**Action:** dedicated isolated restored DB privilege-diff/negative tests for every current app path; migrate the app to minimum grants and SECURITY DEFINER functions; reserve migration ledger DML to migration owner. No blind live REVOKE.

## P0 — Five migration checksum drifts
Stored `schema_migrations.checksum` versus SHA-256 of `origin/main:packages/database/migrations/<filename>`:
- `219-admin-work-operations-tuning.sql`
- `220-private-chat-core.sql`
- `221-stock-halt-cost-basis-settlement.sql`
- `234-user-job-qualifications.sql`
- `266-enterprise-security-and-performance-indices.sql`
**322/327 match; 5/327 mismatch**. These are already called out in historical planning/security audit references, but still exist in this live-connected DB. Never rewrite historical checksums or edit applied SQL to silence this. Compare deployed object definitions and archived SQL; add numbered, idempotent forward migrations to converge schemas, then verify a blank install and restored copy.

## P1 — Currency identity and historical provenance
`accounts.currency` is `CHAR(3)` default `WLD`, but has no currency CHECK or FK. **2 of 19 USER_CASH accounts** carry legacy `W`, with aggregate cached balance **2,142,022**; the other 17 use `WLD`. Prior v1623 worklog confirms these accounts are excluded from WLD-only new-money operations. Do not relabel them automatically; first establish provenance, corresponding postings and exact currency policy, then migrate with balanced receipts if authorized.
`treasury_donations` retains **one 2026-10-09 historical 10,000-unit record with NULL canonical `ledger_transaction_id`** before the 2026-10-31 epoch. It must not be misrepresented as a funded post-reset donation.

## P1/P2 — Relation semantics, observability, and performance
- `national_pension_accounts.user_id`, `pension_funded_positions.user_id` and several other finance `user_id` columns lack declarative `users(id)` FKs. Active legacy NPS account count is zero; current data alone do not demonstrate orphans.
- `national_pension_contributions.account_id` and `national_pension_payout_logs.account_id` use `ON DELETE CASCADE`. Financial historical evidence should be immutable/archived rather than removed through a parent-account deletion. Similar cascade patterns merit a scoped review.
- **167 single-column foreign keys** have no valid index whose first key matches the referencing column (22 in broadly financial-named tables). This is an index *candidate* list, not evidence of slow queries; confirm pg_stat and EXPLAIN on a clone before building indexes concurrently.
- `ledger_reconciliation_runs` contains 0 persisted runs: the verified instantaneous SQL balance is positive evidence but not a durable recurring reconciliation history. Check scheduling/retention before concluding no audits run.
- The core ledger uses unbounded PostgreSQL `NUMERIC`, whereas legacy vault amounts use checked decimal strings and some satellite tables use `BIGINT` / `NUMERIC(20,0)`. Database overflow in unbounded NUMERIC is not indicated; API serialization/Number conversion still needs extreme-value regression tests.
- 549 SECURITY DEFINER functions exist, 3 lacking fixed search_path configuration (all three `bank_*_pocket` functions and not executable by `moneyverse_app` in this snapshot). Review alternative executable roles before broadening scope.
- `moneyverse_migrator` is a superuser. Verify credential exposure and execution isolation, not by printing secrets.

## Remediation order and acceptance criteria
1. **P0 ACL containment**: inventory exact effective grants on production-verified DB, negative app-role DML tests against restored clone, then forward-only ACL migration; prove required APIs and all secured money functions remain functional.
2. **P0 migration provenance**: diff five DB-defined objects versus source and their install history; generate follow-on SQL; assert zero drift in fresh install + restored clone.
3. **P1 currency lineage**: isolate `W` accounts without rewriting balances; reconcile every associated posting and formalize an explicit migration/remapping contract.
4. **P1 immutable financial history**: protect cascading pension/treasury deletes and NULL ledger lineage; preserve archival evidence and keep pre-epoch records scoped.
5. **P2 monitoring/performance**: persist periodic reconciliation proof; triage 167 index candidates with query plans and lock budgets.
6. Isolated Test `exact-SHA` API/DB/security/ledger/overflow/idempotency and restore tests; only after actual proof consider blue-green Production promotion and post-cutover rollback gates. Never turn a zero-funded payout/mint into a fake success.

## Non-claims
No destructive simulation was run, no production privilege was changed, no foreign-key migration was applied, no money was minted or transferred, no authenticated live money flow was exercised, and no defect was declared fixed. The production source identity and the connector DB name need a final credential-free runtime binding inspection when remediation begins.
