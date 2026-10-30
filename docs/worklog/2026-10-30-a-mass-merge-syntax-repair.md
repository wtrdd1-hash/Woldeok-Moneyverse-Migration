# P0 — Restore syntax after unverified Draft/HOLD mass merge

## Before work
- 2026-10-30 19:30 KST: origin/main `b1f78c01af4af1f1585b7b13ce3493fc9bb796e8` after 30+ merged Draft/HOLD PRs; no open PRs and only remote main branch. PR #2030 failed runtime checks yet merged.
- Source inspection shows duplicate closing braces in shop service/controller/BFF and duplicate `const response` in receipt route tests. Baseline CI on main is still pending; do not claim green.
- Separate repair branch `auto/hourly-a-20261030-1925-repair-mass-merge`, isolated worktree. No migration, Production/Test, branch deletion, or other developer worktree modification.
- Plan: establish exact-main parse/typecheck RED, make minimum surgical syntax fixes, rerun parse/typecheck and target tests, run full gates if feasible; never merge without all mandatory proof.

## During work
- 19:30–19:33 KST: baseline `pnpm typecheck` RED (36 backend parser errors, committed conflict markers). Independent main updates fixed some duplicate syntax while this branch was isolated; replayed only remaining changes onto main `78589574dad5867a95eaf17395251961dc881881`.
- Integration repair combines both `maxReward` and `availableOnly` without passing null/false into strict repository parsers, and aligns tests to the combined five-argument signature. It restores strict `availableOnly=1` HTTP validation, Korean calendar date parsing, duplicate shop receipt BFF and Android test fixtures, and fail-closed invalid minimum input behavior.
- Verification on isolated repair worktree: pnpm install PASS; typecheck PASS; backend targeted 28 PASS; frontend/Android targeted 31 PASS (NODE_ENV=test); lint 0 errors/1043 warnings; mobile API 184 endpoints PASS; Backend build PASS; Frontend build PASS; database package 62 PASS/4 SKIP; security/release policy 22 PASS; isolated PostgreSQL 17.11 engine reachable read-only.
- Full Backend 2661 PASS / 118 FAIL / 501 SKIP; Full Frontend 2715 PASS / 55 FAIL. These are real failures; do not integrate. Official isolated Test exact-SHA authenticated E2E, independent restore, production smoke and GitOps attestation NOT RUN / BLOCKED. No migration, ledger, service restart, Production/Test deployment or rollback.
- Incident #2031 records Draft/HOLD PR #2030 and others merged despite failing CI; external commits on main at 19:27–19:34 fixed some syntax directly. No attribution of merge provenance beyond GitHub `merged_by` metadata. This task does not authorize another merge.


## Finished
- Status: P0 integration repair candidate; targeted/build/typecheck PASS; full gates FAIL; RELEASE HOLD.
- Branch preserved for review. No PR or merge while draft-merge bypass #2031 remains unresolved. Rollback: revert isolated repair commit if later integrated; no persistent data changes in this task.
