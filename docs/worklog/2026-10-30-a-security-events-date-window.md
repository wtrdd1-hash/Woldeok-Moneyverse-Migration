# Development A — security activity date window

## BEFORE (2026-10-30 19:53 KST)
- miniPC Debian 13.6, backend/frontend/nginx/docker active; database connected; disks 53% system, 69% DATA.
- Base main bf8d0d48f810932b43783d8605dce53954c60cff; isolated auto/hourly-a-20261030-1953-security-events-dates.
- Remote heads 4; open PRs #2032 #2033 #2034. Other unique branches preserved.
- Reviewed AGENTS, README, English/Korean plans v1518, QA v1395, prior worklogs, CI and release policy.
- QA baseline: backend 119 failures, frontend 53 failures, dev DB ACL/checksum issues, official Test exact SHA blocked.

## IN PROGRESS
- TDD and exact SHA gates pending.

## FINISHED
- Pending. Release HOLD.

## MID 20:09 KST
- Implemented owner-only recent security events inclusive KST date filter in NestJS repository/controller, Next.js member screen, and Android app-api; existing SQL `account_recent_security_events(actor,20)` remains the authority, no migrations or writes.
- TDD RED observed: backend missing parser; frontend missing parser and Android 200 out-of-window accepted. GREEN: final focused backend 10 PASS; frontend + Android 15 PASS. Source-path ESLint PASS.
- `pnpm typecheck` PASS, API contract 184 endpoints/675 controller methods PASS, full local build PASS (before final UI category-link refinement; final build pending).
- Isolated PostgreSQL 17.11 with original migration 214: latest-20 owner limit PASS, other owner isolation PASS, app-role direct table SELECT denied PASS, function response fields only PASS, rollback leaves 0 events PASS. This is targeted schema proof, NOT full 311-migration parity.
- Full backend 2657 PASS/126 FAIL/501 SKIP, frontend 2702 PASS/60 FAIL. Repository-wide lint 1 ERROR (pre-existing syntax at `frontend/src/app/api/shop/purchases/route.search.test.ts:99`), 1043 WARN. QA v1395 older main had 119/53 failures, so no claim all current failures are pre-existing.
- GitHub PR #2032/#2033/#2034 runtime-check FAIL; observed closed unmerged and remote branch heads removed by concurrent workflow. Do not delete or alter other worker worktrees; investigate via existing P0 issue #2031.
- Rechecked origin/main bf8d0d48f810932b43783d8605dce53954c60cff and both integrated plans v1518. No Production/Test mutations.
