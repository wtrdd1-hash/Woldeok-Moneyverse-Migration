# Development A — Club browser mutation CSRF handoff (2026-11-02 07:25 KST)

## Before work — v1
- Base `origin/main`: `a8541927c3a351d980454c66e95a3356c47e0722`; isolated branch `auto/hourly-a-20261102-0725-club-csrf`.
- Debian 13.6 miniPC connected; backend/frontend/bot/nginx/docker/MCP active; DEV PostgreSQL connected. Do not touch Production.
- Start audit: 200 non-main remote branches, 184 with unintegrated commits, 16 ancestors; 176 open PRs, 29 conflicts. No branch deletion permitted without verifying merge and unique commits.
- Read `AGENTS.md`, `README.md`, `docs/planning/PROJECT_PLAN.md`, `.ko.md`, and prior QA/worklogs. Main's living plan is older than recent open planning drafts; do not overwrite concurrent planner changes.
- P1 handoff issue #2352: seven club browser mutation sites omit `x-csrf-token`. Backend B PR #2353 independently implements session-bound guard; do not duplicate B's changes. Existing club creation and project funding must remain ledger-held HTTP 503.
- Design: fresh same-origin `GET /app-api/v1/auth/session` for *each* mutation (never cache token across account switch), fail closed if absent/invalid/unauthenticated, then send `x-csrf-token` on same-origin club POST/PATCH/PUT. Preserve payload and upstream status, do not retry money writes. Keep API/database schema unchanged.
- Alternatives rejected: hardcoded token, caching token across sessions, disabling backend guard, direct DB grants, and duplicating PR #2353.
- Plan: (1) write RED tests for session acquisition/failure and seven caller wiring; (2) implement shared browser helper and wire all seven sites; (3) run GREEN focused/full gates, real PG read-only, app-api and security; (4) audit fresh main, CI, PR overlap and release gates. HOLD without exact SHA Test E2E and all release proofs.

## In progress — v2
- Pending implementation and verification.

## Finished — v3
- Pending final SHA, test results, QA, Test/Production/rollback and branch disposition.
