# Safe root build-cache cleanup — v2026.10.17.782

**Status:** HOST MAINTENANCE VERIFIED; documentation-only GitHub change. [한국어](2026-10-17-host-storage-hygiene-v782.ko.md).

**Date:** 2026-10-17 KST. **Main at start/mid-check:** `f2b2e026ae967f46cddfe62d2a6633882b76ff18`, then previous documentation-only PR #917 merged at `0f30896ab6afd840288d828d285f18c510ff1ced`. This work's documentation branch starts at that new main SHA.

## Start and protected resources

Read AGENTS, `docs/DOCUMENTATION_POLICY.md`, catalog, canonical project plan/integrated master, storage release retention spec, dual-disk v749 and previous v781 cleanup evidence. Host `debian13` has separate `/dev/sdb1` root and `/dev/sda1` data mount.

Before action: root used **79,992,172,544 B**, available **20,867,923,968 B**, utilization **80%**, inode usage **2,831,610**; data used **117,059,133,440 B**, **59%**.

Protected linked releases: production `prod-v2026.10.16.717-176ca04ecfbd`, Test `test-v2026.10.17.761-4a7c1398c861`, and legacy `/srv/moneyverse` pointing to `prod-v600`. Other active process CWDs include `prod-v697`, `prod-v712` and `prod-v600`, which therefore remain pinned. Financial database, WAL, backups, swapfile, Docker volumes, uploads and Git objects also protected.

## Mid-work action

- Selected only directories matching `/root/worktrees/*/frontend/.next` or `/root/workspace/*/frontend/.next`, on the root filesystem, older than **7 days**, with matching absolute realpaths and no active process CWD in each corresponding worktree.
- Removed **26 inactive, reproducible Next.js `.next` cache directories** and zero source/Git/worktree roots; per-directory `du -B1` sum: **8,215,654,400 B**.
- Exact immutable evidence manifest: [26 paths and measured directory blocks](host-cleanup-v782-evidence.txt).
- No wildcard `git worktree remove`, branch deletion, root package/Gradle purge, `docker volume prune`, application redeployment or service restart.
- Inspection identified **68 registered worktrees** in the older root Git repository, multiple concurrent `/home/debian/worktrees` workers, and at least one uncommitted legacy worktree (`/root/worktrees/google-admin-v2026.09.16.157`). Without branch-owner and merge confirmation, worktree roots were retained.
- On data disk the releases inventory is **14 Production + 32 Test**. The minimum active+10 rollback-capable releases for each class, legacy active CWDs and unclassified QA/incident evidence prohibit unreviewed release deletion. No release removed.
- Future isolated build worktrees must be placed under `/srv/moneyverse-data/build-workspaces/` as existing v749 policy states; this maintenance does **not** claim to have reconfigured every concurrent worker.

## Completion/verification

At 2026-10-17 12:56 KST root used **71,779,147,776 B**, available **29,080,948,736 B**, **72%**. Measured net root capacity recovered **8,213,024,768 B (8.21 decimal GB / 7.65 GiB)**, with **152,105** fewer used inodes (final used **2,679,505**). Per-target directory sum differs slightly because other host jobs concurrently wrote data.

Data disk remained **59%**. Production/Test symlinks unchanged. Backend, frontend, Discord bot, MCP, Nginx, Docker active; PostgreSQL container accepts connections; the public homepage returned **HTTP 200**. Existing three Docker containers maintained.

Root is now below the **80%** required cleanup threshold, but above the **70%** monitoring warning. No source code change, exact-new-code Test qualification, finance acceptance, authenticated E2E, or Production application cutover was performed; historical finance/UI P0 blockers remain independent.

## Audit artifacts

Host evidence stored on the data disk at `/srv/moneyverse-data/build-workspaces/host-storage-hygiene-v2026.10.17.782/`: `start.log`, `middle.log`, `completion.log`, `removed-root-next.tsv` (SHA-256 `a0259e54014395a160cad179f34d0215c0cfdf07107f05d847635a2dd8daf941`).

GitHub documentation is isolated from other agents' branches, with no application code or running generation change.
