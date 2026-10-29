# v2026.10.29.0525 — Member work task duration filter (source candidate / release HOLD)

## Scope and authority

Base `origin/main`: `35971c600f25869c96f1c666d4b9f58927202730`. Branch `auto/hourly-a-work-duration-20261029-0525`, isolated worktree. This P1 feature lets a signed-in member choose a maximum *required minimum task duration* of 1, 2, 3, 5, 10 or 15 minutes on `/work`. The same optional `maxDurationSeconds` query is available to Android on `GET /app-api/v1/work/tasks` (strict integer 1–86400); absent parameter preserves the full board. English is the canonical API specification, Korean the secondary UI/documentation language.

## Implementation and safety

- `WorkController.tasks` uses existing session, authenticated, consent and CSRF guard stack; the caller cannot choose a user ID. Invalid, repeated, zero, negative, fractional or oversized durations receive HTTP 400.
- `WorkRepository.tasks` keeps `public.work_task_board($1)` as the authoritative actor-bound SECURITY DEFINER read and applies a parameterized inclusive duration predicate to its result. No direct app-role table reads, new migration, new grants, finance, idempotency, reward, ledger or settlement changes.
- Next's server component allowlists six web presets before calling its internal API. A labeled GET form preserves accessibility, avoids browser-side internal API calls and displays an explicit empty state.
- Android gateway forwards the exact query string; a regression test identified that work responses could lack private caching headers. All `/app-api/v1/work/*` responses now enforce `Cache-Control: private, no-store` and `X-Robots-Tag: noindex`, including error paths.
- Mobile contract JSON and both generated English/Korean API references updated.

## Verification

- TDD RED observed before implementation, then GREEN. Focused backend 15 PASS, frontend duration 13 PASS and Android gateway 26 PASS.
- Isolated PostgreSQL 17.11: 290 migration files applied to a new isolated database. With an active synthetic member inside a rollback-only transaction, `work_task_board` exposed 24 active tasks, 8 with minimum duration <=60 seconds. App-role direct SELECT on `work_task_catalog` denied. The real-PG repository integration test passed, and the transaction rolled back.
- Full backend: 1,954 PASS / 441 SKIP; full frontend final: 1,885 PASS; database 46 PASS / 4 SKIP; bot 11 PASS. Full lint 0 errors, 1,099 existing warnings. Final backend/frontend typechecks and complete test suites re-run after the app-gateway regression addition and passed. Backend build PASS. Frontend build PASS after fixing a test typing issue, using a temporary 2-worker build setting; the configuration was restored. Typechecks PASS.
- Production package audit: zero High/Critical (one Moderate). Bot audit: zero vulnerabilities. Exact candidate CI and official Test not yet verified at the time of writing; release HOLD.

## Release and rollback

Do not merge or deploy on code/CI evidence alone. Historical 18,000 WLD ledger drift, broad application DB DML grants, PUBLIC bank EXECUTE grants, migration parity gaps, independent backup restoration, exact-SHA authenticated official Test E2E and 98–99% disk usage remain blocking. No Production/Test deployment, live DB writes, branch deletion, ledger repair or rollback was performed. If later approved, rollback is application-code revert (no schema migration). Existing work difficulty Draft #1723 touches some shared files; rebase and rerun gates after coordinated integration.
