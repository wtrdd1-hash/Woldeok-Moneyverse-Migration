# Backup & Recovery

> Current Debian/systemd authority: v2026.09.17.174. Historical Docker backup scripts remain reference-only unless explicitly adapted and revalidated.

## Current automated backup contract

The authoritative Debian host uses `ops/backup/moneyverse-backup.sh` and `moneyverse-backup.timer` for a six-hour encrypted backup cycle. The protected set is the authoritative PostgreSQL logical database plus the production photo object directory.

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
