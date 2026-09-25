# Disk Capacity Hygiene Worklog — v2026.09.25.438

**English canonical** | Korean counterpart: `2026-09-25-disk-capacity-hygiene-v2026.09.25.438.ko.md`

- Start main SHA: `328b4623f2f063eaaade74e38cb4d8f4f14561c2`
- Branch: `ops/disk-hygiene-v2026.09.25.438`
- Host: `debian13`
- Initial root: 99G total, 55G used, 40G available (59%).
- Initial data disk: 197G total, 135G used, 54G available (72%).
- Production current: `prod-d058df3-v436`; both backend/frontend process CWDs match.
- Test current: `test-d058df3-v436`; both backend/frontend process CWDs match.
- Swap: 30GiB total; 24G disk swapfile uses 0B, zram is active.
- Objective: reclaim stale immutable release copies without touching current runtime, DB, uploads, backups, or protected Docker volumes.
- Retention proposal: current release + 10 newest versioned releases per environment; keep rollback candidates explicit.
- Runtime mutation is limited to safe storage hygiene and will be verified with service/process identity and capacity checks.

## Completion evidence
- Removed 207 stale immutable release directories; retained exactly 10 Production and 10 Test release roots.
- Final root: 99G total, 55G used, 39G available (59%); inode use 32%.
- Final data disk: 197G total, 41G used, 148G available (22%); inode use 392,186 / 13,107,200 (3%).
- Data-disk reduction: about 94G and about 4.50M inodes reclaimed from the observed baseline.
- All four Production/Test frontend/backend systemd services are active.
- Production backend `127.0.0.1:3000/health` and Test backend `127.0.0.1:3100/health` both returned `{"status":"ok"}`.
- Active Production/Test release identity remains v436. PostgreSQL, uploads, backups and protected QA data were not deleted.
- The 24G disk swapfile was preserved because swap sizing belongs to the v437 VM memory-continuity contract.
- No application code release, DB migration, Test promotion or Production promotion was performed.
