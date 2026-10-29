# v2026.10.29.1202 — Isolated database reconstruction runbook

## Authority, scope and source
User explicitly accepts existing financial table write privileges; **preserve grants**, do not equate grant presence with the observed historical discrepancy. Existing authoritative PostgreSQL financial schema, journal and user balances are preserved; this is a rebuilt isolated copy, NOT a live source reset or a Production cutover. Source read-only consistent dump. The source container is named `woldeok-moneyverse-dev-db-1` but prior integrated planning explicitly warns that Production API may share this DB; never infer isolation from its name.

Baseline `origin/main` 2ac90063; isolated branch `feat/database-rebuild-v2026.10.29.1202`. Avoid changes to other worktrees and Gemini's branches.

## Completed reconstruction
- Source: PostgreSQL 17.11, database `woldeok_moneyverse_dev`; `pg_dump -Fc` read-only consistent snapshot including ACL (role definitions are separately created NOLOGIN in clone).
- Storage: `/srv/moneyverse-data/db-rebuild-v1202/pgdata` bind-mounted into isolated PostgreSQL container `mv-db-rebuild-v1202`, `--network none` (no listener on host network). Snapshots `/srv/moneyverse-data/db-rebuild-v1202/source-with-acl.dump`, private permissions.
- Restore: `pg_restore --no-owner --exit-on-error`, success. Restored 247 public tables, 40 accounts, 40 account balances, 890 transactions, 1,810 postings, 552 treasury records. Source's table grants, including moneyverse_app financial DML, reproduced in clone (role objects are NOLOGIN, deliberately).
- Apply separately reviewed exact-money codec migration `293-exact-money-chunk-codec.sql` on clone only. Tested `verify/293-money-chunk-codec.sql`, PASS. No live DB mutation.
- Ledger unbalanced transaction count 0. However 24 accounts differ between stored available balance and naive signed sum of postings: MINT 1 (10,121,620), SINK 1 (474,600), USER_BANK 4 (115,416), USER_CASH 18 (9,549,604); absolute differences sum 20,261,240 WLD. These are **provisional**: opening balances, account type direction, legacy entries must be examined before labeling them data corruption. All 552 separate treasury rows have NULL `ledger_transaction_id`, requiring source-era design investigation and explicit mapping; never synthesize journal entries merely to fill this field.

## Repeatable commands (on authorized Mini PC)
`docker exec mv-db-rebuild-v1202 psql -v ON_ERROR_STOP=1 -U postgres -d moneyverse_rebuild -f /tmp/282-verify.sql`
`docker cp packages/database/verify/rebuild-finance-readonly.sql mv-db-rebuild-v1202:/tmp/rebuild-finance-readonly.sql`
`docker exec mv-db-rebuild-v1202 psql -v ON_ERROR_STOP=1 -U postgres -d moneyverse_rebuild -f /tmp/rebuild-finance-readonly.sql`

## Mandatory future cutover conditions
(1) Validate live endpoint/database mapping and production-signed backup + tested restore; (2) reconcile each historical discrepancy with opening-balance provenance; (3) classify 552 treasury records and avoid double counting; (4) review money writers, memory/Redis and atomicity (do not revoke approved financial grants); (5) same-sha authenticated Test E2E and migration parity; (6) pause/capture writers for consistent final sync and dual-ledger parity; (7) blue-green backend and reverse-proxy switch after health checks; (8) rollback preserves user accounts, sessions and the original DB. Never discard the original database before cutover verification and retention-window approval.

No Production deployment, live data changes, snapshot rebalancing or incident clearance claimed.
