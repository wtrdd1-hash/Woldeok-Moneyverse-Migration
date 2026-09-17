# Internal Worklog — v2026.09.17.192 Runtime backup and backend identity recovery

- Date: 2026-09-17
- Branch: `fix/runtime-backup-api-v2026.09.17.192`
- Exact base: `6a72a3777cd5d233804884b7b5b6d36ecdbb01a1`
- Scope: P0 backup runtime activation, backend-owned runtime identity, Test validation, and zero-downtime Production promotion.

## Problem
- `moneyverse-backup.timer` is absent on the authorized Debian runtime.
- Direct backend `GET /api/version` returns 404, so repository identity cannot prove deployed backend identity.
- Production backend still runs release `c7720282eb8b` while migration 204 / adaptive profession limits are merged but not Production-proven.

## Checklist
- [x] Re-read authoritative v189 project plan and current runtime evidence.
- [ ] Create and verify encrypted scheduled backup on a filesystem separate from PostgreSQL/photos.
- [ ] Add non-secret backend runtime identity endpoint with regression tests.
- [ ] Re-read authoritative plan after implementation checkpoint.
- [ ] Run targeted and full QA required by repository gates.
- [ ] Deploy exact candidate to isolated Test and verify backend/API/database/session continuity.
- [ ] Merge exact branch to main and promote Production with zero downtime.
- [ ] Record Production smoke, rollback evidence, and GitHub-facing changelog.
