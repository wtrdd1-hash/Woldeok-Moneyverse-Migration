# Engineering A — Private Chat Cache Boundary (2026-10-28 01:25 KST)

## Before work
- Baseline: `4f5efd1f48615f0112701feec25a9b0fc67d9719` from `origin/main`; isolated branch `auto/hourly-a-chat-cache-boundary-20261028-0125`.
- Read `AGENTS.md`, `README.md`, `docs/planning/PROJECT_PLAN.md`, Korean counterpart, previous QA A report, current QA v1329, PR inventory, CI and Superpowers worktree/TDD/verification guidance.
- Goal: P1 member-chat privacy. Authenticated chat history/unread and mutation receipts must never be cached by browsers or mobile proxies; guard and upstream error paths must be no-store too. Keep chat SQL/ledger, applied migrations, auth and other agents untouched.
- Design: Backend chat controller response interceptor sets private no-store; Next app-api chat group overrides upstream and gateway failures; chat browser fetches explicitly no-store; regression HTTP and app gateway tests. Database access remains via existing actor-scoped repository; no migration. Trade-off: HTTP caching hardening does not repair known direct-table SQL privileges or chat image ownership.
- RED/GREEN: add failing HTTP and gateway regression tests before code, then minimal implementation. Full gates, isolated PostgreSQL, exact SHA official Test only if identity gate passes. Release HOLD otherwise.

## In progress
- Isolated worktree created; no other worktree modified. RED: backend 2 privacy header failures/1 PASS; gateway 3 privacy header failures/16 PASS. GREEN: backend 3 PASS; gateway 19 PASS. Added browser no-store chat polling. Existing PR #1607 includes Android chat no-store: overlapping change will remain Draft/HOLD and must be deduplicated before merge.

## Finished — vA.0125.2 (01:42 KST)
- RED→GREEN: Nest HTTP 3 PASS, Android gateway 19 PASS; browser no-store polling. Code SHA `f80bfc528cef72b6babe98c175ebd5afc00a3e15`, Draft/HOLD PR #1616.
- Final code gates: typecheck/build PASS, Backend 1691 PASS/430 SKIP, Frontend 1684 PASS, Android app-api contract 180 PASS, Bot 8 PASS, isolated synthetic PostgreSQL chat/HTTP 7 PASS.
- Full lint BLOCKED by two existing blog-data errors, database/overall test BLOCKED by migration 283 duplicate and 285 missing, bot audit BLOCKED by Critical 1/High 5. Root high-severity audit PASS (2 Low/8 Moderate). Full browser a11y/SEO, independent restore, exact-SHA official Test auth E2E and GitOps NOT VERIFIED.
- Test/Production SHA differ from candidate; Test release symlink target missing. No main merge, deployment, database/ledger write, feature flag change, service restart, branch deletion or rollback.
- Existing PR #1607 Android chat cache overlap and QA repair PRs #1610/#1614 protected. Never merge both overlapping changes without reconciliation. Full evidence `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-28-0125-*`. Status PARTIAL / BLOCKED — Production RELEASE HOLD.
