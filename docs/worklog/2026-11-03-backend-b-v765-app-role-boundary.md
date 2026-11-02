# Backend B v765 — App role and schema boundary release prerequisite

## Before implementation
- Started 2026-11-03T01:07:15+09:00 on Debian 13.6 miniPC, fresh independent worktree from origin/main \.
- Read AGENTS.md, README, English/Korean PROJECT_PLAN, QA v1476, open PRs, CI and v764 evidence.
- Distinct from draft #2500 (DML), #2535 (default ACL), #2546 (TRUNCATE) and #2550 (TRIGGER/MAINTAIN).
- Live DEV read-only baseline: app role NOSUPERUSER/NOCREATEDB/NOCREATEROLE/NOINHERIT/NOBYPASSRLS; no direct public CREATE or database CREATE; TEMP allowed by default. No confirmed privilege exploit.
- Scope: fail-closed read-only release prerequisite for role escalation, unexpected role membership, schema/database CREATE; do not revoke live grants, edit migrations, deploy or change economy state.

## Planned
- [ ] RED regression tests; implement one narrow verifier and test in isolation.
- [ ] Real isolated PostgreSQL role/schema grant matrix and live DEV read-only evidence.
- [ ] Lint, typecheck, unit/integration, build, audit and CI; keep release HOLD until official exact-SHA Test and independent restore pass.

## Deployment
- No main merge, Test or Production promotion authorized by this work.
