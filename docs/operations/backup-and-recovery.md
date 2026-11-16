# Backup & Recovery

> Current Debian/systemd authority: v2026.09.17.174. Historical Docker backup scripts remain reference-only unless explicitly adapted and revalidated.

## Current automated backup contract

The authoritative Debian host runs `/usr/local/lib/moneyverse-backup/moneyverse-backup.sh` through `moneyverse-backup.service` and `moneyverse-backup.timer` for a six-hour encrypted backup cycle. The protected set is the authoritative PostgreSQL logical database plus the production photo object directory.

Default runtime contract:

- database container: `woldeok-moneyverse-dev-db-1` (legacy container name; current backend DB authority is still validated separately);
- photo source: `/srv/moneyverse-data/images/photos`;
- encrypted backup destination: `/var/backups/moneyverse`;
- encryption secret: `/etc/moneyverse/backup.key`, root-only mode `0600`, never committed;
- cadence: 00:20, 06:20, 12:20, 18:20 local time with up to 10 minutes randomized delay;
- retention: 14 days;
- archive format: `moneyverse-backup-v1`.

## Failure-domain guard

A backup must not silently share the same filesystem as either database data or photos. The script resolves the Docker PostgreSQL host mount and the photo source with `findmnt`; if `BACKUP_DEST` resolves to either source device, backup creation fails closed.

On the verified 2026-09-17 host, database data and photos are on `/dev/sdb1`, while `/var/backups/moneyverse` is on `/dev/sda1`. This protects against failure of the application-data disk, but both disks are still attached to one VM. Therefore this is **separate-disk local recovery**, not verified off-host disaster recovery.

## Encryption and verification

Each run creates a PostgreSQL custom-format dump and a zstd photo archive, records a manifest, computes internal SHA-256 checksums, packages the set, encrypts it using OpenSSL AES-256-CBC with PBKDF2/SHA-256, and writes a second SHA-256 checksum for the encrypted archive.

A run is successful only after `moneyverse-backup-verify.sh` confirms the encrypted checksum, decrypts the package, verifies all internal checksums, validates the PostgreSQL dump with `pg_restore -l`, tests the zstd photo archive, and confirms the format marker. Plaintext staging data is removed after the run.

## Restore and drill policy

Do not restore directly into Production as a verification shortcut. Restore drills use an isolated disposable PostgreSQL target and disabled outbound email/Discord/webhook/indexing paths. Validate migration parity, ledger/balance invariants, entitlement/provenance, representative photos, and expected application read paths before a backup may be called `VERIFIED_RESTORABLE`.

A production restore requires explicit scope, backup identity/checksum evidence, source/target identity, rollback target, and operator/audit record. Never delete Docker volumes merely to force a restore.

## Remaining P0: off-host disaster recovery

The automated local separate-disk backup is not sufficient for host, hypervisor, site, credential, or ransomware failure. P0 remains open until encrypted immutable/off-host copies exist on an independent failure domain and a scheduled isolated restore proves measured RPO/RTO. Suitable targets include a separately administered NAS/object store with versioning/retention lock and credentials unavailable to the application runtime.


## Verified miniPC incident remediation — v2026.11.17.1 (2026-11-17 KST)

**Observed live host overrides 2026-09-17 historical device labels.** Current PostgreSQL data mount is `/dev/sda1` (`/srv/moneyverse-data/db-rebuild-v1202/pgdata`), and encrypted backup destination `/var/backups/moneyverse` is `/dev/sdb1`. Both are local to the same host; **off-host DR is still unverified**. Active NestJS and Spring API process DB endpoints resolve to `127.0.0.1:5433/woldeok_moneyverse_dev`, matching Docker `woldeok-moneyverse-dev-db-1` despite its legacy `dev` name.

- The separate `moneyverse-backup.timer` is enabled and active. Last inspected run on Nov 17 00:26:14–00:26:32 KST returned systemd success and verified SHA-256/contents (PostgreSQL custom dump, photos archive, manifest). It retains encrypted archives for 14 days. The archive root is `0700` and backed by a different filesystem from the DB. Most recent archive was 184,664,272 bytes; 60 encrypted archives existed during inspection.
- The obsolete `debian` user 04:00 cron invoked a **retired and non-executable** `backup-r2-free.sh`, repeatedly producing `Permission denied`. Do not make this script executable: it previously handled plain gzip DB exports. On Nov 17, after preserving the original crontab in a restricted local task record, the exact legacy line was removed using a reviewed private host-only cleanup script (retained in the private task record). The six-hour systemd timer was not altered. Run the utility as the `debian` account; default mode is read-only `--dry-run`. It removed only the exact matching line and preserved unrelated cron jobs. Source control intentionally does not contain the mutation-capable shell script under the repository secret-script policy. Run the read-only `node scripts/backup/check-legacy-cron.mjs` to detect regressions without altering the crontab. The historic cron error log remains as evidence.
- **Independent restore smoke PASS:** encrypted archive `moneyverse-debian13-20261116T152614Z.tar.zst.enc` passed the ciphertext SHA-256 check and was streamed decrypted directly into a disposable PostgreSQL 17 container with `--network none`, capped resources, and no published ports or production credentials. `pg_restore` completed with `--no-owner --no-acl --exit-on-error`. The restored DB was 1,653 MB with 276 public tables, 943 ledger transactions, 1,950 postings, and 43 account balances. The disposable container and private database files were removed. **This is an isolated full dump restore smoke, not complete financial invariant, migration parity, photo readback, full application E2E, or DR certification.**
- Existing `moneyverse-telegram-alerts.timer` monitors `moneyverse-backup.timer` and `moneyverse-backup.service` state/result; alert configuration has a paired chat. This session ran 16 bridge regression tests without failures, but did not induce a real incident or verify external Telegram delivery. Continuous backup freshness, off-host replication, retention locking, and full DR exercise remain separate acceptance gates.
- Off-host target/credentials were not verified on the miniPC. No remote backup upload was attempted and no claims of externally immutable copies are made. An operator must provision an independently administered, versioned/immutable destination and encrypted-only restricted copy, then verify remote digest and independent restore before closing the off-host P0.
- The current admin system-log viewer was already merged to main in #3201. This backup fix does not replace, alter, or deploy that application component.

**Release discipline:** this was a narrowly scoped host crontab repair, not a Next/Nest/Spring application release. Require separate exact-SHA Test and production gates for any future executable backup/alert pipeline change. Reference GitHub issue #1066 and worklog `docs/worklog/2026-11-17-backup-recovery-v2026.11.17.1.md`.
