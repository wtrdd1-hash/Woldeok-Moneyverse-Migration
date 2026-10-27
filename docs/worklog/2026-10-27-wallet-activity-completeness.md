# Wallet activity completeness — Development A, 2026-10-27 18:52 KST

## BEFORE WORK
- Branch: `auto/hourly-a-wallet-activity-completeness-20261027-1852`; base main: `59cdc2e02f0e83e5401049309c4cb89ff57c2d4c`.
- Scope: P1 member-visible wallet activity completeness. Existing rolling 7/30-day server filtering returns at most 50 entries without an authoritative indication that more ledger entries exist. The UI must never imply that the returned list is complete when more exist.
- Decision: read at most 51 owner-scoped ledger rows using the existing PostgreSQL read-only query, return at most 50 to the client, expose `recentTransactionsHasMore` as a boolean, show a bounded-results notice in the web activity page and preserve it in Android app-api. No new migration, privilege grant, money write or changed balance precision.
- Test first: SQL query limit + 1; 50 versus 51 entries; boolean through API/mobile; notice on web. Existing 50-row response and account privacy remain unchanged.
- Mandatory HOLD: main migration 280 duplicate, full/bot dependency audit failures, official Test exact-SHA and GitOps gate. Other workers' branches/worktrees must remain untouched.

## IN PROGRESS
- [x] RED tests in backend repository/service and web/mobile.
- [x] GREEN implementation.
- [x] Full typecheck, tests, lint, build, real isolated PostgreSQL, security and app-api gates (failures recorded; release HOLD).
- [x] Re-fetch main and audit all open PR metadata; GitHub CI/PR and release evidence pending.

## FINISHED — local candidate validation, 19:02 KST
- Head `fb7e1606d43a22ab5b8d577a94ba679145cb61ff` from main `59cdc2e02f0e83e5401049309c4cb89ff57c2d4c`; no concurrent main advancement before PR.
- Real code and generated Android schema: 15 files. Backend 1,545 PASS / 412 SKIP; Frontend 1,486 PASS; contract 38 PASS; Bot 8 PASS; Typecheck, lint (0 errors/1,122 existing warnings), backend build, Next Webpack build, app-api contract, repository-security/control-bytes/Prisma guards PASS.
- Isolated PostgreSQL 17.11 (network disabled, ephemeral container removed): exact repository SQL returned 51 owner-only rows, exact 900719925474099312345 integer-string, no foreign-owner rows; app-role INSERT privilege false. Service exposes only 50 and a boolean. This is a synthetic SQL read-model check, not full authenticated Test E2E.
- Root test FAIL solely at existing main duplicate migration 280 (qualification and verified-help; missing 282); database 19 PASS / 1 FAIL / 3 SKIP. Separate repair PR #1564 is Draft/HOLD; do not duplicate its SQL migration changes.
- Full dependency audit FAIL Critical 2/High 8; Bot audit FAIL Critical 1/High 5. Route-ledger 5-pass QA, exact-SHA official Test, independent backup restore, accessibility browser E2E and GitOps release gate remain BLOCKED.
- Read-only audit pre-PR: 357 remote branches (356 non-main), 348 open PR (333 Draft), 62 conflicting, 206 mergeability unknown, 207 PRs with failed/cancelled/timed-out checks; no duplicate head SHA. No branch deleted: unique/unresolved work protected.
- No main merge, Test/Production deploy, DB write, ledger change, feature switch, rollback or cleanup of others' branches. Rollback before integration: revert this feature commit; after release use reviewed forward-only revert of app code, no schema rollback required.


### TDD evidence — 18:54 KST
- RED backend: 2 failing tests (SQL still requests 50, service leaks 51 rows). The initial fixture error was corrected before asserting RED.
- RED web: 1 failing test (`activityCompletenessNotice` absent). Android pass-through baseline 11 PASS.
- GREEN: PostgreSQL read-only query requests one extra owner row, service returns only the requested limit and boolean, web/mobile expose a truthful bounded status. Wallet link no longer claims all history.

### IN PROGRESS — 18:58 KST
- GREEN focused backend 5 PASS, frontend 14 PASS; generated Android contract now exposes the required boolean. Typecheck/lint/backend-build/Next Webpack build PASS.
- First full test and app-api contract guard failed because generated contract files were not yet committed (guard intentionally compares with HEAD); generated artifacts are part of this change and will be committed before rerunning.
- Bot test first failed due missing bot/node_modules in isolated worktree, then passed after linking existing read-only dependency installation.
- Repository security, control-byte, Prisma guards PASS after correcting invocation paths; first attempts exited 127 due stale paths, retained in evidence.
- Full dependency audit FAIL (2 critical, 8 high); Bot audit FAIL (1 critical, 5 high). Do not relax security gate.
- QA route-ledger helper requires --inventory and authenticated 5-pass evidence, not satisfied; release HOLD.
