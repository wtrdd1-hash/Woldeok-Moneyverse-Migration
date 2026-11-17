# Disk-capacity audit update — v2026.11.17.1

[한국어](2026-11-17-disk-capacity-audit-v2026.11.17.1.ko.md) | English canonical

**Type:** Documentation / runtime inspection only. **Release:** None. **Status:** P0 tmpfs risk discovered, remediation NOT performed.

- Root disk 59% used (39G available); application data disk 68% used (61G available). Both ext4 inode utilization ~20%.
- /tmp tmpfs **96%** used (only 289M free), with 4.98GiB held by 2,580 deleted-but-open temporary Chromium QA files.
- Most significant data paths: releases 35G, tasks 20G, agent-worktrees 12G, AI 7.9G and backups 4.2G. Docker stores ~11G under /var/lib/docker.
- Action gate: verify QA owner/active jobs, gracefully close abandoned Playwright browser, confirm space recovery; do not remove shared release, worktree, database volume or backup data blindly.
- No cleanup, restart, DB write, app code change, deployment or production promotion.
- [Full findings](../findings/2026-11-17-disk-capacity-audit-v2026.11.17.1.md) · [Worklog](../worklog/2026-11-17-disk-capacity-audit-v2026.11.17.1.md).
