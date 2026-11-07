# Backend B v765 — App role and schema boundary release prerequisite

## Before implementation
- Started 2026-11-03 01:06 KST on Debian 13.6 miniPC, fresh independent worktree from origin/main f5c3fbedae1c3b3ec2374882b049aac43a655eb4.
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

## Implementation checkpoint — 2026-11-03 01:09 KST
- [x] RED: new 9-case regression file failed before verifier existed (`logs/red.log`).
- [x] GREEN: 9/9 unit tests; root `pnpm test` registration, role/schema/database CREATE + membership fail-closed read-only verifier.
- [x] Isolated PostgreSQL 17.11: clean PASS, schema CREATE BLOCKED, database CREATE BLOCKED, pg_read_all_data membership BLOCKED, CREATEROLE BLOCKED, revoked PASS, wrong DB BLOCKED. First disposable startup raced temporary PostgreSQL socket and failed safely; retried after SQL readiness. Fixture container removed.
- [x] Active DEV PostgreSQL read-only: exact database woldeok_moneyverse_dev, role boundary READY_FOR_OTHER_RELEASE_GATES, 0 memberships. This is **not** release approval; QA v1476 reports unsafe table DML/TRUNCATE/TRIGGER/MAINTAIN and default ACLs.
- [ ] Full repository gates, remote CI, official exact-SHA Test, independent restore and Production approval remain separate.
