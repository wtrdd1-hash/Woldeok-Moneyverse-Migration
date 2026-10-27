# Engineering A — Privacy Request Receipt Cache Boundary (2026-10-28 03:25 KST)

## Before work
- Base main: b1cd54fda1123fb07ca81b6e5b3ead70f59f556c (fetch confirmed).
- Branch: auto/hourly-a-privacy-receipt-cache-20261028-0325, isolated worktree.
- Services: Debian 13.6; backend/frontend/bot/MCP/nginx/docker active, DB connected. Root 48%, data 67%.
- Starting remote non-main branches 364; open PRs 358, draft 343, conflicting 104, failed-check PRs 233, duplicate PR head SHA 0.
- Read AGENTS.md, README.md, docs/planning/PROJECT_PLAN.md and .ko.md, integrated planning master, previous A QA/release, open PRs including #1621 and QA #1610.
- P1 privacy gap: backend privacy GET/POST lack explicit private/no-store, Android gateway forwards upstream cache policy; private web page already dynamic/noindex and internal API fetch defaults no-store. Existing migration 015 owner functions must not be edited.
- Prior A/B/C/Gemini/QA branches and unmerged PRs are protected; no cleanup without proof of full integration.
- Current gates: baseline duplicate migration 283 and missing 285, existing blog lint failures, Bot critical/high audit, official Test exact-SHA unavailable; no merge or Production until fixed.
- Scope: privacy request receipt cache boundary across Backend/Next/Android API with existing PostgreSQL owner functions, without financial/DB migration writes.

## In progress
- [x] RED tests
- [x] GREEN implementation
- [x] Isolated PostgreSQL and full regression (with baseline failures recorded)
- [x] Midpoint main/planning refresh
- [x] GitHub PR and CI (Draft #1626; runtime checks failed, release HOLD)

## Finished
- Code implemented and verified locally with blockers. Final PR/CI evidence to follow. Production RELEASE HOLD.

### Midpoint checkpoint — 03:31 KST
- RED confirmed: Backend header metadata 2 failures; Android gateway/privacy page 7 failures; middleware-before-guard 1 failure. GREEN: backend 4 PASS; frontend 25 PASS.
- Backend privacy controller adds private/no-store and noindex; module middleware runs before guards to protect 401/403; Next privacy page explicitly disables fetch caching; Android gateway overrides upstream public cache for privacy, and all generated gateway problems are no-store/noindex.
- Isolated PostgreSQL 17 applied original migration 015. Synthetic owner A list 1, owner B list 0, app-role direct-table SELECT denied: PASS. **Privacy create fails with SQL ambiguous created_at**, independent baseline blocker, not fixed by this HTTP cache change. No applied migration modified.
- QA #1610 handles migration lineage/blog lint, not migration 015 privacy function; preserve and do not duplicate its SQL. PR #1386 overlaps privacy frontend/controller and requires reconciliation.
- Main and integrated EN/KO plans re-fetched; main remains b1cd54fda1123fb07ca81b6e5b3ead70f59f556c.
- All Test/Production writes, deployments, financial changes and branch deletion remain forbidden.

### Full gate checkpoint — 03:37 KST
- Backend full 1,692 PASS / 430 SKIP; Frontend full 1,687 PASS; contract 180 PASS; typecheck and full build PASS; changed-file lint PASS.
- Database package 32 PASS / 3 SKIP / 1 FAIL (duplicate 283 / missing 285). Whole-repo lint 2 existing blog errors. Bot 8 PASS after isolated offline dependency install; Bot audit 1 Critical / 5 High; root audit threshold high PASS (2 Low / 9 Moderate).
- Isolated real PostgreSQL read/ACL PASS, new privacy intake FAIL on baseline migration 015 SQL ambiguity; issue #1625 filed. Test container removed, no shared DB touched.
- Official Test /api/version 6f697e74b7bf0cd1e4521d36534cfd9c140f8010; Production 6a989b5ac0c6155587d43426d64f6def6b62c917; neither candidate, Test symlink dangling.
- Remote non-main 365 at pre-PR (363 unique ahead, 2 contained); open PRs 358, draft 343, conflicting 104, failed-check 233, duplicate head SHA 0; branch deletion 0.
- Exact-head official Test login/E2E/backup restore/SEO/accessibility/Production GitOps gates BLOCKED. No merge or deployment.

### PR and CI checkpoint — 03:44 KST
- Draft PR #1626 opened from the isolated branch; pre-PR main still b1cd54fda1123fb07ca81b6e5b3ead70f59f556c. No merge.
- Initial final-document SHA 0ee48a9c9e7307eba06c993522efda49dfb48efd: full Backend 1,692 PASS / 430 SKIP, Frontend 1,687 PASS, typecheck/build/contract/bot PASS, root audit high PASS. Root test/database parity FAIL, whole-repo lint FAIL, Bot audit FAIL.
- GitHub CI #40561981528 and Build Test Candidate #40561944186: both FAILURE, runtime checks blocked by existing blog ESLint two errors; 5 success, 2 failure, 3 skipped check contexts. Candidate build/Production gate SKIPPED.
- New baseline issue #1625 tracks privacy_create_my_request ambiguous created_at; no unreviewed migration repair. No official Test exact SHA; Test symlink target missing.
- Production RELEASE HOLD; branch/PR preserved, no deletion, no Test/Production deploy or rollback.
