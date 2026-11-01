# A 17:25 Board Image Filter — 2026-11-01

## BEFORE WORK
- Debian 13.6 miniPC connected; backend, frontend, nginx, Docker and PostgreSQL active.
- Base main SHA: 1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0.
- 105 open PRs, 22 conflicts, 114 non-main branches; 107 contain unique commits and 7 are main ancestors. No deletions.
- Read AGENTS, README, English and Korean integrated plans, QA, worklogs and CI.
- P1: show image-attached posts among the latest 50 public board posts using the existing read-only PostgreSQL function; no migration or financial mutation.
- Implement validated withImage=1 across Nest, web and Android gateway with fail-closed response verification and noindex/no-store.

## IN PROGRESS
- [ ] Nest SQL and HTTP tests (RED/GREEN)
- [ ] Web form and accessibility tests (RED/GREEN)
- [ ] Android gateway tests (RED/GREEN)
- [ ] Read-only real PostgreSQL and full gates
- [ ] Recheck main/plan and publish Draft PR with release HOLD

## FINISHED
Pending verification; no deployment.
