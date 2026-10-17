# v2026.10.17.782 — MiniPC safe old build-cache eviction

**HOST MAINTENANCE VERIFIED; DOCUMENTATION ONLY in GitHub.** [한국어](2026-10-17-host-storage-hygiene-v782.ko.md)

- System root **80% → 72%**; **8,213,024,768 bytes net recovered**. Used inodes down 152,105.
- Removed 26 inactive (>7-day-old) recreatable root-worktree `.next` directories only. Preserved source/Git worktrees/branches, current runners and releases, swap, PostgreSQL and backups.
- Data disk **59%** and unchanged Production/Test symlinks. Public website HTTP 200; PostgreSQL ready and backend/frontend/bot/MCP/Nginx/Docker active.
- Audited root Git worktrees and 14 Production/32 Test immutable releases without deleting them: owner/merge and rollback/QA pins not fully resolved; follow fail-closed storage policy.
- The 70% root warning remains; place future isolated work under the separate 200GB mount and prevent redundant caches, without touching current workers.
- [Full EN worklog](../worklog/2026-10-17-host-storage-hygiene-v782.md) · [exact manifest](../worklog/host-cleanup-v782-evidence.txt).
