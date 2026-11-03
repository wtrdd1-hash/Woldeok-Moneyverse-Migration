# v2026.11.03.DB-AUDIT.1 — DB integrity audit worklog (EN)
## START
- 2026-11-03 KST: user requested live database structure/keys and systemic defect assessment. Read priority integrated docs, source migrations, national pension/treasury worklogs. Work read-only; existing other-agent security worktree left untouched.
## MID
- miniPC source DB `woldeok_moneyverse_dev`, PostgreSQL 17.11. 266 PK / 318 FK / 126 unique. 891 ledger transactions / 1829 postings / 42 balances, imbalance 0. 1546 archived records, SHA256 mismatch 0.
- Confirmed explicit app ACL destructive privileges, 2 legacy currency `W` accounts, 167 unindexed single-column FK candidates, 5 SQL migration checksum drifts, pension CASCADE risk, no persisted reconciliation runs.
- Re-fetched main `45599a6a49668c646dd70f36cbd1a3e7bfe08f92` while another developer was active. Production pointer v1651, active backend/frontend and Treasury overview 200. No functional payout claim.
## END
- Published audit findings and remediation ordering in isolated GitHub branch, without DB writes, ACL grants, application source edits, deployment, or merge. All errors remain **open / not fixed**. GitHub PR is evidence-only.
