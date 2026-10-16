# Dual-disk cleanup and release safety — v2026.10.17.749

Status: STARTED — source/data-safe host maintenance; no production app cutover claimed.
Started (KST): 2026-10-17 00:48:13 KST
Starting origin/main: 8e654a81c1d1b9c5c31ce458becac68b09715062
Isolated branch: ops/dual-disk-safety-v2026.10.17.749
Data-disk worktree: /srv/moneyverse-data/build-workspaces/dual-disk-safety-v2026.10.17.749
Concurrent PRs #892/#898 and other workers remain untouched.

## Start inventory
- /dev/sdb1: root Debian ext4, 99GiB effective, ~86GiB used, ~8.1GiB free (92%).
- /dev/sda1: separate ext4 /srv/moneyverse-data, 197GiB effective, ~102GiB used, ~87GiB free (54%).
- /srv/moneyverse-tasks about 25GiB of test workspaces on root; historical individual .next outputs total multiple GiB.
- Production/Postgres/backup/release directories on /srv/moneyverse-data are explicitly outside the cleanup set.
- Current main and canonical documentation policy / project plan / integrated master / deployment flow reviewed.

## Intermediate findings
- Retired Next.js `.next` caches: 7 from historic v606/v618/v630/v634/v711/v20261015 audits, then 8 more from v631/v638/v639/v640/v651/v653/v654/v685. No executing processes identified for their task names. Exact 15 paths, pre/post sizes and filesystem stats in `host-cleanup-v749-evidence.txt`.
- Root used bytes 92,164,472,832 → 84,988,256,256; reclaimed 7,176,216,576 bytes (~6.68 GiB); root 92% → 85%. Data disk approximately 55% used throughout.
- Introduced scoped, **read-only** dual-device storage preflight and 5 unit tests (RED missing module then GREEN 5/5); integrated tests with npm/pnpm test entrypoint. New isolated worktree itself lives on 200GB data disk.
- Runtime source/prod verification initially failed nonprivileged `EACCES`; re-ran with approved `sudo -n` read access and both Production v717 and Test v735.2 source/manifests/frontend/backend/public versions matched.
- Financial snapshot initial missing `pg` from isolated worktree (not a DB failure); wired only isolated developer symlink to existing read-only dependency path, then reran read-only financial gate against approved runtime env: BLOCKED, five protected app-write grants, 19 uncertain account openings (+4,779,188 WLD), five balances with no posting (+2,627,807 WLD); 0 posting imbalances. No live DML or migrations.

## Completion evidence
- Local unit tests and storage CLI pass; actual `--strict` intentionally returns 2 while root remains at 85% WARN.
- Exact-current-main code tests/build, CI PR status, all authenticated v530 QA and current-candidate Test promotion **not yet verified** at this audit point. Retain explicit BLOCKED on Production promotion due money/DB integrity; no rollout/feature-switch or DB write.
- A documented temporary review exception is only appropriate for nonfinancial cosmetic/lint issues; cannot waive asset integrity.
- Recheck origin/main before integration.
