# Moneyverse database construction and reconstruction — v2026.10.29.1204

**Status:** isolated database constructed and restored; NOT cut over to Production. English canonical; [Korean instructions](DATABASE_REBUILD_CONSTRUCTION_RUNBOOK_v2026.10.29.1204.ko.md). This is the actual build procedure, not merely an audit report.

## 0. Rules, prerequisites, and exact assets

- Preserve user-approved financial table write privileges. Never revoke `moneyverse_app` DML just because a grant exists. Preserve existing accounts, balances, identities, sessions, journal and historical treasury rows.
- First read `AGENTS.md`, `docs/DOCUMENTATION_POLICY.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `packages/database/README.md`, `docs/operations/database-rebuild-v1202.md`. Fetch and compare `origin/main` before and during code changes; use separate worktrees to avoid concurrent-agent conflicts.
- Actual observed source instance: container `woldeok-moneyverse-dev-db-1`, database `woldeok_moneyverse_dev`, PostgreSQL **17.11**. Despite “dev” in its name, integrated planning warns a Production API may share it. Treat it as live/irreplaceable; only consistent read-only export is permitted.
- Actual secondary disk: `/dev/sda1`, ext4, mounted `/srv/moneyverse-data`. Source database bind mount `/srv/moneyverse-data/postgres:/var/lib/postgresql/data`. Isolated reconstruction: `/srv/moneyverse-data/db-rebuild-v1202/pgdata:/var/lib/postgresql/data`. During inspection disk utilization about 79%. Never format, repartition, chown, clear or move the source mount.
- Rebuilt instance: container `mv-db-rebuild-v1202`, database `moneyverse_rebuild`, PostgreSQL `postgres:17.11-alpine`, `--network none`, no published TCP port and no application attached.

## 1. Inspect disk and source without modifying them

```bash
lsblk -f
df -h /srv/moneyverse-data
docker ps --filter name=woldeok-moneyverse-dev-db-1
docker inspect woldeok-moneyverse-dev-db-1 --format '{{json .Mounts}}'
docker exec woldeok-moneyverse-dev-db-1 sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

Check mount UUID and `/etc/fstab` separately before relying on boot persistence; do not alter mount configuration in this run. Confirm source's application and backup window. `pg_dump` provides a transactionally consistent logical snapshot, **not** a live replication/cutover stream.

## 2. Create a dedicated build worktree and immutable source snapshot

Observed implementation used two isolated Git branches: `fix/ledger-storage-v2026.10.29.1201` (money JSONB codec) and `feat/database-rebuild-v2026.10.29.1202` (full restoration/audits). At a fresh setup, branch names must be unique rather than reusing already-existing branches.

```bash
# The following creates paths on the secondary disk only.
sudo install -d -m 0700 /srv/moneyverse-data/db-rebuild-v1202
# Executed on the authorized Mini PC host; never echo database secrets.
docker exec woldeok-moneyverse-dev-db-1 sh -c \
  'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc --no-owner' \
  > /srv/moneyverse-data/db-rebuild-v1202/source-with-acl.dump
chmod 0600 /srv/moneyverse-data/db-rebuild-v1202/source-with-acl.dump
```

`--no-owner` omits original object-owner ALTER commands; it **does not omit GRANTs**. Do **not** add `--no-acl` to the restore source, because user requires preserving financial writer grants. A second `--no-owner --no-acl` dump was saved as `source-snapshot.dump` for comparison only. In the executed run, the files were about **101 MB** (ACL copy) and **100 MB** (no-ACL copy). Backups contain private member data: never commit or publish them. Secure backup access and test restoration.

## 3. Create physical PostgreSQL storage on the secondary disk

```bash
sudo install -d /srv/moneyverse-data/db-rebuild-v1202/pgdata
# Use a secret supplied outside Git/log files for the new isolated test DB.
docker run -d --name mv-db-rebuild-v1202 --restart=no --network none \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD="$ISOLATED_REBUILD_PASSWORD" \
  -e POSTGRES_DB=moneyverse_rebuild \
  -v /srv/moneyverse-data/db-rebuild-v1202/pgdata:/var/lib/postgresql/data \
  -v /srv/moneyverse-data/db-rebuild-v1202:/restore:ro \
  postgres:17.11-alpine
docker exec mv-db-rebuild-v1202 pg_isready -U postgres -d moneyverse_rebuild
```

Run only if the container and directory do not already exist. The actual executed container used a disposable test password, never a reusable Production secret. Bind mounted `pgdata` is **not** an in-memory database, so data persists across a normal container restart; `--network none` isolates this reconstruction from the application. Note that `--network none` also prevents application-level end-to-end access; a separate properly isolated Test topology is required before cutover.

## 4. Recreate required roles, then restore complete schema and data

```bash
docker exec mv-db-rebuild-v1202 psql -v ON_ERROR_STOP=1 -U postgres -d moneyverse_rebuild \
  -c 'CREATE ROLE moneyverse_app NOLOGIN; CREATE ROLE moneyverse_migrator NOLOGIN; CREATE ROLE moneyverse_minecraft_executor NOLOGIN; CREATE ROLE moneyverse_reconciler NOLOGIN; CREATE ROLE moneyverse_status_collector NOLOGIN;'
docker exec mv-db-rebuild-v1202 pg_restore --no-owner --exit-on-error \
  -U postgres -d moneyverse_rebuild /restore/source-with-acl.dump
```

These specific role objects were created **NOLOGIN** in the clone to avoid enabling new network credentials. Source table ACLs are restored, including the approved `moneyverse_app` INSERT/UPDATE/DELETE/TRUNCATE on finance tables. Role membership/login credentials are *not* fully reconstructed by a per-database `pg_dump`; any future cutover requires a separately audited `pg_dumpall --globals-only` review and authorized credential provisioning. Do not reuse Production passwords or assume that restoring GRANT statements restores global roles automatically.

Actual command returned `RESTORE_EXIT:0`. There were **247** public tables, **40** accounts, **40** stored balances, **890** ledger transactions, **1,810** ledger postings, and **552** separate treasury entries.

## 5. Apply additive structure changes on isolated clone only

- Migration `292-ledger-postings-transaction-fk-index.sql` adds index `public.idx_ledger_postings_transaction_id` on the referencing side of `public.ledger_postings(transaction_id)`; it does not change rows, monetary balances or GRANTs.
- Migration `293-exact-money-chunk-codec.sql` implements JSONB exact integer `base=1000000000` transport functions `money_to_chunks(numeric)` and `money_from_chunks(jsonb)`. `NUMERIC` journal remains authoritative; JSONB is a versioned interchange representation, **not** a parallel authoritative balance.
- Source branches originally tested 293 with filename 282; it was renamed to **293** when the existing main `282-verified-help-center.sql` was discovered. Do not edit already-applied migration filenames/checksums in an active database. Migration ID coordination and full runner ordering need independent acceptance before applying to shared DBs.

```bash
# These paths are from a checked-out branch containing the relevant files.
docker cp packages/database/migrations/292-ledger-postings-transaction-fk-index.sql mv-db-rebuild-v1202:/tmp/292.sql
docker exec mv-db-rebuild-v1202 psql -v ON_ERROR_STOP=1 -U postgres -d moneyverse_rebuild -f /tmp/292.sql
# Use the 293 codec file from PR #1808 or merged main once actually present:
docker cp packages/database/migrations/293-exact-money-chunk-codec.sql mv-db-rebuild-v1202:/tmp/293.sql
docker exec mv-db-rebuild-v1202 psql -v ON_ERROR_STOP=1 -U postgres -d moneyverse_rebuild -f /tmp/293.sql
```

Original isolated test applied the exact codec SQL before its filename was renumbered; verify the final canonical filename in a complete migration-chain replay rather than pretending it was deployed to Production.

## 6. Test structural keys, journal rules, ACL and financial evidence

```bash
docker cp packages/database/verify/rebuild-finance-readonly.sql mv-db-rebuild-v1202:/tmp/rebuild-finance-readonly.sql
docker exec mv-db-rebuild-v1202 psql -v ON_ERROR_STOP=1 -U postgres -d moneyverse_rebuild -f /tmp/rebuild-finance-readonly.sql
docker cp packages/database/verify/292-financial-schema-integrity.sql mv-db-rebuild-v1202:/tmp/292-verify.sql
docker exec mv-db-rebuild-v1202 psql -v ON_ERROR_STOP=1 -U postgres -d moneyverse_rebuild -f /tmp/292-verify.sql
# In the codec branch or integrated main:
docker cp packages/database/verify/293-money-chunk-codec.sql mv-db-rebuild-v1202:/tmp/293-verify.sql
docker exec mv-db-rebuild-v1202 psql -v ON_ERROR_STOP=1 -U postgres -d moneyverse_rebuild -f /tmp/293-verify.sql
```

Measured result: PK **243**, FK **285**, UNIQUE **110**, CHECK **586**; unvalidated constraints **0**, invalid indexes **0**, ordinary tables without primary key **0**, disabled user triggers **0**. Transaction-wise signed posting delta nonzero **0**; malformed or unposted transactions **0** in the isolated snapshot. Strict JSONB money codec round-trip test passed on the isolated restore. Role grants retained.

Historical differences **not repaired**: naive stored-balance vs signed-journal aggregate differs for **24** accounts (absolute sum **20,261,240 WLD**) and **552** treasury-side records have NULL `ledger_transaction_id`. These do not independently prove corruption without opening balance, account polarity, previous migration provenance and treasury bookkeeping. Never synthesize balancing entries or overwrite balances to make the metric green. Investigate all relevant FK indexing, replay/idempotency races, caches and business writers separately.

## 7. Runbook for actual Test/Production migration (NOT performed)

1. Validate the real Production/official Test endpoint-to-DB bindings and recoverable backup with restore tests. Do not mistake `woldeok_moneyverse_dev` for a harmless isolated playground.
2. Perform full main/branch migration checksums and ordered replay (292, 293 and any concurrent changes). Confirm all roles, grants and their dependencies, extensions, collations, and schema ownership.
3. Investigate and resolve/prove historical 24-account and 552-treasury-link differences with individual receipts. Validate bank, mint and central-bank money flows; preserve user-approved write permissions.
4. Build a separate network-isolated Test application pointing only at the rebuild, run authenticated end-to-end money flows, idempotency/concurrency tests, cache restart tests, complete backend and CI gates, and signed balance/source parity.
5. For a real cutover, coordinate writers and incremental/synchronized data transfer: a `pg_dump` snapshot taken earlier will become stale. Test final synchronization and protect the original data as a rollback source.
6. Only then execute blue-green application/DB promotion with verified health, live session continuity, immutable audit and tested rollback. This run **did not** perform any of these steps.

## 8. Change log and references

v1201 exact money codec [PR #1808](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1808); v1202 restored second-disk clone and audited source; v1203 key checks and referencing FK index [PR #1809](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1809); v1204 this actual rebuild construction manual. Supporting worklogs at `docs/worklog/2026-10-29-ledger-storage-v1201.*`, `2026-10-29-financial-keys-v1203.*`, and `docs/operations/database-rebuild-v1202.*`. No original DB writes, Production promotion or live finance changes were performed.
