# Backend B v712 — owner account identity HTTP privacy

## Before work
- Scope: P1 authenticated linked OAuth identity and account deletion API response privacy. Protect guard rejection as well as success, without changing authentication, database schema, ledger or API payload.
- Independent worktree based on exact `origin/main`. Existing account controller uses method `@Header` only; guard rejections run before method decorators. Account security routes already use an early privacy guard and are out of scope.
- TDD: reproduce real Nest HTTP 401/403 missing headers first, then add a controller-scoped pre-guard middleware; check GET/DELETE/HEAD and unrelated public route.
- No shared Test/Production DB writes, release, or other agents' branches. Release HOLD until all gates and exact-SHA Test.

## In progress
- [x] Reproduce failing HTTP privacy tests (RED): 9 expected header failures, 1 public route PASS.
- [ ] Implement minimal pre-guard privacy middleware (GREEN).
- [ ] Focused and repository gates, real isolated PostgreSQL, CI and release checks.

## Finished
- Pending.
