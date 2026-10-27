# Backend B v582 — Club member roster and feed paging integrity (DRAFT / HOLD)

## Before work — 2026-10-27 13:40 KST
- Starting `origin/main`: `584f01a9c8df3f9005a7e5aa6d13e4719914ae0c` (re-fetched).
- Isolated branch: `auto/hourly-b-club-roster-feed-paging-v582-20261027-1340`.
- Debian 13.6 miniPC connected. Root 100% (573 MiB available), data volume 99% (3.1 GiB available). No shared database writes or worker cleanup.
- Read AGENTS.md, README.md, English canonical and Korean supporting PROJECT_PLAN, recent QA issues/CI and open PRs. PR #1473 touches club discovery in the same controller/repository: preserve its independent changes on integration; do not cherry-pick or alter that worker branch.
- Finding: `GET /clubs/:id/members` and `GET /clubs/:id/feed` use `Number.parseInt` on untrusted query values; e.g. `2junk` and `1e2` silently become valid numbers. Repository also clamps invalid numeric arguments, potentially masking invalid requests.
- Scope: strict, bounded, canonical integer validation at HTTP and repository boundaries for roster `limit/offset` and feed `limit`. No schema/API route change, financial mutation, grants or other workers' code.
- Design approval basis: user's standing instruction explicitly authorizes selecting and implementing one existing P1 Backend defect; bounded change with fail-closed HTTP 400. All other design/release gates remain mandatory.

## In progress
- [ ] TDD RED reproduction for malformed and duplicated query values and repository direct calls.
- [ ] Minimal strict parsing and repository defense in depth.
- [ ] GREEN focused tests; full typecheck/lint/test/build/security/CI as feasible.
- [ ] Read current main/plans again, record blockers, PR draft/hold.

## Finished
- Pending verification. Never merge or deploy without all required gates.
