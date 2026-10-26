# Backend B v571 — Treasury backup evidence fail-closed

## BEFORE (2026-10-27 04:36 KST)
- Base `origin/main`: `0fe614b2ca1a7bc0df540514e54db78130479e2a`.
- Task: P1 security/recovery integrity. `TreasuryRepository.createImmutableBackupSnapshot` computes a local hash and reports an immutable cloud backup without persisting or verifying an artifact; `getBackupStatus` reports 54 verified snapshots and quota from constants. No proof of real backups. This is independent of C's frontend money-flow/treasury changes and B's migration 280 work.
- Invariants: no Production/Test/DB mutation, no fake backup success, preserve route and guards, no migration or WLD changes. Other branches and automations untouched.
- Checklist: [x] read main/docs/PRs/QA; [ ] RED tests; [ ] safe backend fix; [ ] focused/full verification; [ ] independent CI; [ ] Test exact SHA (blocked until gates); [ ] final log.

## IN PROGRESS
- Planned HTTP contract: both `POST /api/v1/admin/treasury/backup/snapshot` and `GET /api/v1/admin/treasury/backup/status` must return 503 `TREASURY_BACKUP_EVIDENCE_UNAVAILABLE` until durable, verified storage and restore evidence are implemented. Direct repository callers must also fail closed. Existing `admin/backups` path is distinct and not modified.
