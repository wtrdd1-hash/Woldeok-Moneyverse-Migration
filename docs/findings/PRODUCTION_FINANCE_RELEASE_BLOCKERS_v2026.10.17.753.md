# Production financial forensics before host promotion — v2026.10.17.753

**English canonical** | [한국어](PRODUCTION_FINANCE_RELEASE_BLOCKERS_v2026.10.17.753.ko.md)
**Status:** BLOCKED. All financial queries on existing Production were READ ONLY; no account names or IDs are shared.

## Actual production database
Official Production public source remained v717. Its PostgreSQL 17.11 financial readiness report remained BLOCKED:
- 40 balance projection rows, 19 balances not derivable from immutable ledger postings, total **+4,779,188 WLD**.
- Of those, 18 USER_CASH accounts account for **+4,772,938 WLD**, and one SINK account accounts for **+6,250 WLD**. Five USER_CASH accounts have no postings, with **2,627,807 WLD** in balance rows.
- 831 ledger transactions and 1,692 postings, with zero imbalanced transactions and zero transaction records missing postings. That alone does not certify opening cash.
- The application role has direct INSERT/UPDATE/DELETE privilege on **five protected tables**: accounts, account_balances, ledger_transactions, ledger_postings, system_treasury_vaults.
- Most problematic user-cash balance rows had last update **October 8, 2026** (15 rows with aggregate +3,326,364 WLD); one October 9 (+1,065,011), one October 10 (+159,595), one October 15 (+221,968). This is time correlation, not proof of fraud or a single cause. Many accounts were opened during September, so assigning the differences to unverified legacy opening balances would not be evidence.
- An additional anonymized ledger/receipt census found zero bulk payouts and P2P wire records, 493 work_reward_receipts totalling 195,909 WLD with zero missing transaction references, and three early_event_claims without a matching ledger transaction. These receipts do **not** explain +4.779m WLD. Do not infer or fabricate an offsetting entry.
- Source still contains direct balance-writing paths in several bond/pension, FX or fiscal workflows. Existing PvP creation/join is now fail-closed in main v750, but current public Production v717 does not yet run the fix.

## Evidence and mandatory next actions
1. A fresh full Production PostgreSQL dump including ACL and ownership was taken READ ONLY into the 200GB data filesystem at /srv/moneyverse-data/backups/prod-v2026.10.17.753-finance-preflight/prod-current-consistent-snapshot.pgdump; PostgreSQL 17.11 pg_restore archive table-of-contents verification passed. SHA256: 4e495fb18bc9bd811a35853f8a3a734463a68034931635e7aac4f0fedf8a60ae. This is an integrity-checked backup archive, **not a freshly witnessed full restore test**.
2. Preserve the source account journal and old historical snapshots. Reconcile each of 19 accounts by matching legitimate operation evidence, prior snapshots, original transaction receipt and counterparty. Do not credit or debit accounts merely to force a report zero.
3. Replace every remaining direct-money writer with reviewed balanced/idempotent SECURITY DEFINER transfer commands; test money conservation under application role including negative privilege, concurrent replay and rollback. Stage migration 269–272 only on an isolated latest Production restore with rigorous privileges and existing application compatibility before live rollout.
4. Run exact candidate Test member/admin real authenticated sessions, all v530 routes ×5, schema/role parity, backup/restore, single scheduler leader, zero-downtime canary and rollback; then deploy and prove the exact public Production SHA.
5. Until these gates pass, GitHub Production image run 38942314503 is **IMAGE_READY only**, not PRODUCTION_VERIFIED. No Production DB write, permission change or Nginx cutover was performed in this work.

**Limited exceptions:** inherited noncritical lint/performance warnings may be reviewed by scoped documented risk acceptance; financial provenance, release identity, session and role safety cannot be falsified or dismissed.
