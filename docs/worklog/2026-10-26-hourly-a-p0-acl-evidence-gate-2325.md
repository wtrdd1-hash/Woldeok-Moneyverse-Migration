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

### 23:36 KST — RED
- Added six deterministic tests before implementation. Initial unittest discovery FAILED (FileNotFoundError for the not-yet-created validator). This is expected RED, not a passing security gate.
- Inspected actual PostgreSQL catalog in a READ ONLY transaction: legacy text bank overloads retain PUBLIC EXECUTE while UUID overloads do not; default ACL grants app table DML, sequence write, and function EXECUTE. Isolated `wdmv_v761_test_acl` lacks the bank overloads, so missing schema must be UNKNOWN, never PASS.

### 23:37 KST — GREEN (validator unit), real PostgreSQL still RED
- Added `scripts/check-app-role-acl.py` and `packages/database/verify/app-role-acl-snapshot.sql`; SQL is wrapped in `BEGIN READ ONLY` / `ROLLBACK`.
- Python unittest: 7/7 PASS; Python syntax check PASS.
- Real development DB: FAIL with PROTECTED_DIRECT_DML, UNSCOPED_DEFAULT_APP_GRANTS, PUBLIC_BANK_EXECUTE. This is an intentionally failing security gate, not a test regression to waive.
- Isolated `wdmv_v761_test_acl`: UNKNOWN because all required legacy bank functions are absent; never mislabel it PASS.
- Revised SQL to handle missing app role without raising and include global as well as schema-scoped default ACL.
- No DB mutation, migration, service restart, or production deployment.

### 23:39 KST — Reverification
- Final SQL snapshot rerun: development DB FAIL (three P0 findings), isolated Test DB UNKNOWN (bank overloads missing); each query explicitly `BEGIN READ ONLY` and `ROLLBACK`.
- Validator unit tests 7/7 PASS, `python3 -m py_compile` PASS, `git diff --check` PASS.
- Main `0fe614b2ca1a7bc0df540514e54db78130479e2a` unchanged; latest planning v1330 remains unmerged Draft.
- Official Test/Production public SHA mismatch confirmed; authenticated exact-SHA E2E blocked. No broad full-stack gate claims.

## Finished — 2026-10-26 23:39 KST
- [x] Write RED validator tests, observe failure.
- [x] Implement read-only SQL snapshot, fail-closed validator and 7 passing unit tests.
- [x] Execute real read-only PostgreSQL checks with truthful FAIL / UNKNOWN verdicts.
- [x] Recheck main/planning; write English/Korean QA and release notes.
- [ ] Remediate live ACL (blocked by security review, competing migration 280 proposals, parity-correct isolated DB and full release gates).
- [ ] Complete P0/P1 user feature across web/backend/API/DB/Android (not accomplished this run).
- Production/Test: NO CHANGE; rollback: not applicable. Preserve all branches; delete 0.

### 23:41 KST — GitHub checkpoint
- Draft PR #1464 created; P0 issue #993 and PR comments updated with exact READ ONLY PostgreSQL findings.
- Remote branches 293→294; open PRs 286→287; 8 changed files; deleted 0. Two main-ancestor, ten unavailable, and 280 unmerged unique-commit branches preserved due cross-agent references and safety.
- SQL catalog: 241 public tables, 235 app-writable, 3 PUBLIC bank overloads; default app ACL entries 8 table / 3 sequence / 1 function.
- PR CI is asynchronous and cannot be considered PASS until a final-SHA result is observed.
