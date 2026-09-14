# v2026.09.15.106 — Backup/recovery evidence and data-loss prevention audit

> Date: 2026-09-15
> Scope: planning/documentation only; no runtime/API/DB/infrastructure/security-code change

## Highest-priority finding

`BAK-106-01` is promoted to **P0 / OPEN / destructive-change release block** in the integrated plan. GitHub issue #139 is still open and records that the designated separate backup SSD at `/mnt/backup` was read-only, the newest observed files were from 2026-09-07, no current Kubernetes-era automated separate-media backup was observed, and the emergency PostgreSQL dump was stored on the same system disk. The recovery-only PostgreSQL database is useful for inspection but does not replace an independent encrypted backup.

The current `docs/operations/backup-and-recovery.md` says Production-changing migrations/runtime rolls take an encrypted Production DB/photo backup. That statement is a desired operational contract, not current proof. Until a current independent-media backup plus restore evidence is machine-verifiable, any destructive or schema/data-changing Production operation must fail closed.

## Directly adopted external references

- PostgreSQL current `pg_verifybackup`: integrity verification of a base backup is useful but does not prove that a running restore works; test restores remain required.
- PostgreSQL current continuous-archiving/PITR guidance: if PITR is adopted, WAL availability and recovery-target behavior are part of the recoverability contract, not just base-backup existence.
- CISA StopRansomware guidance: maintain offline/encrypted backups and regularly test availability and integrity in disaster-recovery scenarios.
- NIST SP 1339 (2026-06-17): backups should be integrated with change management, created regularly, tested, and exercised during recovery. Applied as operational design guidance even though Moneyverse is not an OT deployment.

## Required architecture/backlog

1. Separate **recovery convenience** from **disaster-recovery backup**. `moneyverse_recovery` may remain a read/inspection target but is not counted as a backup when it shares the failure domain or online credentials with Production.
2. Define RPO/RTO as explicit service targets backed by measurements. No numeric RPO/RTO is invented by planning; operators must choose and approve them based on acceptable ledger/user-content loss and recovery cost.
3. Back up at minimum: authoritative PostgreSQL data; migration/schema/version manifest; required object/photo storage; restore metadata/checksums; the application/GitOps version needed to interpret the backup. Secret material is backed up only through an approved encrypted key-management/recovery process, never plain text in the same archive.
4. Use an independent failure domain/off-host or otherwise independently recoverable medium; encrypted at rest/in transit; least-privilege backup identity; immutable/tamper-resistant retention where feasible; explicit key separation and key-recovery test.
5. If physical base backup/PITR is selected, verify manifest/checksums with version-matched PostgreSQL tooling and verify required WAL coverage. If logical dumps remain part of the strategy, validate `pg_restore` structure and perform a full isolated restore; logical dumps do not substitute for PITR when the approved RPO requires finer recovery.
6. Every restore drill validates: decrypt/read; target environment identity; clean isolated target; schema/migration parity; application can connect using least privilege; user/account counts and selected safe referential checks; ledger debit/credit reconciliation; derived balance reconciliation; shop/inventory/entitlement consistency; object-store sample integrity; no Production credentials/endpoints used by the restored stack.
7. Release evidence for destructive/schema-changing Production work must include backup ID, created-at, source environment/database identity, encrypted-medium location class, checksum/manifest result, restore-drill timestamp/result, migration parity, ledger reconciliation, approved RPO/RTO status, rollback target, and operator/audit ID. Missing evidence is `BLOCKED`, never skip-pass.
8. Alert on stale backup, failed backup, checksum mismatch, decryption failure, insufficient storage, restore-drill failure, WAL gap (if PITR), key-unavailable state, and recovery database refresh failure. Alerts must not contain secrets or raw personal/economy data.

## Security/privacy

New threat cases cover backup-key theft, plaintext/off-host misconfiguration, restore into the wrong environment, Production credential reuse in recovery, retention overrun, malicious/accidental backup deletion, poisoned backup/WAL, and disclosure of user/economy data through backup logs/artifacts. Backup artifacts and restore/admin endpoints are private, excluded from SEO/sitemaps, and never linked from public status pages.

## Profitability/cost efficiency

Backup/recovery has no direct revenue. Its value is expected loss avoided and recovery-time reduction. Measure backup storage/egress, encryption/key-management, restore-drill compute, operator hours and monitoring costs against incident probability × expected data-loss/downtime/fraud/refund/support impact. `SCALE` means meeting approved RPO/RTO and restore-success SLO with acceptable cost; `ITERATE` means backups exist but restore evidence or cost is weak; `HOLD` means destructive releases stay blocked; `KILL` applies to a backup path that cannot be independently restored or creates unacceptable secret/privacy risk.

## QA and release acceptance

- prove backup freshness and independent failure domain;
- verify checksum/manifest and decryption;
- restore into an isolated target from scratch;
- verify migration version/checksum and DB role boundaries;
- run application smoke on the restored target without Production endpoints;
- run ledger and derived-balance reconciliation;
- verify object/photo restore samples;
- simulate missing/corrupt backup, wrong key, stale backup, storage-full and WAL-gap states and prove fail-closed behavior;
- perform rollback rehearsal to the last known-good immutable application/GitOps state;
- record drill duration to compare with approved RTO.

## Carried blockers

`AUTH-105-01`, `QA-104-01`, and `REL-104-02` remain P0 OPEN. `AUTH-105-02` and `REL-104-03` remain P1 TODO. v106 does not weaken their acceptance conditions.

## Current evidence state

Starting and mid-run `main` remained `e1dce34cf3e7544d3bb3fe53a80caf992945a213`. GitHub issue #139 remains open. The recovery worklog states that `moneyverse_recovery` does not replace separate-media backups. Connected GitHub combined status for the starting SHA contains no status entries and the available PR-triggered workflow lookup returned no runs, so CI/test-server success is not claimed. Direct current runtime `/status` retrieval was unavailable in this run; runtime health is therefore not inferred from an older snapshot.
