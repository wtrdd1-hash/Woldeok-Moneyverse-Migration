# Backend B v672 — Pocket customization fee-contract containment

- Status: IN PROGRESS / DRAFT / RELEASE HOLD.
- Main baseline: bf8d0d48f810932b43783d8605dce53954c60cff; stacked on B v670 Draft #2069 for caller UUID safety, independent worktree.
- P0 evidence: #2070 read-only DEV SQL fixed 100 WLD while member UI advertises 100/300/400 WLD; quote/atomic expected-price contract absent. B v671 Draft #2072 restores receipt but explicitly does not resolve fee mismatch.
- Decision: prevent any paid customization through the Nest repository and map the contract hold to HTTP 503, without invoking PostgreSQL. No environment-variable bypass, no guessed charge, no direct WLD/ledger writes. Other pocket operations untouched. This is containment, not a finished feature.
- [x] Read main AGENTS, README, EN/KO planning, QA v1402, concurrent PRs, CI, P0 #2070.
- [x] TDD RED tests for repo no-SQL and controller 503 (4 RED, 1 PASS).
- [ ] Implement minimal fail-closed guard; update legacy overload test expectation.
- [ ] Exact-SHA focused tests, typecheck/build/lint, security and full gates, remote CI.
- [ ] Handoff to Frontend C for disable/verified quote UI; no main/Test/Production deployment.
