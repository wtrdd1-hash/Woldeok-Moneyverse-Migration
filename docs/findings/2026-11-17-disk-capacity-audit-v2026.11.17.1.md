# Mini PC disk capacity audit — v2026.11.17.1

[한국어](2026-11-17-disk-capacity-audit-v2026.11.17.1.ko.md) | English canonical

Status: OBSERVED / READ-ONLY / NO CLEANUP.
Host: debian13. Evidence time: 2026-11-17 14:11–14:17 KST.
GitHub main base SHA: e96e8f81f4d6b99b221392a2b6fe46356361b145 (checked at start and mid-audit).
Sources: remote MCP df -hT, df -i, lsblk, du, docker system df, free -h, ps, lsof +L1, unique deleted-open inode allocated blocks from /proc/*/fd, systemd and release symlink inspections.

## Observed filesystems
| Mount | Device/type | Total | Used | Free | Use |
|---|---|---:|---:|---:|---:|
| / | /dev/sdb1 ext4 | 99G | 56G | 39G | 59% |
| /srv/moneyverse-data | /dev/sda1 ext4 | 197G | 128G | 61G | 68% |
| /tmp | tmpfs (RAM/swap backed; not a third disk) | 6.7G | 6.4G | 289M | **96%** |

Ext4 inode use 20% on both devices. Values are rounded display values. Root used space rose from 55G to 56G during inspection.

## P0: /tmp exhaustion cause
Visible path du totals ~1.4G, including node-compile-cache ~1.1G and Google Play terms task checkout ~140M. Unique unlinked-but-open files total **2,580** and **4.98 GiB allocated** on tmpfs; repeated FDs to the same inode were deduplicated. Three Chromium headless renderer PIDs 2580423, 2580434, 2580435 account for ~1,702 MiB each. Parent Playwright Node browser-sweep PID 2580315 (PPID 1) was started 2026-11-15 19:48 KST and remained present at inspection. This explains the visible du vs df gap. Disk space is released only when the last open handle closes. Do not forcibly terminate QA or rm -rf /tmp without verifying owner and live work.

## Data disk largest observed paths (unprivileged du; may undercount inaccessible directories)
| Subdirectory under /srv/moneyverse-data | Approx. size |
|---|---:|
| releases | 35G |
| tasks | 20G |
| agent-worktrees | 12G |
| ai | 7.9G |
| backups | 4.2G |
| relocated-home | 2.4G |
| automation-builds | 1.2G |

production-current pointed to prod-v2026.11.17.1024-d239aec87; test-current to test-v2026.11.11.1831-cfc178ab55d9. Keep currently running, test, rollback releases and agents' unmerged worktrees. The unprivileged walk exposed ~111G versus df 128G: permission-protected directories limit reconciliation. Do not attribute the gap to deleted files without privileged evidence.

## OS disk largest observed paths
/home ~27G; Migration checkout ~15G, including .worktrees ~11G; automation-moneyverse ~5.5G; .codex ~2.1G. Root-authorized path totals: /var/lib/docker ~11G and /var/lib/containerd ~1.7G. Docker accounting: local volumes 10.3GB, images 1.52GB, containers 206.3MB; nominal reclaimable images 645.8MB, volumes 306.4MB. Database volumes must be retained. /var/log ~151M (Nginx ~38M, journal ~99M). Nginx logrotate: daily, 14 rotations, compress, delaycompress.

## Recommended action sequence — NOT executed
1. P0 Confirm the Playwright QA owner/activity, then arrange graceful end of the orphaned browser process tree. Check /tmp df and open deleted inode count before and after.
2. P0 Fix browser/context teardown in finally, add test task owner and max runtime, /tmp alert at 85/95%, and alert on large deleted-open allocations. Move heavy tmp workloads only to segregated, bounded, capacity-checked paths.
3. P1 Inventory active systemd ExecStart, symlink and rollback references before any removal. Clean only owner-confirmed finished build caches, not other agents' worktrees.
4. P1 Trend physical disk at 80/90%, inodes 80/90%, tmpfs 85/95%; implement ordinary logs 7 days and critical logs 30 days with rotation/compression and verified exclusions.
5. P1 Verify backup schedule, off-host copy, checksums, encryption, isolated restoration: presence of old dump files is not evidence of a healthy daily backup.
6. P2 Evaluate Node cache and genuinely unused Docker images only with ownership/volume inspection; never run indiscriminate docker system prune -a --volumes.

No process was terminated, no data deleted, no database changed, no Test/Production deployment or promotion performed. Docs-only branch, not a release.