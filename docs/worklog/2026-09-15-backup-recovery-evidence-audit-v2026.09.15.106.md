# 2026-09-15 — Backup/recovery evidence audit v2026.09.15.106

## Scope

Documentation/planning only. No runtime code, API, database, migration, infrastructure, branch policy, secret, backup device, or Production data was modified.

## Required execution order followed

1. External research: PostgreSQL current backup verification/PITR docs, CISA ransomware recovery guidance, NIST 2026 backup guidance, plus carried OWASP/Google/FTC references.
2. GitHub/main and QA evidence: read current `PROJECT_PLAN.md`/`.ko.md`, issue #139, backup/recovery docs, recovery DB worklog, current commit status/workflow visibility.
3. Planning: promoted independent backup/restore proof to a P0 data-loss gate and specified architecture, security, QA, SEO/privacy, profitability and release evidence.
4. Mid-run main recheck: `e1dce34cf3e7544d3bb3fe53a80caf992945a213`; no concurrent change was observed before documentation commits began.
5. English/Korean integrated-plan synchronization and changelog/worklog update.

## Key evidence

- Issue #139 remains OPEN. Its last recorded host inspection found `/mnt/backup` on `/dev/sda1` mounted read-only and no current Kubernetes-era automated backup on that separate medium. A verified emergency PostgreSQL custom-format dump existed on the same system disk, which is explicitly not independent disaster recovery.
- `docs/worklog/2026-09-12-cicd-db-isolation-backup.md` says the recovery-only PostgreSQL target does not replace encrypted separate-media backup and keeps #139 as a recovery risk.
- `docs/operations/backup-and-recovery.md` describes encrypted Production backup before Production-changing migrations/runtime rolls, but the open issue means that statement cannot be treated as current operational proof.
- Current GitHub combined-status lookup for the starting SHA exposed no individual statuses. Available PR-triggered workflow lookup also returned no runs, so CI/test-server success is not claimed.
- Direct fresh runtime `/status` verification was unavailable in this run; no older health snapshot is reused as current evidence.

## Planning decision

New integrated issue: `BAK-106-01 — P0 — OPEN — independent backup and restore evidence unavailable`.

Reason for severity: the project priority order places data loss/DB integrity before new functionality, and the current evidence leaves complete-host/storage failure without a proven independent recovery path. The GitHub issue itself was created as P1; the Living Plan now treats the unresolved condition as a P0 promotion/destructive-change gate without rewriting the issue history.

## Required development backlog

- DevOps/DB: select/repair an independent backup destination; configure least-privilege scheduled backup; encrypt and separate keys; expose machine-readable freshness/result evidence.
- DB: choose logical/base-backup/PITR strategy from approved RPO/RTO; if PITR, manage WAL retention/verification; preserve migration checksum evidence.
- QA: automate isolated restore from scratch; run migration parity, DB-role, application smoke, ledger and derived-balance reconciliation, object/photo sample verification.
- Security: backup/key access audit, wrong-environment safeguards, secret/log redaction, deletion/tamper protection, stale/corrupt/wrong-key/storage-full test cases.
- Release: destructive/schema-changing Production operations fail closed without current backup+restore evidence.
- Operations: alerts for stale/failed backup, checksum/decrypt/restore failure, WAL gap if applicable, key unavailable, recovery refresh failure; run documented periodic recovery drills and measure actual RTO.
- Analytics/business: measure storage/egress/compute/operator cost and avoided incident/downtime/refund/fraud/support loss; do not invent revenue.

## External reference decisions

- PostgreSQL `pg_verifybackup`: DIRECT ADOPT for integrity checking when compatible physical backups are used; explicitly retain test restore because PostgreSQL states verification cannot prove every behavior of a running restored server.
- PostgreSQL continuous archiving/PITR: DIRECT ADOPT if PITR is selected; WAL coverage becomes part of recovery evidence.
- CISA StopRansomware: DIRECT ADOPT as resilience guidance for offline/encrypted backups and regular integrity/availability testing.
- NIST SP 1339 (2026-06-17): REFERENCE/DIRECT OPERATING PRINCIPLE for integrating backups into change management and recovery exercises; Moneyverse is not characterized as an OT system.

## Security/SEO/privacy/business notes

Backup artifacts, checksums, storage paths, keys and restore controls remain private/non-indexable and outside public sitemaps. Public status may expose a safe high-level backup-health category/timestamp only if truthful; it must not expose backup location, credentials, host topology, user/economy data, or recovery keys.

Business model is cost avoidance: backup/recovery has zero direct revenue. Scale decisions use approved RPO/RTO/restore-success evidence versus storage/key-management/drill/operator cost and expected incident loss.

## Carried blockers

P0 OPEN: `AUTH-105-01`, `QA-104-01`, `REL-104-02`, plus new `BAK-106-01`.
P1 TODO: `AUTH-105-02`, `REL-104-03`.

## Integration state

English/Korean changelog and worklog were created on `main`. The integrated plan update uses the same v106 policy and must preserve all prior v105 feature/security/SEO/profitability contracts. Main is rechecked before final reporting; no force update is permitted.
