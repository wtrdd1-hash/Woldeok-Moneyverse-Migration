# B v756 — Bond administrator policy write boundary

## Before work
- [x] Read AGENTS.md, README, English/Korean plans, QA and open PRs, CI; fetched canonical main `a8541927c3a351d980454c66e95a3356c47e0722`.
- [x] Isolated branch and worktree; pre-existing dirty main checkout untouched.
- [x] Chose P1 uncovered administrator bond status/rate write; separate from #2458 member bond writes and #2419 P0 core ACL work.

## Plan (RED → GREEN)
- [x] Reproduce admin status PUT without CSRF and direct repository UPDATE bypass via HTTP and unit tests. RED: 5 FAIL / 1 PASS.
- [ ] Enforce admin session CSRF and fail closed on uncertified bond policy writes at controller/service/repository boundaries.
- [ ] Confirm unchanged read endpoints, typecheck, lint, builds, full suites, isolated PG, CI and Test exact-SHA; record gaps without promotion.

## In progress
RED verified: HTTP missing CSRF returned 200; authenticated status PUT returned 200; direct service and repository calls returned true and executed the mock query. See `logs/red2.log` in host task record. Implementing fail-closed boundaries.

## Finished
Pending.
