# Development A 2026-10-25 11:25 — Citizen treasury proposal integrity

## Before work
- MiniPC Debian 13.6 connected; backend/frontend/nginx/docker active. Root 100% full (~358 MiB free), data disk ~93 GiB free. Use data-volume isolated worktree; no cleanup of other workers.
- Remote main `c9a868b1e622341e2daa8b936ddf0988eda9988e`; read AGENTS, README, both living plans and both integrated plans. Main lacks an authoritative citizen-proposal PostgreSQL read/write contract.
- GitHub open PRs: 134; remote branches: 138. Existing PR #1236 concerns quarterly citizen budget priority, **not** ad-hoc treasury proposals. Other worker PRs preserved. No deletion.
- P0 observed: Next `/api/treasury/proposals` returns three invented votes/proposals, writes JSON to local disk without verified DB ledger or voter identity, reports automatic budget execution. Client also initializes the same fictitious data. Never report those as authoritative.
- Goal: fail closed until an approved owner-scoped, idempotent PostgreSQL-backed proposal/vote/treasury settlement contract exists. Distinguish unavailable from zero proposals. No applied migration edits or production writes.

## Plan
1. RED tests: BFF GET/POST/PUT must not report synthetic success; client must not initialize invented proposals; Android API must expose explicit unavailable contract; DB least-privilege/read-only proof.
2. GREEN: remove JSON-file pseudo-authority, return explicit 503 no-store and unverified status, render accessible unavailable state, add guarded Nest route and app gateway route.
3. Re-fetch main and plans mid-run, test focused and full gates, audit branches/PR/CI, record final exact SHA and HOLD evidence.

## In progress
- Isolated worktree created from main; all other worker branches untouched.

## In progress — TDD and midpoint
- RED: frontend 4 failed (fake initial proposals and POST/PUT 200), backend import missing (new controller). GREEN: focused frontend 29/29; backend controller and real Nest HTTP routing 6/6 after importing AuthModule for guard dependencies.
- Implemented fail-closed Next BFF GET/POST/PUT (503, no-store, no invented proposal/vote), accessible honest unavailable state, guarded Nest route, Android app-api allow-list limited to `treasury/citizen-proposals`, with regression tests.
- Latest remote main and integrated plan re-fetched unchanged at `c9a868b1e622341e2daa8b936ddf0988eda9988e`. No production, DB, migration, other branch or Test writes.
- Verified no authoritative citizen proposal/voter/settlement SQL table in inspected main/host; real feature remains unavailable until approved DB contract. Full gates and exact-SHA Test remain pending.
