# Migration 349 execution prerequisite

Migration 349 repairs creator-specific PostgreSQL default privileges. Its executor must already own or be authorized to act as BOTH existing creator roles (`postgres` and `moneyverse_migrator`), and must own or control both ledger tables. Existing role names alone do not prove that authority.

Before running the migration, the authorized database operator must verify the actual migration connection identity and `pg_has_role(current_user, creator, 'USAGE')` for every creator that exists. A false result is a hard stop. Do not grant role membership, make a role superuser, skip a creator, or suppress the error to pass this gate. Have the existing authorized database owner perform the reviewed repair through the approved migration procedure instead.

Read-only observation on 2026-11-20 found the connected database's `moneyverse_migrator` already has `rolsuper=true` and can act as `postgres`; no privileges were changed by this task. This is existing elevated authority, not evidence that a least-privilege migration account could run the same DDL. Migration 349 was absent from the inspected migration registry. The release operator must recheck the actual promoted runtime/database identity; this observation cannot certify a later connection.

The disposable PostgreSQL regression must exercise both refusal under an unauthorized migrator and successful repair/rerun under an already authorized operator. Shared or production databases are not regression fixtures. Production application/DB identity, migration checksums, backup/restore, exact-source isolated Test and release approval remain independent gates.
