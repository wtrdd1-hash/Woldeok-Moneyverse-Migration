# Host safe disk cleanup — v2026.10.17.781

**Status:** HOST CLEANUP VERIFIED; no application source, DB, feature-switch, Test or Production promotion.

**Date:** 2026-10-17 KST. [Korean](2026-10-17-host-disk-cleanup-v781.ko.md).

## Start — pre-action
- Debian 13 device: `/dev/sdb1` root (system) and `/dev/sda1` mounted at `/srv/moneyverse-data` (DB, releases, backups, 25 GiB active disk swap).
- `origin/main` read-only remote SHA at start and mid-work: `4a7c1398c8611a514650d33db48bf5bbf6ac4594`; isolated documentation branch `docs/host-disk-cleanup-v2026.10.17.781`.
- Reviewed `AGENTS.md`, documentation policy, document catalog, `PROJECT_PLAN`, integrated master, docs/planning/STORAGE_RELEASE_RETENTION_SPEC.md, dual-disk runbook v749, and previous cleanup worklogs v619/v749.
- Root `df -B1`: used **90,650,734,592 B**, available **10,209,361,920 B**, `df -h` **90%**; inodes used **2,998,446**. Data filesystem used **116,065,644,544 B**, **58%**.
- Verified `production-current` resolved to `prod-v2026.10.16.717-176ca04ecfbd`, `test-current` to `test-v2026.10.17.761-4a7c1398c861`. Inspected current process CWDs; active v780 UI build path excluded.

## Mid — authorized deletion only
- Exact-path removal of **18 historical Next.js `.next` build caches** in three batches (9 + 7 + 2), after testing realpath, root filesystem device, absence of symlink and absence of live process CWD under each candidate.
- Measured aggregate directory blocks before removal **11,117,133,824 B** (not equal to net filesystem gain because other processes allocate concurrently).
- Removed neither source/Git metadata nor any `node_modules`, active build v780, Production/Test/rollback release, DB, backup, uploaded files, Docker volume, swap, or systemd unit.
- Exact retired build-cache paths:
- `/srv/moneyverse-tasks/treasury-v677/source/frontend/.next`
- `/srv/moneyverse-tasks/treasury-v678/source/frontend/.next`
- `/srv/moneyverse-tasks/treasury-fix-v683/source/frontend/.next`
- `/srv/moneyverse-tasks/treasury-v690/frontend/.next`
- `/srv/moneyverse-tasks/blog-country-seo-v710/frontend/.next`
- `/srv/moneyverse-tasks/promotion-remediation-v721/repo/frontend/.next`
- `/srv/moneyverse-tasks/promotion-v716/source/frontend/.next`
- `/srv/moneyverse-tasks/bank-credit-truth-v715/repo/frontend/.next`
- `/srv/moneyverse-tasks/full-function-runtime-v687-20261015/frontend/.next`
- `/srv/moneyverse-tasks/function-acceptance-audit-20261014-v605/app/frontend/.next`
- `/srv/moneyverse-tasks/release-identity-v717/repo/frontend/.next`
- `/srv/moneyverse-tasks/monetary-guard-v737/source/frontend/.next`
- `/srv/moneyverse-tasks/seo-cron-v739/source/frontend/.next`
- `/srv/moneyverse-tasks/production-promotion-repair-v2026.10.16.744/repo/frontend/.next`
- `/srv/moneyverse-tasks/promotion-attempt-v2026.10.17.753/current-source/frontend/.next`
- `/srv/moneyverse-tasks/prod-finance-closure-v2026.10.17.754/main/frontend/.next`
- `/srv/moneyverse-tasks/prod-finance-closure-v2026.10.17.754/repo/frontend/.next`
- `/srv/moneyverse-tasks/stock-league-test-read-v2026.10.17.755/repo/frontend/.next`
- Raw start/mid/end and target-inventory evidence retained off system disk: `/srv/moneyverse-data/build-workspaces/host-disk-cleanup-v2026.10.17.781/`.

## Completion — measured actual host result
- Root final `df -B1`: **79,661,645,824 B used; 21,198,450,688 B available; 79%**.
- **Net filesystem-space gain: 10,989,088,768 B (~10.99 GB; ~10.23 GiB)**; inodes used **2,828,584**, down **169,862**.
- Data disk **58%**, nearly unchanged. Current active v780 `.next` still exists; current production/test symlink targets unchanged.
- Post-maintenance system tool: backend, frontend, Discord bot, MCP, Nginx and Docker services **active**; app database connection true; `pg_isready` accepted connections; public `https://easy-scraping.com/` returned HTTP 200; all three existing Docker containers retained.
- This is **host maintenance verification**, not authenticated E2E, financial ledger validation, CI acceptance, Test rollout or Production application promotion. Existing finance/UI blockers stay in force.
- At **79%** the root is below the 80% capacity-action threshold but still above the 70% warning threshold; review future root cache growth. No automatic destructive retention job installed.

## Completion evidence / audit
- Host evidence: `start.log`, `middle.log`, `completion.log`, `candidates.txt`, `candidates-second.txt`. The host's final df snapshot is authoritative; directory-block sums overstate net gain during concurrent builds.
- Document-only PR; preserve newer concurrent `main` and workers. No app release requested by this documentation record.
