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
