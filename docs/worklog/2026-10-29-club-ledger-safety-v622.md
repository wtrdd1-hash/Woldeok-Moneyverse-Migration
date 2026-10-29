# v622 — Club charter and project WLD settlement containment

Status: IN PROGRESS / HOLD. Base: `35971c600f25869c96f1c666d4b9f58927202730`.

## Evidence and scope
- Migration 222's `club_create` and `club_contribute_project` directly update `account_balances` and insert only `ledger_transactions` with `ON CONFLICT DO NOTHING`; neither writes balanced `ledger_postings` or returns an immutable replay receipt. An identical idempotency key can therefore still trigger a second debit/credit before the conflicting transaction row is ignored.
- This is source-level risk, not proof of a live member loss. No database migration or live financial operation is authorized in this task.
- Implement a fail-closed API/controller, service and repository boundary for both WLD-mutating paths. Preserve read-only club directory, roster, projects, feed and canvas. Keep existing migration bytes immutable.
- Coordinate overlapping `club.controller.ts` edits with Draft #1716 (directory paging). Frontend and Android must present an explicit unavailable state before this candidate is release-ready.

## Plan and checkpoints
- [x] Inspect main, AGENTS, README, English/Korean plans, open PRs, QA and CI; use isolated worktree.
- [x] RED: 4/5 new tests fail on main behavior (HTTP 201 twice, direct service and repository writes accepted); read-only directory passes. See internal red.log.
- [x] GREEN: 5/5 new tests pass; HTTP create/contribute return 503 with `CLUB_LEDGER_SETTLEMENT_UNAVAILABLE`, service/repository direct calls reject without SQL; club directory remains 200. Updated obsolete success-only tests (7/7 focused PASS).
- [x] Verify: focused 7/7, backend 1,942 PASS/440 SKIP, database 46 PASS/4 SKIP, Typecheck PASS, Backend Build PASS, root Lint 0 errors/1,099 warnings, 180 API contracts PASS, security 18 PASS. Root production audit FAIL (1 Moderate `qs` advisory). Frontend full build/E2E and isolated full PostgreSQL NOT RUN.
- [x] Recheck origin/main `35971c600f25869c96f1c666d4b9f58927202730` unchanged mid-run; PR/CI final status below. Official Test exact-SHA and Production release BLOCKED.

## Release constraints
Unmerged source code does not protect live PostgreSQL. The `moneyverse_app` EXECUTE grants on legacy functions remain a DB-level risk and require a separate forward-only migration with isolated PostgreSQL ACL tests. No Production promotion while this or other mandatory gates are incomplete.

## Implementation and API/DB contract
- `POST /api/v1/clubs` and `POST /api/v1/clubs/:id/projects/:projectId/contributions` (Nest routes `/clubs/...`) now fail closed at controller, service and repository with HTTP 503, JSON `code=CLUB_LEDGER_SETTLEMENT_UNAVAILABLE`, before any repository SQL. No balance, ledger, migration or database privilege changes.
- Removed the old unjournaled SQL invocation from both repository methods, retaining signatures so callers compile. Read-only club directory remains HTTP 200. New HTTP/direct-call regression test is 5/5 PASS; legacy happy-path mocks for unsafe financial writes were removed.
- This is source-only containment, **not** working club creation or funding. Existing browser and Android mutation affordances are not updated. Current web create/contribute requests omit required idempotency UUID; C/A should integrate truthful disabled state, not simulate a successful charge.
- Existing closed, unmerged PR #1422 has a more complete ledger-atomic charter migration and DB ACL guard; closed #1428 had a narrower project hold. Their unique work must be preserved and rebased to current migration lineage, not overwritten. Open PR #1716 changes club controller pagination and must be integrated carefully. Existing P0 issues #1396 and #1423 remain open.

## Verification and deployment evidence
- First test RED: 4 failed, 1 passed; two HTTP routes returned 201 and direct service/repository calls accepted writes. After code GREEN: 5/5 plus 2 existing service tests PASS.
- Full backend: 1,942 PASS, 440 SKIPPED; DB package 46 PASS, 4 SKIPPED; root Lint PASS (0 errors, 1,099 warnings); Backend Typecheck PASS; Backend Build PASS; API contract 180 PASS; security policy tests 18 PASS.
- First broad gate was contaminated by an incomplete shared dependency symlink (`undici` missing), fixed by read-only linking to existing isolated package assets. The clean rerun above is authoritative for backend/lint/build. No global dependency installation or shared worktree changes.
- Production dependency audit: FAIL, 1 Moderate advisory. Official Test exact-SHA, full frontend tests/build, real PostgreSQL finance/ACL E2E, GitOps release approval: NOT VERIFIED / BLOCKED. Shared data disk 98% used; avoid large build or container expansion.
- No live database writes, Test deployment, main merge, Production promotion, service restart or branch cleanup. Existing A/B/C/planning/QA automations remain untouched.
