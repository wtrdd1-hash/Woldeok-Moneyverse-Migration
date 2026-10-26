# Plan: Preserve privileged session absolute expiry during CSRF rotation

## Scope and rationale
Migration 057 issues a separate administrator session with a strict 30-minute expiry. `rotateCsrf` currently contains a second CASE arm that extends that session to 30 days, defeating the SQL-defined absolute lifetime. The intended member session sliding lifetime is 180 days and must remain unchanged. Existing session/cache/CSRF contracts remain intact.

## Tasks
1. Add focused regression assertions to `backend/src/auth/session.repository.test.ts`: inspect SQL for member sliding and admin no-extension, and assert the active/unrevoked predicate. Run test to observe RED on current main.
2. Remove the administrator expiry-extension arm in `backend/src/auth/session.repository.ts`. Keep member sliding branch and `ELSE expires_at`; retain cache invalidation and CSRF rotation. Run focused tests GREEN.
3. Run backend full test, contract, typecheck, lint, build, security checks and any feasible isolated PG integration. Record skipped/failures accurately. Re-fetch latest main and plan, then push independent branch and create Draft PR. Keep official Test and Production unchanged until required gates pass.
