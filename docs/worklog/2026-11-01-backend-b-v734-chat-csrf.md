# Backend B v734 — private chat CSRF integrity

## Before work — 2026-11-01 23:07 KST
- Origin main: `3d5e321c3d1221febff677469fecdfcb3cf42e7d`.
- Branch: `auto/hourly-b-v734-chat-csrf-20261101-2305`; isolated miniPC worktree.
- QA v1447: P0 release HOLD, known backend profile fixture failures, Test SHA mismatch, production financial/DB ACL blockers. Draft #2386 owns shop holdings; A/C own announcements and security feedback.
- Root cause: `ChatController` uses SessionGuard/AuthenticatedGuard/ConsentGuard but not CsrfGuard for private message writes, blocks and reports. The browser composer directly posts to App API without a CSRF token, while existing Next server actions already use `mutate()` with a session-bound CSRF token.
- Scope: protect all chat mutations, preserve GET/HEAD, route JSON, DB and ledger; move browser composer through verified server actions rather than exposing CSRF tokens.
- Non-goals: shared DB writes, migrations, changing other worktrees, merge or deployment without full release gates.

## In progress
- [ ] RED Nest HTTP CSRF tests and frontend composer flow tests.
- [ ] GREEN minimal guard and safe composer server action.
- [ ] Focused regression and adjacent chat tests.
- [ ] Full lint/typecheck/build, unit/integration, isolated PostgreSQL and exact-SHA Test/CI evidence.
- [ ] Re-fetch main and both plans; Draft/HOLD PR only if gates remain blocked.

## Finished
Pending.
