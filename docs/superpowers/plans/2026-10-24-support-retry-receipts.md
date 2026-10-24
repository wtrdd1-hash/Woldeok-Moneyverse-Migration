# P1 Support message retry safety — implementation plan

## Contract and UX
Use existing authenticated `POST /api/v1/support/threads` and `POST /api/v1/support/threads/:id/messages` with CSRF and PostgreSQL migration 196 idempotency keys. Keep a single server-generated UUID per rendered form across failed attempts; never claim success without a valid API receipt. Successful requests redirect to a fresh render with a new UUID. Failed requests stay on the form and display an accessible inline error without replacing the key. Limit selection to owner-visible thread IDs. Never write to the production-linked database.

## Tasks
1. Add focused failing tests for missing/malformed receipts, repeated attempts with the same key, invalid UUID, success redirect, selected-thread scoping and accessible forms.
2. Implement stateful server actions and client forms with `useActionState`, pending controls, explicit labels and inline error announcements. Maintain existing Next session and CSRF boundary.
3. Verify focused tests, lint, typecheck, build, backend/contract and frontend suite; run isolated PG/CI and E2E where feasible, record exact SHA and failures.
4. Re-fetch main and plan mid-work and pre-merge. Draft PR if any gate remains red; do not touch A/B/QA/Gemini or Production.
