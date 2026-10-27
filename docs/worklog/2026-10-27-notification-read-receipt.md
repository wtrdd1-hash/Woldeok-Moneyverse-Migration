# Development A — verified notification read-all receipt (2026-10-27)

## BEFORE WORK — 19:25 KST
- [x] Direct Debian 13.6 MiniPC status and PostgreSQL connectivity checked; production writes prohibited.
- [x] Fetched main `59cdc2e02f0e83e5401049309c4cb89ff57c2d4c`; reviewed AGENTS, README, EN/KO project plan, planning v1370, QA v1322, existing notification endpoints, prior A PR #1567 and B/C work.
- [x] Before audit: 359 remote branches, 350 open PRs (335 Draft); duplicate main migration 280 and unmerged repair PR #1564. Preserve all unique branches.
- [x] Isolated branch from latest main. Feature scope: server-observed read-all count; no new migrations, no ledger writes.

## IN PROGRESS
- [ ] Backend RED → GREEN tests and owner-scoped PostgreSQL receipt.
- [ ] Frontend/BFF RED → GREEN tests, stale response fences.
- [ ] Android app-api contract, isolated PG, full gates, GitHub PR/CI.

## FINISHED
- Pending evidence. Production RELEASE HOLD. No merge, Test or Production deployment without exact-SHA gates.

### MIDPOINT — 19:26 KST
- TDD RED: backend 3 failures; Next BFF 1 failure; modal positive-unread regression 1 failure under NODE_ENV=test (host NODE_ENV=production otherwise breaks React.act).
- GREEN: backend 3 PASS; Next BFF + modal 8 PASS. New authenticated CSRF endpoint reads owner-scoped PostgreSQL update receipt and then authoritative unread count; web never assumes zero and refetches feed/count. No migration or finance writes.
- Existing React race fixture adjusted to resolve the *old* request, not the newly issued post-mutation request. All unmerged branches preserved.

### CONTRACT / REAL PG CHECKPOINT — 19:27 KST
- Android app-api new read-all-receipt route documented; 180 generated endpoints (legacy integer read-all remains). EN canonical and KO schema reference regenerated. Contract version v2026.10.27.1925.
- Read-only inspected live DB definitions: both existing functions are SECURITY DEFINER, owned by migrator, accepting a supplied UUID. **Existing app role has direct UPDATE privilege on in_app_notifications; P0 least-privilege blocker persists.** This change does not grant any new privilege.
- Network-isolated PostgreSQL 17.11 imported the two live function definitions read-only and used synthetic rows: 2 actor notifications marked read, 1 foreign unread untouched, 1 new actor unread observed afterward; synthetic app-role UPDATE denied. Container removed. This is not an authenticated official Test E2E nor a proof of live DB ACL compliance.
- Typecheck PASS; lint PASS (0 errors, 1,122 pre-existing warnings). Security/CI/full gates pending.

## FINISHED — 19:41 KST (code candidate, not release)
- [x] P0 false-zero read-all UX fixed across PostgreSQL function calls, NestJS authenticated API, Next BFF/client and Android app-api contract. Legacy integer read-all remains compatible. No new migrations, grants or ledger writes.
- [x] PR #1570 created as Draft with `hold` label. Code candidate SHA `7296ef4c2f2d251d1536bac846bc3ea4401b942c` before this final worklog commit; main remained `59cdc2e02f0e83e5401049309c4cb89ff57c2d4c` at start/mid/pre-PR.
- [x] Final code SHA gates: backend 1,547 PASS / 412 SKIP; frontend 1,488 PASS; contract 38 PASS; bot 8 PASS. Typecheck, lint (0 errors/1,122 warnings), backend build, frontend Webpack build, app-api generated contract, security source guards and route-ledger unit PASS.
- [x] Network-isolated PostgreSQL 17.11 executed read-only live function definitions against synthetic schema: 2 owner updates, 1 foreign row protected, 1 new unread observed, isolated app-role table UPDATE denied; disposable container removed. **No live DB mutation.**
- [ ] BLOCKED: root/database migration parity test 1 FAIL (duplicate main migration 280, repair Draft #1564). Full dependency audit Critical 2/High 8; bot audit Critical 1/High 5. Pre-existing live DB app-role UPDATE on notifications; actual functions accept UUID. Full route ledger lacks authenticated 5-pass evidence; accessibility/SEO browser and official Test exact-SHA auth/DB/user E2E unverified. Backup restore and GitOps release gate not certified.
- [x] Before audit 359 branches/350 PRs (335 Draft). Mid audit 360 branches/350 PRs (335 Draft), 65 conflicting PRs, 207 with failed checks, 0 duplicate PR head SHA; 4 branch ancestors of main, 352 diverged, 3 ahead. **No branches deleted** because other worker ownership/PR uniqueness requires confirmation. No changes to Gemini/B/C/QA worktrees.
- [x] Official Test public SHA `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`, Production `6a989b5ac0c6155587d43426d64f6def6b62c917`; both differ from candidate. No Test/Production deployment, main merge, DB migration, WLD write, feature activation or rollback. Production RELEASE HOLD.
- [x] Rollback: close Draft #1570 prior to merge; if separately released later, forward-only application revert, no schema/ledger rollback.
