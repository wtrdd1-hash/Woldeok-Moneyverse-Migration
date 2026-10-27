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
