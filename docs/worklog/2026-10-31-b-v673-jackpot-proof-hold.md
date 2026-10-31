# Backend B v673 — Arcade jackpot source-truth containment

## Before work
- [x] Inspect main, AGENTS, README, English/Korean plans, QA, open PRs and CI.
- [x] Identify P0 #2077: treasury/sink balances and hardcoded WLD amounts are not jackpot proof; the UI advertises fake values.
- [x] Start an independent branch/worktree from origin/main; no shared DB writes.

## In progress
- [x] Reproduce fabricated fallback in backend and frontend tests (RED 1 backend, 2 frontend).
- [x] Fail closed with HTTP 503 code jackpot_proof_unavailable and no SQL query.
- [x] Render an unverified ticker even for legacy success-shaped data; remove unsupported RNG badge and unnecessary API fetch.
- [x] Record candidate SHA, API/DB contract, focused/full tests, CI and release blockers; hand off P0 #2077 to frontend C and QA.

## Finished — candidate, not release
- Start/mid/end main: `bf8d0d48f810932b43783d8605dce53954c60cff`; PR #2084 Draft/HOLD.
- API: `GET /api/v1/casino/jackpot` now returns HTTP 503 `{code:"jackpot_proof_unavailable"}`. This intentionally disables unsupported jackpot figures until a dedicated audited DB/ledger source exists. No new endpoint or DB schema; no WLD/ledger mutation. The member page displays unverified source status even if a legacy success-shaped response appears.
- TDD RED: backend 1 failure, frontend 2 failures. GREEN: backend 2/2 (one Nest HTTP with mocked guards), frontend 2/2 SSR. Changed ESLint PASS; workspace typecheck PASS; backend/frontend builds PASS; mobile API contract 184 PASS; contract 41 PASS; database static 62 PASS/4 SKIP; security 16 PASS.
- Full lint FAIL: existing `frontend/src/app/api/shop/purchases/route.search.test.ts:99` parse error. Backend full 2,655 PASS/126 FAIL/501 SKIP; frontend full 2,703 PASS/55 FAIL. Remote CI runtime-check FAILED on parser error.
- Isolated real PostgreSQL, actual authentication E2E, official Test exact-SHA and independent restore verification not performed; required gates BLOCKED. No main merge, Test deployment, Production deployment or branch cleanup.
- Frontend C/QA follow-up: establish reviewed ledger-backed jackpot provenance, forward-only SECURITY DEFINER SQL, least-privilege/negative ACL and full exact-SHA verification before enabling any amounts or RNG proof badge. Do not treat this containment as a completed jackpot feature.
