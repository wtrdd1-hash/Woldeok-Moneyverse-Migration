# v2026.11.03.disk01 — Dual-disk manual cache cleanup (GitHub update)

**Status: HOST VERIFIED; DOCS ONLY; NO APPLICATION PROMOTION.** [한국어](./2026-11-03-host-dual-disk-cache-cleanup-v2026.11.03.disk01-github.ko.md)

- Reclaimed **35,065,032,704 allocated bytes (35.07 GB)** by deleting 35 strictly scoped regenerable Next.js incremental cache directories: 8 on root, 27 on the separate data disk.
- Final usage: root 79% (22.11GB available), data 77% (46.73GB available). Per-mount strict storage checker reports OK/OK.
- Protects all DB/WAL, backups, releases, source/Git worktrees, uploads, Docker volumes and live processes. Six active workspaces and 33 fresh/protected caches skipped. No removal errors.
- Production backend, frontend, Nginx and QA timer active; PostgreSQL ready; public homepage HTTP 200.
- Scheduled QA v1605 remains unchanged; manual 12h eligibility was incident-scoped, not a new automatic 5-day retention rule.
- [Execution log](../worklog/2026-11-03-host-dual-disk-cache-cleanup-v2026.11.03.disk01.md) and host-local JSON manifests provide full evidence. No full-route authenticated QA or Production deployment was claimed.
