# Backend B v673 — Arcade jackpot source-truth containment

## Before work
- [x] Inspect main, AGENTS, README, English/Korean plans, QA, open PRs and CI.
- [x] Identify P0 #2077: treasury/sink balances and hardcoded WLD amounts are not jackpot proof; the UI advertises fake values.
- [x] Start an independent branch/worktree from origin/main; no shared DB writes.

## In progress
- [x] Reproduce fabricated fallback in backend and frontend tests (RED 1 backend, 2 frontend).
- [x] Fail closed with HTTP 503 code jackpot_proof_unavailable and no SQL query.
- [x] Render an unverified ticker even for legacy success-shaped data; remove unsupported RNG badge and unnecessary API fetch.
- [ ] Validate exact SHA, document API contract, tests, release blockers and C handoff.

## Finished
- Pending. Release HOLD; no Test/Production changes.
