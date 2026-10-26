# A2325 QA — read-only PostgreSQL privilege evidence gate (HOLD)

**Candidate:** `auto/hourly-a-repair-privilege-gate-20261026-2325`, based on main `0fe614b2ca1a7bc0df540514e54db78130479e2a`.

## Scope and validation
- Added a **read-only** SQL catalog snapshot and fail-closed Python validator, with eight unit tests. This is a security diagnostic, **not a completed full-stack member feature or an ACL fix**.
- TDD RED: validator absent, test discovery failed as expected. GREEN: 8/8 Python unit tests pass; Python syntax check and Git whitespace check pass.
- Actual production-connected development DB, READ ONLY: **FAIL** (`PROTECTED_DIRECT_DML`, `UNREVIEWED_APP_DML`, `UNSCOPED_DEFAULT_APP_GRANTS`, `PUBLIC_BANK_EXECUTE`). These are security failures, not waived checks.
- Isolated PostgreSQL `wdmv_v761_test_acl`, READ ONLY: **FAIL** (`UNREVIEWED_APP_DML`) with **incomplete coverage** (`MISSING_BANK_FUNCTIONS`). This isolated schema is insufficient to certify the bank ACL boundary.
- No schema migration, DML, privilege mutation, fixture, application runtime, service restart, or Production write was executed.
- No full build/lint/typecheck/contract/authenticated E2E/backup-restore/migration parity/official Test exact-SHA release certification for this candidate. **Do not merge.**

## Repository and release audit
- Start: 293 remote branches, 286 open PRs (271 Draft); 9 conflicting PRs, 204 PRs with failed/cancelled checks; duplicate branch/PR head SHA: 0.
- Before branch creation: 292 non-main branches; 280 have unique unmerged commits in local graph, 2 are main ancestors, 10 Git objects unavailable. Preserve all; deleted 0.
- Main SHA stable on start/mid: `0fe614b2ca1a7bc0df540514e54db78130479e2a`. Latest unmerged planning v1330 is Draft/HOLD, not main.
- Competing open migration 280 proposals exist (#1422, #1186, #1143, #1139, #1117, #1105 and others); no migration number assigned or applied.
- Public Test version `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; Production version `6a989b5ac0c6155587d43426d64f6def6b62c917`. Neither matches main or candidate. HTTP 200 alone is not authenticated E2E.
- Root disk 98% used; data disk 91% used. No cleanup of other agents' worktrees or branches.

## Release decision
**BLOCKED / Production RELEASE HOLD.** A reviewed forward-only ACL remediation, unique migration number, isolated parity-correct real-PostgreSQL negative and positive tests, full security and CI, backup/restore, official Test exact-SHA authenticated E2E and approved GitOps gate are all required. Rollback: no runtime or DB change occurred; simply close/revert this unmerged diagnostic PR if superseded. Existing live systems remain unchanged.

## Final repository delta (23:41 KST)
- Remote branches **293 → 294**; open PRs **286 → 287** (new Draft #1464). Eight changed repository files; no branch deletion.
- The two main-ancestor branches and ten unavailable Git-object branches remain preserved because other automations may reference them; 280 locally verifiable unique unmerged branches also preserved.
- SQL catalog counts: 241 public base tables, 235 app-writable; 3 legacy PUBLIC bank overloads; app default ACL entries 8 table / 3 sequence / 1 function.
- Exact branch SHA and CI evidence are tracked in Draft PR #1464; any new commit requires revalidation.

- Conservative allowlist: only documented direct-write session tables `auth_sessions` and `oauth_challenges` are exempt from `UNREVIEWED_APP_DML`; any other direct DML requires explicit owner review. The isolated database also has unreviewed writes and is missing bank functions.
