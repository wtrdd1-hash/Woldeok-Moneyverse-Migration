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
