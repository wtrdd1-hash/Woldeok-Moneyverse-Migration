# Backend B v729 — Advisor owner HTTP privacy

## Before work — 2026-11-01 20:00 KST
- Scope: P1 owner-specific financial advisor GET diagnosis and POST question responses; private HTTP headers must be set **before** session, consent and CSRF guards.
- Baseline: inspect `origin/main` SHA and advisor controller/module, PR #2295 (frontend advisor truth), QA season SQL P0 #2357 (migration 318 collision). No DB or ledger change.
- Risk: `@Header` on successful controller methods does not cover guard-generated 401/403; a shared intermediary must never cache member financial diagnosis or error context.
- Assumption: bounded security bugfix is authorized by the standing backend automation directive; no new feature or contract response body.
- Design: register advisor-controller-scoped Nest middleware in `AdvisorModule`; use real HTTP tests to verify 200/201, 401/403, 503, HEAD and unrelated public endpoint.
- Checklist: [ ] failing HTTP tests [ ] code [ ] focused tests [ ] lint/typecheck/build [ ] full tests/CI [ ] isolated PostgreSQL/Test exact-SHA [ ] PR HOLD/release decision.

## In progress
- Separate worktree and branch from current `origin/main`; do not modify other agents' branches, main or shared DB.

## Finished
- Pending evidence; no release authorized.

### RED evidence — 20:05 KST
- New real Nest HTTP regression: 6 failed / 1 passed. Guest 401, consent/CSRF 403, success 200/201, source failure 503 and HEAD lacked `Referrer-Policy` and/or private headers; unrelated public route passed.
- Command: `pnpm --filter @moneyverse/backend exec vitest run src/advisor/deoki-advisor.private-response.http.test.ts`.
- Evidence: task `logs/red.log`. No production code changed at RED checkpoint.
