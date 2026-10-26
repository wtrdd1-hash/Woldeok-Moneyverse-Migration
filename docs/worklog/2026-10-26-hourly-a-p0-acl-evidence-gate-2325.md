# A2325 — P0 PostgreSQL privilege evidence gate (HOLD)

## Before work — 2026-10-26 23:35 KST
- Base: `origin/main=0fe614b2ca1a7bc0df540514e54db78130479e2a`.
- Source: AGENTS.md, README.md, docs/planning/PROJECT_PLAN.md and .ko.md, integrated EN/KO master, P0 issue #993, QA and PR inventory.
- Branch: `auto/hourly-a-repair-privilege-gate-20261026-2325`, separate worktree.
- Remote: 293 branches, 286 open PRs (271 Draft), 9 conflicts, 204 failed/cancelled PR checks; no deletion.
- Main has migrations 002–279; at least seven open PRs propose competing migration 280. No migration number may be chosen or applied here.
- Actual dev DB is production-connected and is READ ONLY for this task. Default grants include app table DML, sequence writes and function EXECUTE. Three legacy text bank overloads are PUBLIC EXECUTE. Exact role ACL catalog inspection is read-only.
- Root filesystem 98% used; data filesystem 91%. Do not duplicate dependency trees or delete another agent's work.
- Scope: diagnostic-only executable SQL + deterministic validator + tests, to prevent false claims of least-privilege success. No grants, data, functions, migrations, runtime or deployment will change.
- This is not an end-to-end user feature; never report it as one. Production RELEASE HOLD.

## In progress
- [ ] Write failing validator tests for direct DML, default ACL, PUBLIC bank EXECUTE and missing schema.
- [ ] Implement a read-only SQL snapshot and validator.
- [ ] Run unit tests and a real read-only PostgreSQL audit; record exact outputs.
- [ ] Recheck main and planning, then document remaining release gates.

## Finished
- Pending.
