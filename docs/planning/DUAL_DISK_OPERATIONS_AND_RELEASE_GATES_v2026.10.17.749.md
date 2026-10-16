# Dual-Disk Development, Safe Cleanup and Release Gate Plan — v2026.10.17.749

**Status:** PROPOSED storage/release plan; **IMPLEMENTED / TEST_VERIFIED** read-only monitoring utility and scoped historic-cache cleanup; **Production application promotion: BLOCKED**.
**Date:** 2026-10-17 KST. **English canonical** | [한국어](DUAL_DISK_OPERATIONS_AND_RELEASE_GATES_v2026.10.17.749.ko.md)
**Authority:** [project plan](PROJECT_PLAN.md) → [integrated master](INTEGRATED_PLANNING_MASTER.md) → adopted detailed specs; [documentation policy](../DOCUMENTATION_POLICY.md). This independent design is not an unreviewed override of v523/v542/v543 financial or v530 QA authority.

## 1. Actual host inventory and ownership

2026-10-17 miniPC `lsblk`/`df` established **two different physical disks** and ext4 partitions:
- `/dev/sdb1` (100GB physical / ~99 GiB effective): `/`; OS, Docker, old task worktrees, CI/build caches. Starting filesystem usage 92%, 8.1GiB free.
- `/dev/sda1` (200GB physical / ~197 GiB effective): `/srv/moneyverse-data`; PostgreSQL data, image assets, current/retired immutable releases, backups and vendor assets. At inventory 54–55%, ~86GiB free.
- `/srv/moneyverse-tasks` is on **system root**, not data partition; it held ~25GiB of historical build tasks. A path starting with `/srv` is not automatically on the data disk.
- Active public Production manifest/source `176ca04ecfbd673e7f1057cdf83a9b92ea8f8272` (v717), Test `9618a2499328d207c9e34b969f6aa96121331749` (v735.2). Independent privileged read-only runtime-identity preflight passed for both. Historic generic v600 systemd units can coexist; their presence **does not establish public ingress runs v600**.

## 2. Executed safe cleanup: explicit manifest and reproducible evidence

Two scoped batches removed **15 historical Next.js `.next` build outputs only** under `/srv/moneyverse-tasks`; source files, lockfiles, Git objects, node_modules, current Test/Prod runtime, actual WLD/DB, immutable release assets and backup directories were not removed. Process-name evidence was checked for each selected historical task and their cache path validated.

`/dev/sdb1` before: used **92,164,472,832 bytes**, available **8,695,623,680 bytes**, **92%**.
After: used **84,988,256,256 bytes**, available **15,871,840,256 bytes**, **85%**.
Recovered **7,176,216,576 bytes** (approximately **7.18 decimal GB / 6.68 GiB**). Source: `docs/worklog/host-cleanup-v749-evidence.txt`, containing each exact selected path and before/after `df -B1`.

Cleanup is not claimed to be a Production release; deleted build outputs are reproducible from source. **The remaining 85% root usage is still WARN**. No additional arbitrary deletion is permitted without an ownership/recovery check.

## 3. Two-drive development standard

1. Put **new isolated development/review worktrees** into `/srv/moneyverse-data/build-workspaces/` on `/dev/sda1` where permissions allow; keep canonical repo at its current unchanged path and do not move active service paths.
2. Keep PostgreSQL and release/backup directories on their existing data filesystem. No live DB move, WAL relocation, swap change, cross-device rename of open files, or changing DB mount permissions as part of this cleanup.
3. Assign separately budgeted directories for disposable build/test caches versus immutable releases and backups. Stage/cache eviction candidates must be measured against the actual mounted filesystem, not directory names.
4. **Reserve capacity for DB growth, WAL, backups and rollback** before using data-disk headroom for new worktrees; as an initial **planning guard**, stop adding ephemeral workspaces when the data filesystem reaches 80% occupancy; root warning at 85% / investigate urgently when >90%. Set specific GiB reserve after observed backup size and DB growth measurements.
5. Retention order: identify owner/SHA/age and active process → prove cache is regenerable and not a runtime release → inventory exact paths and bytes → delete only allowlisted build-only artifacts → run `df`, services and checks → record recovered space. No wildcard removal of production releases, DB snapshots, pg_wal, Docker volumes, secrets or unmerged agents' worktrees.
6. Future release staging must verify independent real filesystem free bytes before unpack/build, and keep last verified old application generation until new backend/frontend/auth/sessions are accepted. Do not automatically promote docs-only changes.

**Implemented read-only monitor:** `node ops/storage/dual-disk-check.mjs [--json] [--strict]`. It uses `statfsSync` and `statSync(...).dev` for actual mounts, reports separate filesystem layout, root/data pressure and stable exit code. This only proves **distinct filesystem device IDs**, not physical-spindle count (which was separately observed using `lsblk`). `--strict` returns 2 for storage pressure; no filesystem changes, no cleanup action. Tests at `ops/storage/dual-disk-check.test.mjs` cover block accounting, device identification, conservative cleanup path validation and warnings. Test first failed when implementation absent (RED), then passed 5/5 (GREEN).

## 4. Mandatory remediation and release sequence

| Gate | Deliverable | Current evidence and decision |
|---|---|---|
| G0 Disk/host safe capacity | Baseline/candidate manifests, backup inventory, read-only monitor, disposable cache receipt | Maintenance executed; root still 85% warning. Re-run monitor and compare `df` at release time. |
| G1 Finance/DB P0 | Certify 19 discrepant opening/account balances by real previous balance/legacy journal evidence; ensure 5 core tables are not directly writable by app role; transactional narrow definer commands with SQL-negative, concurrency, idempotency tests | **BLOCKED**: new 2026-10-17 read-only `verify-financial-readiness` returned 5 core directly writable tables; 40 account balances, 19 unexplained projections (+4,779,188 WLD), 5 accounts without any posting (2,627,807 WLD). Zero unbalanced transactions does **not** settle opening balance provenance. Connection identity `woldeok_moneyverse_dev` as used by runtime environment; name alone does not establish isolation. No compensating mint, grant changes or live fund writes. |
| G2 Code/functional P0 | Unmerged money/treasury candidates separately rebased and reviewed; migrations compatible with actual schema; genuine role-bound E2E; full v530 member/admin responsive five-pass coverage | **BLOCKED**, existing draft money fixes #892/#898/#871 overlap and are not release-certified. |
| G3 CI & isolated exact candidate Test | Static/tests/build/security, immutable test release with same source/DB migration identity and legal separate job ownership; recoverable sessions and negative cases | Current public Test is v735.2 and main has advanced to v747; Test is not exact current main candidate. Rebuild and restart only through existing Test deployment authority, never cut over prematurely. |
| G4 Production | Zero-downtime replacement canary, exact SHA readiness, auth session preservation, DB/ledger and rollback acceptance, public version check, fatal logs | **NOT RUN / BLOCKED by G1–G3**. Production remains v717. |
| G5 Monitor/close | Report current prod identity, after-cutover smoke, per-domain status `PRODUCTION_VERIFIED`; internal/GitHub EN/KO logs | Only after G4 evidence. |

### Reviewable exceptions (requested risk-review flexibility)

**Eligible only for documented, temporary, noncritical exceptions**: inherited lint warnings with no new errors, informational performance targets not gating financial correctness, historical cosmetic defects with safe disabled/rollback route, nonessential content backlog. Every exception needs owner, scope, duration, impact, measured fallback and explicit approval. An exception is **not** automatically an implementation or Production success.

**Not waivable without equivalent safety evidence:** unverified opening balances, unbalanced ledger/unknown money movements, unrestricted application financial DML, missing backup/restore, unverified DB migrations, financial authorization/integrity, source/version misidentification, sole healthy process stop, known session-loss cutover. A user may choose conservative feature-off/degraded operation with an evidence-backed safe rollback, not a fabricated healthy state.

## 5. Source and audit boundaries

- Private-data exposure avoided: financial preflight ran `BEGIN ... READ ONLY` and printed only aggregate records; no member identifiers or env secret values in files.
- Public traffic identity v717 and official Test identity v735.2 both passed `verify-host-runtime-identity` with privileged read-only access. A nonprivileged attempt failed `EACCES`, then was corrected with approved sudo file access; not a runtime failure.
- One initial financial-preflight tool invocation lacked the `pg` dependency from a fresh data-disk worktree (`MODULE_NOT_FOUND`). Dependency path was linked to existing immutable v717 release modules inside the isolated worktree only, and re-execution produced the above actual P0 finance blockers; no code or server change.
- Detailed financial remediation authority remains v713, v737/v743 findings, and current `PROJECT_PLAN`; this operational work **does not** resolve or waive them.
- Status split: cleanup **DONE**; monitor **IMPLEMENTED + TEST_VERIFIED locally**; storage policy **PLANNING**; current main app Test **NOT VERIFIED**; public Production promotion **BLOCKED**. No claim of full application deployment.
