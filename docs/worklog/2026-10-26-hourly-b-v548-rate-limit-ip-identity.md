# Backend B v548 — Canonical rate-limit identity (P1, DRAFT / RELEASE HOLD)

## Before work (2026-10-26 06:3x KST)
- Source main: `1c5b84a1c45baafcca83f375a6f99698121e9bb5` (fresh origin/main).
- Independent branch: `auto/hourly-b-rate-limit-ip-identity-v548-20261026-0635`; worktree: `/srv/moneyverse-data/build-workspaces/mv-b-v548-20261026-0635`.
- Read AGENTS.md, README.md, both living plans, QA security log, open A/C/Gemini/QA PRs, CI, and release policy.
- Priority: requestClientKey accepts equivalent IPv6 and IPv4-mapped IPv6 spellings as distinct tracker keys, allowing budget fragmentation for a single peer. Duplicate CF-Connecting-IP header arrays are silently first-picked rather than rejected.
- Scope: backend security identity normalization and regression tests only; no API/DB schema or finance changes.
- Safety: no shared DB writes, migrations, existing worker branch changes, or production release. Root filesystem 100% (under 1 GiB free); build on data volume only.
- [ ] Reproduce with RED tests.
- [ ] Implement minimal canonical identity normalization and fail-closed ambiguous header handling.
- [ ] GREEN focused test; backend/full required checks; real PostgreSQL if applicable; official Test exact-SHA if eligible.
- [ ] Re-fetch main/plans, PR/CI review, final release HOLD and logs.

## In progress
- Not yet started.

## Finished
- Pending.
