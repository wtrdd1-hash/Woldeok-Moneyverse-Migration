# Development A — Owner-private read notification filter (2026-10-30)

## BEFORE WORK
- Base `origin/main`: `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`; 15 remote refs (main + 14), 13 open draft PRs. Preserve every unique branch and concurrent B/C/QA/planning change.
- Read AGENTS.md, README.md, docs/planning/PROJECT_PLAN.md and .ko.md, integrated planning master, QA v1389 and running QA v1390; release remains HOLD.
- Bounded design: authenticated members may filter existing notification inbox by read status (all, unread, read) while retaining category, stable ordering, pagination, and owner-only SQL. Existing `unreadOnly` contract remains backward compatible; add `readOnly` with fail-closed conflict rejection. No new route, table, grant, or ledger mutation.
- Android app-api already forwards `/api/v1/notifications` and query strings; verify exact forwarding, private headers, auth and noindex. Do not log notification content.
- Scope: backend DTO/controller/service, Next BFF, accessible web tabs, regression tests, Android app-api contract. Feature rollback: remove `readOnly` UI/filter while retaining legacy unreadOnly.
- Acceptance: TDD red-green; isolated PostgreSQL owner/read/category/limit and no new DML; build/lint/typecheck/unit/integration/security/a11y/SEO/app-api; exact SHA official Test and GitOps release gates before merge/promotion.

## IN PROGRESS
- Worktree `auto/hourly-a-20261030-1425-notification-read-filter` created from clean main. Tests first, implementation second.

## FINISHED
- Pending verification. Do not infer release readiness from targeted tests.

### Mid-run verification and blockers
- TDD RED confirmed (backend 3 expected failures; frontend 2 expected failures) before implementation; subsequent targeted tests GREEN.
- Backend notification suite: 18 PASS. Frontend notification suite: 43 PASS with `NODE_ENV=test`; a prior `NODE_ENV=production` run failed in React.act, not feature behavior. Android app-api GET query forwarding/private/noindex tested.
- Fresh disposable PostgreSQL 17.11: 305 contiguous source migrations 002..306 applied, hashes recorded in isolated `schema_migrations`. Synthetic notification fixture 60 owner + 100 foreign rows passed read/unread/category-before-limit/tie-order/owner isolation; transaction ROLLBACK and fixture absent afterwards. App ledger INSERT/UPDATE and audit DELETE are false in isolated DB.
- **P0 schema blocker:** after all 305 canonical migrations, `to_regclass('public.in_app_notifications')` is NULL. The fixture tests SQL behavior only, not availability of a real notification inbox in a fresh deployment. Existing planning issue #1693 documents this lineage gap. No unreviewed migration or direct app-role grant added.
- `pnpm typecheck` PASS; `pnpm lint` 0 errors/1043 warnings; full `pnpm build` PASS after fixing an initially duplicated import; `pnpm audit --prod --audit-level=high` no known vulnerabilities. Initial Prettier check on legacy edited files fails baseline formatting; new test files formatted.
- Full backend 2566 PASS / 119 FAIL / 495 SKIP; full frontend 2611 PASS / 53 FAIL. Failure names exactly match QA v1389 for both suites (0 candidate-only failures). Database unit 56 PASS / 4 SKIP. No claim of full gates PASS.
- No official Test exact candidate SHA, authenticated E2E, independent backup restore, GitOps authorization, or Production smoke; no merge, DB/ledger mutation, Test/Production deploy or rollback. Release HOLD.
