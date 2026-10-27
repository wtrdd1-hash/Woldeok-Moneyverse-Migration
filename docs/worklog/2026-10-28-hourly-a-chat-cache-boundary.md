# Engineering A — Private Chat Cache Boundary (2026-10-28 01:25 KST)

## Before work
- Baseline: `4f5efd1f48615f0112701feec25a9b0fc67d9719` from `origin/main`; isolated branch `auto/hourly-a-chat-cache-boundary-20261028-0125`.
- Read `AGENTS.md`, `README.md`, `docs/planning/PROJECT_PLAN.md`, Korean counterpart, previous QA A report, current QA v1329, PR inventory, CI and Superpowers worktree/TDD/verification guidance.
- Goal: P1 member-chat privacy. Authenticated chat history/unread and mutation receipts must never be cached by browsers or mobile proxies; guard and upstream error paths must be no-store too. Keep chat SQL/ledger, applied migrations, auth and other agents untouched.
- Design: Backend chat controller response interceptor sets private no-store; Next app-api chat group overrides upstream and gateway failures; chat browser fetches explicitly no-store; regression HTTP and app gateway tests. Database access remains via existing actor-scoped repository; no migration. Trade-off: HTTP caching hardening does not repair known direct-table SQL privileges or chat image ownership.
- RED/GREEN: add failing HTTP and gateway regression tests before code, then minimal implementation. Full gates, isolated PostgreSQL, exact SHA official Test only if identity gate passes. Release HOLD otherwise.

## In progress
- Isolated worktree created; no other worktree modified. RED: backend 2 privacy header failures/1 PASS; gateway 3 privacy header failures/16 PASS. GREEN: backend 3 PASS; gateway 19 PASS. Added browser no-store chat polling. Existing PR #1607 includes Android chat no-store: overlapping change will remain Draft/HOLD and must be deduplicated before merge.

## Finished
- Pending evidence.
