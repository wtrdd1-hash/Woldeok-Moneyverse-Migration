# A1725 — Member work task difficulty filter (2026-10-28)

## Goal / bounded scope
Allow signed-in, consented members to select difficulty 1–5 on the Work board and Android GET /app-api/v1/work/tasks?difficulty=N. Default without a filter remains identical. Reuse owner-scoped `public.work_task_board(uuid)` and never grant direct table access or change payout, ledger, or migrations. This is a read-only task discovery feature, not a reward estimate guarantee.

## TDD sequence
1. RED: backend validation and SQL predicate tests; frontend selected-filter parsing tests; app-api private no-store + query forwarding tests.
2. GREEN: validate canonical one-character difficulty; push the predicate into the existing owner-scoped function result (not filter a truncated client list); bind SQL parameters; keep legacy unfiltered behavior.
3. UI: SSR GET query, accessible labelled difficulty select + submit and no-results state; no new client-side amount math.
4. Android: existing allowlisted `work` group, query forwarded; force private/no-store and noindex on success/errors, including version/timeout failures.
5. Verify: focused tests, full backend/frontend/DB/bot, lint/typecheck/build/API-contract, isolated PostgreSQL role/actor negative tests, GitHub CI. Exact-SHA Test authenticated E2E and Production gated separately. Never merge on partial PASS.

## Safety and rollback
No migration or financial writes. Invalid difficulty fails 400 before DB read. Existing authorization/consent/CSRF stack remains. Rollback is code-only immutable image revert after approval; no live release while ledger drift, app DML grants, backup/restore and Test SHA remain unresolved. Preserve other workers' branches and 352 incident refs.
