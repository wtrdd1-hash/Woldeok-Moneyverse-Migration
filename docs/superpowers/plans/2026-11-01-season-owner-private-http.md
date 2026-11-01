# Season owner HTTP response privacy — Backend B v728

## Scope and invariant

Authenticated season responses can include a member's rank, tier, season actions and refusal details. The existing `SeasonController` uses session, consent and CSRF guards, but no pre-guard HTTP privacy middleware. A rejected request never reaches controller response decorators. The fix must protect successful and rejected HTTP responses without changing authorization, SQL, money, schemas or client contracts. Existing P0 season-settlement fail-closed PR #2358 and database EXECUTE P0 #2357 remain independent and must not be merged by this task.

## Alternatives and choice

1. Add `@Header` to individual controller handlers: insufficient for 401/403 guard refusals.
2. Add a global response interceptor: too broad and may change public route caching.
3. Add a `SeasonModule` middleware scoped to `SeasonController`: selected, matches existing owner modules and executes before guards.

## RED–GREEN tasks

1. Create `backend/src/season/season.private-response.http.test.ts` with real Nest HTTP tests for owner GET, 401, 403 consent, 403 CSRF, 503 settlement, HEAD and public-route isolation. Confirm RED against unchanged `SeasonModule`.
2. Implement `NestModule.configure()` in `backend/src/season/season.module.ts` setting `Cache-Control: private, no-store`, `X-Robots-Tag: noindex`, `Referrer-Policy: no-referrer` before session/consent/CSRF guards. Confirm GREEN.
3. Run season tests, backend and frontend suites, lint, typecheck, build, API contracts, security tests and isolated PostgreSQL migration/ACL checks. Inspect CI and official exact-SHA Test status. If any gate fails or Test SHA differs, keep PR Draft/HOLD and do not merge or deploy.
4. Record start/mid/end main SHA, test evidence, unchanged API/DB contract, and protected worktrees in worklog and PR.

## Review boundaries

No new DB migration (318 collision in pending branches), no season reward settlement reactivation, no modifications to shared DB or another agent's worktree, no Production changes. Require independent review before release.
