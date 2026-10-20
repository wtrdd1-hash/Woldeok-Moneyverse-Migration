# v2026.10.20.981 — Host root storage cleanup

**Status: HOST VERIFIED / DOCS-ONLY GITHUB UPDATE.** [한국어](2026-10-20-host-storage-cleanup-v981.ko.md).

- Safely removed three inactive, rebuildable directories (legacy Gradle 9.5.0 generated cache, root npm cache, September 19 automation Next.js output).
- Root disk 64% to 62%; net 1,505,574,912 bytes recovered; 26,830 fewer used inodes. Second data disk remained at 23%.
- Preserved all releases, DB/WAL, backups, Docker volumes, source/Git worktrees, Android AVD, recent caches and service configuration.
- Backend, frontend, Discord bot, MCP, Nginx, Docker active; PostgreSQL accepts connections; homepage HTTP 200; Production/Test pointers unchanged.
- No app code, migration, release or Production switch. [Full worklog](../worklog/2026-10-20-host-storage-cleanup-v981.md).
