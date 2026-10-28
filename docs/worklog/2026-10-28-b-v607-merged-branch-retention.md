# Development B v607 — merged branch cleanup retention (2026-10-28)

## Before work
- P0 #1663: 352 unmerged PR heads were closed in the incident; initiating actor remains unverified. This task does **not** attribute causation to this workflow.
- QA #1682 addresses `cleanup-failed-branches.yml`; B #1672 addresses `auto-integrate-promote.yml`. This task covers only `cleanup-merged-branches.yml`.
- Main baseline: a28bed9aa40ff74d492824ae12892a7d52132fdd. No other branch, recovery ref, or remote PR may be modified.
- The workflow still holds write scopes and executes `git push` deletion of source branches; no automatic deletion is acceptable during the incident hold.

## In progress
- [x] Add negative RED tests for write permissions, deletion, and read-only inventory.
- [x] Replace destructive cleanup with read-only, fail-closed audit preserving event triggers.
- [x] Re-run release policy tests and required CI gates, record exact SHA and limitations.

## Finished
- P0 containment code and negative tests completed on independent branch. Release BLOCKED. No Test or Production release is authorized.

### Verification and release gates
- RED: new negative tests failed on existing write permissions and branch deletion commands. GREEN: 3/3 focused; full release policy 76/76 PASS.
- YAML parsed by Prettier. Lint PASS (0 errors, 1,102 warnings); typecheck PASS; build PASS.
- Database package tests 45 PASS / 3 SKIPPED; Backend 1,927 PASS / 440 SKIPPED; Frontend 1,864 PASS / 1 FAIL (existing admin-blog review-hold copy assertion). Full `pnpm test` FAIL.
- Bot tests 11/11 PASS after isolated `npm ci`; Bot audit 0 vulnerabilities. Root audit FAIL: 3 low + 9 moderate vulnerabilities.
- Repository security, control-byte, and forbidden Prisma migration guards PASS.
- No schema migration, API contract change, finance, ledger, auth or application DB write; this is a CI policy safety change only. Real PostgreSQL/E2E is not applicable to the changed workflow but remains a release prerequisite.
- No official Test exact-SHA / authenticated finance E2E / GitOps release gate; Production is HOLD. No PR merge or deployment.
- Preserved 352 local recovery refs and independent QA bundle; initiating actor of mass PR closure is not established.
- The read-only workflow retains pull_request/push/schedule/manual triggers, fetches private refs with read-only credentials, and never invokes remote PR/branch mutations.
- Current main and EN/KO plan were rechecked before submission. Draft+hold only; no release permission inferred from policy-only CI.
