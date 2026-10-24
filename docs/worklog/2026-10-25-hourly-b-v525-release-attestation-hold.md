# B v525 — P0 release auto-integration attestation HOLD

## Before work
- 2026-10-25 07:40 KST: miniPC Debian 13.6, services active; root filesystem 100%, data volume 47%.
- `origin/main` at `c9a868b1e622341e2daa8b936ddf0988eda9988e`; independent worktree and branch created from exact main.
- Read AGENTS.md, README.md, English and Korean PROJECT_PLAN, release guide, open PRs, issue #1088, candidate and auto-integrate workflows, CI and peer drafts.
- #1088 reproduced in source: candidate workflow SUCCESS alone is accepted before `gh pr merge --squash --delete-branch`; isolated Test is only pending in candidate workflow.
- Scope: stop unsafe automated main integration and promotion dispatch, preserve other workers' branches, keep schedule as read-only audit.

## In progress
- Plan: write RED test; implement minimal fail-closed workflow; rerun release regression; refresh main and record blockers.

## Finished
- Pending verification.

## Implementation / verification
- RED: new regression tests 0/3 PASS against original auto-integrate workflow, proving unsafe merge/write/dispatch paths.
- GREEN: changed auto-integrate workflow to read-only scheduled observer; removes branch reconcile/push/delete, PR merge, and Production candidate dispatch. GitHub permissions are read-only. Reports explicit BLOCKED for every PR regardless of candidate success.
- Final release suite: 59/59 PASS (`node --test scripts/release/*.test.mjs`).
- YAML parser: PASS (`js-yaml`); triggers schedule, workflow_dispatch and workflow_run preserved.
- Focused ESLint (with explicit --no-ignore): PASS; Node syntax check and git diff --check: PASS.
- Full app build, full frontend/backend tests, live isolated PostgreSQL, authenticated finance E2E and official Test exact-SHA: NOT RUN / BLOCKED. Root filesystem at 100%; Test attestation is absent. This CI-only fail-closed control does not claim runtime completion.
- API/DB contract: unchanged; no SQL, migration, ledger or financial data modified.
- No PR merge, Test promotion, Production deployment or branch cleanup. Other developer worktrees/branches preserved.

## Finished
- Implementation committed to independent non-main branch for Draft PR review; merge requires approved process and full release gates.
