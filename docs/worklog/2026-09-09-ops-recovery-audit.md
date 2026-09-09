# Production and recovery audit — 2026-09-09

## Status

- [x] Re-check current application `main` and open PRs.
- [x] Re-check the authorized mini PC runtime topology.
- [x] Confirm Flux source and Kustomizations are healthy.
- [x] Confirm production image revisions and public smoke endpoints.
- [x] Inspect the residual test namespace before taking action.
- [x] Remove the non-functional test namespace after confirming it had no DB/PVC/secret/backend/route.
- [x] Inspect separate backup media and newest available backup timestamps.
- [x] Perform a non-mutating FAT filesystem check on the read-only backup SSD.
- [x] Create and checksum a temporary emergency PostgreSQL custom-format dump on the system disk.
- [x] Verify the emergency archive is structurally readable with `pg_restore -l`.
- [x] Record release/deployment residuals in #126 and recovery risk in #139.

## Production runtime

The online authorized mini PC is `minipc`, running NixOS. It provides `kubectl`, `flux`, and `ctr`; there is no Docker CLI. This confirms Kubernetes/Flux remains the authoritative production runtime rather than the repository's older Docker Compose/SSH deployment procedure.

Flux was re-checked after the earlier reconciliation incident. `gitrepository/flux-system` and all application/infrastructure Kustomizations were `Ready=True` at `main@sha1:983f2c56`. Production `wdmvp` workloads were Ready:

- backend: `ghcr.io/wtrdd1-hash/wdmv/backend:ffcdc5b0d2878639639ca48747f09ed8532da4d7-production`
- frontend: `ghcr.io/wtrdd1-hash/wdmv/frontend:ffcdc5b0d2878639639ca48747f09ed8532da4d7-production`
- PostgreSQL: `postgres:17.11-alpine`

Public smoke checks returned HTTP 200 for `/`, `/status`, `/robots.txt`, and `/sitemap.xml`.

## Test environment

The residual `wdmv-test` namespace was not a usable test stack. Before removal it contained only a single frontend Deployment and Service pointing to `23226900...-test`. The Pod was `ImagePullBackOff`. There was no ingress/HTTPRoute, backend, DB, PVC, application Secret, or isolated data boundary.

Because it contained no usable test service or persistent test data, the namespace was deleted. Release reporting must now state that there is **no dedicated test server** until a complete isolated GitOps-managed test stack is deliberately recreated. CI, PostgreSQL-backed checks, build/security gates, and staged smoke procedures remain the strongest available pre-production verification in the meantime.

## Backup and recovery

The designated separate backup SSD is `/dev/sda1` mounted at `/mnt/backup`. It was observed as `vfat` with read-only mount options. The newest backup files on that medium are from 2026-09-07.

A non-mutating `fsck.vfat -n /dev/sda1` reported a free-cluster summary mismatch and left the filesystem unchanged. No process was found using the mount at the time of inspection. The available remote execution policy did not permit the unmount/remount operation required for a safe repair, so the filesystem was not modified.

An emergency same-host PostgreSQL backup was created at `/home/wtrdd/backup-staging/moneyverse-production-20260909-0915.dump` using custom format. Its SHA-256 sidecar validates successfully, and `pg_restore -l` parsed the archive through its final foreign-key entries. This staging copy is **not** a substitute for separate-media backup because it is on the same system disk as the service.

Issue #139 tracks repair/replacement of the backup medium, transfer and checksum verification of the current dump to separate media, scheduled Kubernetes-native backups, and restore rehearsal. Until that recovery path is restored, schema-changing or destructive production operations remain gated.

## PR cleanup

- PR #125 was closed without merge because its useful data-audit design was wired into the obsolete Docker Compose deployment path. It should be reimplemented as a Kubernetes/GitOps-native audit and backup gate.
- PR #128 was closed because its current-state wording said Flux was unhealthy; the valid residual findings remain tracked in #126/#127/#139.
- PRs #131 and #135 were superseded by the current-main documentation PR that preserves their valid findings while updating the actual deployment state.

## Remaining highest priorities

1. Repair or replace the separate backup medium and copy/verify the current PostgreSQL dump there (#139).
2. Replace/retire the obsolete Docker Compose `deploy.yml` and define one authoritative Kubernetes/GitOps release contract (#126).
3. Recreate a complete isolated test stack only when frontend, backend, DB, secrets, routing, image lifecycle, and readiness gates can all be maintained deliberately.
4. Add Kubernetes-native data-integrity audit, scheduled encrypted backups, alerting, and restore rehearsal as release gates.
