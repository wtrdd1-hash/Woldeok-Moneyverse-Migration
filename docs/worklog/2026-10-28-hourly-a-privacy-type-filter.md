# Development A — Privacy Request Type Filter (2026-10-28 09:25 KST)

## BEFORE WORK
- Baseline `origin/main`: `7357d9d4fca08d48697951979c64a74fa9bc6f57`.
- Isolated branch `auto/hourly-a-privacy-type-filter-20261028-0925`, separate worktree under `/srv/moneyverse-data/tasks/`.
- Read `AGENTS.md`, README, English/Korean integrated plans, latest QA and prior A worklog. Source DB is existing `privacy_list_my_requests`, not direct table SELECT.
- Prior PR #1652 remains independent support search; no change to its branch or another developer's worktree.
- Scope: P1 member privacy-center recent request type filter. No finance, migrations, DB privilege grants or account mutation.
- Expected release gate: HOLD until required CI, exact-SHA isolated Test and auth E2E, ACL, backup/restore, security and GitOps pass.

## IN PROGRESS
- [ ] RED/GREEN Backend + PostgreSQL owner-scoped filtered read.
- [ ] RED/GREEN Web accessibility and query allowlist.
- [ ] RED/GREEN Android API query forwarding and privacy cache.
- [ ] Full gates, branch/PR/CI audit, latest main/plan reconciliation.

## FINISHED
- Pending verification. No merge, deployment, DB mutation, rollback or branch deletion authorized.
