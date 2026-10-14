# v2026.10.14.619 — Debian host disk cleanup worklog

Status: **FINISHED (host maintenance); documentation branch pending review/merge**. Date: 2026-10-14 KST. Workstream: `ops/disk-cleanup-v2026.10.14.619`.

## Before work
- [x] Connect using the miniPC MCP and inspect resources, mount points, release pointers, process working directories, and service/DB states.
- [x] Review `AGENTS.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md` and its Korean translation, `docs/RELEASING.md`, and release policies. Planning authority is v530; v617 is a staged artifact, not evidence of Production cutover.
- [x] Write pre-action checkpoint to `/srv/moneyverse-tasks/disk-cleanup-v619/worklog.md`.
- [x] Fetch `origin/main`; task documentation branch base: `c56af867ad8f7556e53f895b0bb294c4bfc8a02d`.
- Baseline storage: system `/dev/sdb1`: 99G total, 50G used, 45G free (53%); data `/dev/sda1`: 197G total, 80G used, 108G free (43%). Larger consumers: old immutable release copies (~48G), active 25G swapfile, AI data (~6.1G), pnpm store (~1.2G).
- Production symlink and backend/frontend CWD: `prod-v600`; initial Test symlink/CWD: `test-v617-3edef2ceb5da`. Staged `prod-v617-3edef2ceb5da` also had a running frontend process. All protected.

## In progress
- [x] First allowlisted pass: delete archived directories `prod-v581`, `v582`, `v583`, `v584`; 75G used / 114G free on data disk after pass.
- [x] Recheck live symlinks before each deletion; reject active targets; use `rm -rf --one-file-system` only on the explicitly selected obsolete release directories.
- [x] Second allowlisted pass: delete `prod-v585`, `v586`, `v587`, `v588`, `v590`, `v591`, `v592`, `v593`.
- [x] Observe another agent's new `test-v618-7fa3f245bbc3` directory and Test pointer advancement; leave the new Test deployment and all other active/staged releases untouched.
- No database, persistent Docker volume, backup, swap, AI model, source tree, running process, feature switch, or release pointer was deleted/modified by this maintenance task.

## Finished and verification
- [x] Twelve obsolete Production release directories deleted; data volume went **80G used → 54G used**, **108G free → 135G free**, **43% → 29%**. `df -h` values are rounded; net used reduction is ~26GB.
- [x] System volume stayed **50G used, 45G free, 53%**; no root-filesystem pruning was necessary.
- [x] Retain `prod-v594` to `prod-v600` (seven adjacent rollback generations), staged `prod-v617-3edef2ceb5da`, `test-v541-gsc-aa4b6387`, `test-v617-3edef2ceb5da` and new `test-v618-7fa3f245bbc3`.
- [x] Status rechecked: backend, frontend, Discord bot, MCP, Nginx, Docker **active**; Moneyverse dev DB reachable; all three Docker containers running.
- [x] Local frontend endpoints 3001/3101/3201 redirected to public Production/Test origins and returned HTTP **200** when redirects were followed. Bare 3000 returned 404 and was not counted as an application health check. No full end-to-end or financial ledger acceptance claimed.
- [x] No service restart, code deploy, schema change, or Production promotion performed.
- Full host-local before/mid/deletion log: `/srv/moneyverse-tasks/disk-cleanup-v619/worklog.md`.
- Recheck `origin/main` before integrating this docs-only branch. This report does not replace the authoritative planning master.
