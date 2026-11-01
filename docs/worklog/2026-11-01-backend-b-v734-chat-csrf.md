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

### RED → GREEN checkpoint (23:09 KST)
- Backend RED: 2 of 4 new Nest HTTP cases failed, missing CSRF returned 201 instead of 403; GET and valid-token paths already passed.
- Frontend RED: 4 of 4 composer flow tests failed because no server-side composer existed and the browser directly POSTed without CSRF.
- Backend GREEN: 9/9 HTTP tests across CSRF and bigint cursor fixtures. New class-level CsrfGuard preserves Session→Authenticated→Consent ordering; existing cursor test doubles explicitly override CSRF only for unrelated parsing tests.
- Frontend GREEN: 15/15 composer and abuse report tests. Browser composer now calls a server action that uses existing `mutate()` CSRF token acquisition for both conversation open and message send; no direct browser write or exposed token.
- No new route, SQL, migration, WLD change, or service restart. Existing chat server actions remain unchanged for other callers.

### Gate correction (23:13 KST)
- First full typecheck PASS, Nest build PASS, Next build PASS (602 static pages).
- Full lint found 1 new error: Next's reserved `module` identifier in the new Nest HTTP test; renamed the local test fixture variable without touching runtime code. The 1,027 existing warnings are unchanged.
- All gates must be rerun at the new SHA; no claim of a green candidate from the previous SHA.

### Full-gate and PostgreSQL checkpoint (23:21 KST)
- Backend focused HTTP 14/14 PASS (including all eight mutation routes, GET safe method, token rejection and successful token acceptance); frontend composer/report 15/15 PASS.
- Full frontend Vitest 2,908 PASS. Backend Vitest 2,972 PASS / 2 FAIL / 518 SKIP; the two failures are unchanged profile HTTP fixtures returning 401 (QA v1447, existing PR #2265), not chat.
- Full lint PASS after correcting the reserved test variable (0 errors / 1,027 existing warnings). Full typecheck PASS; Nest build PASS; Next production build PASS (602 static pages).
- Contract 41 PASS; database package 62 PASS / 4 SKIP; mobile App API contract matches. Production dependency audit 0 known; full audit FAIL (9 known low/moderate vulnerabilities).
- Disposable PostgreSQL 17.11: 319 migrations and 319 checksum rows applied, 256 public tables, auction execute privilege false. Real PostgreSQL game/session/chat report tests 40 PASS, no skips in final isolated run. Earlier generic run 37 PASS / 8 SKIP because the chat suites require dedicated env; final run enabled the report suite. The separate paging fixture requires seeded data and was not claimed as passing.
- Isolated containers removed, no shared DB write. Exact-SHA official Test and authenticated E2E not verified. Production remains prohibited.

### Final candidate gate checkpoint (23:28 KST)
- Full root `pnpm test`: FAIL at the same pre-existing profile fixture 2 HTTP 401 cases; backend now 2,977 PASS / 2 FAIL / 518 SKIP. No profile guard bypass or unrelated PR modification.
- Repeated full lint PASS (0 errors, 1,027 warnings), full typecheck PASS, Nest build PASS and Next production build PASS at the tested candidate.
- Security/release Node suite 164/164 PASS. Exact-SHA public Test gate FAIL: `backend_version_unverified`, `frontend_version_unverified`. Host Test runtime identity BLOCKED by `EACCES` reading protected `/etc/moneyverse/test-backend.env`; no privilege escalation.
- Draft/HOLD PR #2389; GitHub CI classify, policy, release-input PASS, runtime-check and verify/runtime-check IN_PROGRESS at this checkpoint.
- Latest `origin/main` still `3d5e321c3d1221febff677469fecdfcb3cf42e7d`; English and Korean plans remain v1518 in main. No merge authorization.
- Security/frontend handoff: chat browser composer flow is included in this same PR to prevent a backend-only break; A/C should avoid independently adding direct browser CSRF bypasses.
- No main merge, Test deployment, Production promotion, or deletion of other worktrees. Both task-owned PostgreSQL containers stopped and removed. No live chat/member data was accessed.
- Remaining blockers: root backend test failures, CI runtime, official Test exact-SHA + authenticated E2E, financial DB/ledger QA P0 findings, independent backup restore and operator GitOps approval.

## Finished — 2026-11-01 23:28 KST
**PARTIAL / BLOCKED.** Real code change and regression proof are preserved in Draft/HOLD PR #2389. Production is prohibited.
