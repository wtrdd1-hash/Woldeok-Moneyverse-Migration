# Backend B v548 — Canonical rate-limit identity (P1, DRAFT / RELEASE HOLD)

## Before work (2026-10-26 06:3x KST)
- Source main: `1c5b84a1c45baafcca83f375a6f99698121e9bb5` (fresh origin/main).
- Independent branch: `auto/hourly-b-rate-limit-ip-identity-v548-20261026-0635`; worktree: `/srv/moneyverse-data/build-workspaces/mv-b-v548-20261026-0635`.
- Read AGENTS.md, README.md, both living plans, QA security log, open A/C/Gemini/QA PRs, CI, and release policy.
- Priority: requestClientKey accepts equivalent IPv6 and IPv4-mapped IPv6 spellings as distinct tracker keys, allowing budget fragmentation for a single peer. Duplicate CF-Connecting-IP header arrays are silently first-picked rather than rejected.
- Scope: backend security identity normalization and regression tests only; no API/DB schema or finance changes.
- Safety: no shared DB writes, migrations, existing worker branch changes, or production release. Root filesystem 100% (under 1 GiB free); build on data volume only.
- [x] Reproduce with RED tests (4 failed / 24 passed, 2026-10-26 06:36 KST).
- [x] Implement minimal canonical identity normalization and fail-closed ambiguous header handling.
- [ ] GREEN focused test; backend/full required checks; real PostgreSQL if applicable; official Test exact-SHA if eligible.
- [ ] Re-fetch main/plans, PR/CI review, final release HOLD and logs.

## In progress
- Mid-work main re-fetch: `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; plan EN blob `51683ec364f9fc1be7bd97e565f48ea2f257ac2a`, KO blob `ba7d055fd2c53e2f04282ac0a9448d0ee8e36254`.
- GREEN: 28/28 focused Vitest; backend 1,317 PASS / 398 SKIPPED; contract build, backend typecheck and backend build PASS.
- RED: four security assertions failed as expected (expanded IPv6, mapped IPv4, trusted-edge canonicalization, ambiguous CF header array).
- Existing 24 tests passed; no source implementation changes at this checkpoint.

## Finished
- Pending.
