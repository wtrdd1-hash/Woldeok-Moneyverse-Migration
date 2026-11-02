# Backend B v766 — SECURITY DEFINER search_path release boundary

## Before work
- Authority: origin/main f5c3fbedae1c3b3ec2374882b049aac43a655eb4; English and Korean planning read; QA v1477 read.
- Independent branch: auto/hourly-b-v766-release-function-exec-acl-20261103-0135.
- Verified Production-connected DEV database read-only: 548 public SECURITY DEFINER routines, 23 without the required `pg_catalog, pg_temp` path (7 `public, pg_temp`, 7 `pg_catalog, public`, 6 `pg_catalog, public, pg_temp`, 3 missing).
- P0 scope: fail-closed *release preflight* detection of dangerous definer paths. No change to functions, grants, migration history, ledger or balances. Production remediation requires separate reviewed forward migration.
- Existing overlapping B PRs #2546/#2550/#2553 cover TRUNCATE, TRIGGER/MAINTAIN, role escalation respectively; this scope is distinct.
- QA v1477 reports root disk 96%, official exact-SHA Test blocked and production HOLD; do not run memory/disk-heavy shared builds or deploy.

## Plan
1. [x] Write isolated PostgreSQL RED regression proving unsafe paths and wrong DB identity fail.
2. [x] Implement read-only SQL and CLI release checker, with strict database identity and fail-closed behavior.
3. [x] Run GREEN regression, read-only actual DB probe, source static checks, re-fetch latest main and plan.
4. [x] Record API/DB contract (no API or schema change), CI/Test gate status and HOLD, push independent Draft PR.

## In progress — verification
- RED: isolated PostgreSQL test failed on missing checker (exit 1); fixture startup corrected before meaningful RED.
- GREEN: PostgreSQL 17.11 isolated test PASS (safe, invoker excluded, unsafe public, missing path, extra public, repaired, wrong DB, empty inventory).
- Live read-only: `PG_CONTAINER=woldeok-moneyverse-dev-db-1 EXPECTED_DATABASE=woldeok_moneyverse_dev ./scripts/release/verify-security-definer-path.sh` exits 3 and reports `SECDEF_PATH_BLOCKED: 23 of 548`. This is a correctly detected unresolved P0, not a green production security gate.
- SQL runs `BEGIN READ ONLY` and `ROLLBACK`; no schema/privilege/migration/ledger modifications. No API contract change.
- Bash syntax and `git diff --check` pass. No dependency install, lint/typecheck/full build/unit/full CI/E2E attempted on root disk at 96% used; these remain BLOCKED/NOT RUN, not PASS.
- Candidate not merged, no official exact-SHA Test run, no independent restore, no GitOps release approval. Production HOLD.
- A safe remediation needs reviewed forward-only migrations and per-function behavioral tests; blindly rewriting search_path risks breaking existing unqualified SQL.

## Finished — Draft PR #2557 / RELEASE HOLD
- Final main re-fetch: `f5c3fbedae1c3b3ec2374882b049aac43a655eb4` (unchanged since start). No merge or deployment attempted.
- Code: `scripts/release/verify-security-definer-path.sql`, `scripts/release/verify-security-definer-path.sh`, `scripts/release/verify-security-definer-path.test.sh`. Explicit expected DB identity, no writes, fail-closed on missing/noncanonical definer search_path.
- API contract: unchanged. DB schema/migrations/permissions: unchanged. Existing 23 unsafe functions remain and require a separate reviewed remediation.
- Isolated PostgreSQL regression: PASS (8 scenarios); bash syntax and diff check PASS. Live read-only production-connected DB: BLOCKED 23/548, exit 3.
- Full workspace build/lint/typecheck/unit/integration/security/app-api/E2E, remote required CI and official exact-SHA Test: NOT RUN/NOT CONFIRMED; root disk 96%, production DB privilege/checksum drift. No PASS claim.
- Draft PR: #2557. No merge, Test deploy, Production deploy, DB mutation, branch cleanup or other worker modification. Release HOLD.
