# Host dual-disk cache cleanup — v2026.11.03.disk01

**Date:** 2026-11-03 08:18–08:26 KST. **Status:** HOST VERIFIED / DOCUMENTATION-ONLY GitHub candidate. [한국어](./2026-11-03-host-dual-disk-cache-cleanup-v2026.11.03.disk01.ko.md).

## Scope and authority
- Governed by `docs/DOCUMENTATION_POLICY.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, and `docs/planning/DUAL_DISK_OPERATIONS_AND_RELEASE_GATES_v2026.10.17.749.md`.
- Authorized manual host cache cleanup; not an application/source change, scheduled QA deployment, database change, Production cutover or promotion.
- Latest `origin/main` read at final verification: `846844bf0bd573f0c0f0654e27ccb44321847106`. A separate dirty local developer branch was intentionally not modified; Gemini/other worker worktrees and Git states were preserved.
- Initial host read at 08:18: root 97%, data 93%. Concurrent host reclamation before this operation changed the immediate manual preflight to root 86%, data 91%; **do not attribute this earlier change to the current operation**.

## Exact cleanup receipt
| Step | Mount | Count | Measured allocated bytes reclaimed |
| --- | --- | ---: | ---: |
| Phase 1 | `/dev/sdb1` mounted at `/` | 8 | 7,794,720,768 |
| Phase 1 | `/dev/sda1` mounted at `/srv/moneyverse-data` | 14 | 14,095,458,304 |
| Phase 2 | Data disk | 13 | 13,174,853,632 |
| **Total** | **Both physical mounts** | **35** | **35,065,032,704 (~35.07 decimal GB)** |

Only isolated historical worker Next.js `frontend/.next/cache` directories were removed. Every deleted entry was independently scanned and re-checked: root allowlist, same filesystem device, debian UID ownership, no symlinks, regular files/directories only, all nested entries at least 12 hours old, and no live process cwd inside its owner workspace. Separate quotas constrained each phase. This **manual pressure-relief choice** uses a shorter age threshold than the unchanged **5-day v1605 automatic QA cleaner**, and does not relax the scheduled policy. Six active workspaces and 33 fresh/protected cache directories were skipped; errors: 0.

Never removed DB/WAL, snapshots, backups, user uploads, QA evidence, Git source/objects, node_modules, Docker images/volumes, running services, immutable Test/Production releases or unfinished agent workspaces. Cache may regenerate when an isolated task is rebuilt.

## Runtime verification after both phases
| Check | Measured result |
| --- | --- |
| Root `/` | 79% used, 22,109,356,032 bytes available |
| Data `/srv/moneyverse-data` | 77% used, 46,726,094,848 bytes available |
| `ops/storage/dual-disk-check.mjs --json --strict` | Distinct devices; root OK / data OK |
| Backend, frontend, Nginx, QA timer | All active |
| DEV PostgreSQL container and `pg_isready` | Container healthy; accepting connections |
| Public homepage | HTTPS 200 |
| Post-clean manual allowlist dry-run | 0 eligible root/data paths; no errors |
| Scheduled QA v1605 | Unchanged and active, next 09:00 KST; 08:00 last run 24 HTTP passes, 2 authenticated routes NOT TESTED |
| Application full-route QA / Production promotion | NOT RUN / NOT CLAIMED |

## Auditable host-only evidence
`/srv/moneyverse-data/ops/disk-cleanup/` contains `v2026.11.03.disk01.md`, `v2026.11.03.disk01-phase1.json`, `v2026.11.03.disk01-phase2.json`, the dry-run JSON, and reproducible `cache-clean-v20261103.py`. These are host-local records; the GitHub note contains no private user data or secrets.

**Residual risk:** the data disk is under the 80% planning guard at the verification time, but continued worker cache generation can increase usage again. Automatic v1605 remains intentionally conservative and cannot reclaim young worker caches; a separate tested change is needed if task-completion eviction is desired. No service or deployment configuration was changed by this incident.
