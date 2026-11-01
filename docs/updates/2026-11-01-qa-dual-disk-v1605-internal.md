# v2026.11.01.1605 — Scheduled QA dual-disk cache cleanup (Internal)

Status: PRODUCTION QA OPERATIONS VERIFIED at 2026-11-01 13:49 KST; implementation merged in PR #2321 (main 561b78e). No frontend, backend, persistent database, upload, backup or ledger changes.

## Problem
Production moneyverse-qa.timer executed hourly successfully while its v1364 scratch-only cleaner reported deleted=0, bytes=0 in repeated runs on 2026-11-01. This did not clean either physical disk's broader rebuildable caches. /tmp is a separate tmpfs, not physical OS /.

## Change
- Add a strictly allowlisted regenerable-cache sweeper for / and /srv/moneyverse-data, verifying distinct physical filesystem devices before acting. Minimum age 5 days, same Unix owner, no symlinks or nested mounts, at most 2 GiB per path and 6 GiB/12 paths per run. Directories containing fresh entries are retained.
- OS: only old debian-owned compile/npm cache paths; Docker unused build cache older than 168h. No Docker images, volumes or containers are removed.
- Data: only legacy task-specific npm/compile caches with strict names; preserves worker source/worktrees, DB/WAL, QA evidence, snapshots, uploads, backups, swap, release directories.
- Emit separate scheduled_qa_dual_disk_maintenance JSON with before/after physical disk metrics, actual deleted bytes per mount, no-op outcome and >=85% pressure alert.
- Run both existing 72h QA scratch lifecycle and new two-disk maintenance from the hourly QA EXIT trap, even if HTTP smoke fails. Preserve service lock and timer schedule.

## Verification / rollout
See docs/worklog/2026-11-01-qa-dual-disk-v1605.md. Claims of production operation or reclaimed space are prohibited until runtime evidence exists. Roll back only service override 40-v1605-dual-disk.conf, preserving older drop-ins.

## Observed results (not projections)
- Operations-only v1605 service override deployed after exact merged-main SHA256 check; QA service returned success and timer remains enabled.
- Data disk: 16 expired cache entries removed in two bounded passes, 321,670,801 file bytes total.
- OS disk: 0 eligible old filesystem caches and Docker builder prune returned Total: 0B. Explicitly **no OS physical disk space reclaimed by this cleanup**.
- Remaining data disk ~88% used, ~23.27 GiB available; capacity pressure remains OPEN.
- Next automatic QA is 2026-11-01 14:00 KST. 24 HTTP checks passed; two auth-gated routes and all authenticated full functional flows not tested.
