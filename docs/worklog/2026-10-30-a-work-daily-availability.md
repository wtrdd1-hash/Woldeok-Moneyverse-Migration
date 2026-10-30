# Development A — Work task daily availability filter (2026-10-30)

## Before work
- Base: `origin/main` `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`; independent branch `auto/hourly-a-20261030-1725-work-daily-availability`.
- Read AGENTS.md, README.md, canonical `docs/planning/PROJECT_PLAN.md`, Korean translation, integrated master, QA v1393, existing work task route/repository/UI and open PRs.
- Existing member task board supports duration and reward filters, but not a server-backed daily-availability-only filter. This change must not affect payout, quota enforcement, or the ledger.
- Safety: daily_limit <= 0 means unlimited. For a positive limit, show only rows with taken_today < daily_limit; use actor-bound `public.work_task_board($1)` before filtering. Strict `availableOnly=1` only, no user-supplied actor, private no-store/noindex, Android parity.
- Plan: RED tests (backend parser/controller/SQL, web query/UI, Android proxy); implementation; isolated PostgreSQL read-only verification; lint/typecheck/build/full tests/CI; exact SHA Test gate. Do not merge or deploy without all required PASS evidence.
- Existing P0 release blockers and independent branch changes are protected. No destructive Docker/git cleanup.

## In progress
- Worktree created from exact main. TDD and evidence pending.

## Finished
- Pending.

### Midpoint checkpoint (17:29 KST)
- RED first: backend 3 failing tests, frontend 4 failing tests; implemented the strict filter and re-ran.
- GREEN: Backend targeted 20 PASS; Frontend/Android targeted 20 PASS (`NODE_ENV=test`, since host defaults to production); typecheck PASS; changed-file ESLint 0 errors / 1 pre-existing warning; git diff --check PASS.
- Isolated PostgreSQL 17.11: own temporary container, schema core + migrations 002–306 (305 files) applied; owner-scoped function, unlimited/exhausted predicate and app-role direct catalogue SELECT denial verified in a rolled-back SQL fixture. No production DB touched.
- App API rejects duplicated/malformed availability filters and HTTP 200 payloads that contradict the requested availability; private no-store and noindex are enforced.
- Re-fetched main and canonical EN/KO plans: unchanged at 9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef. Full gates, PR, official Test and release remain pending; no merge or deploy.
