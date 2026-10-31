# Development A — member work preview EXP floor (2026-10-31 14:52 KST)

## Before work
- Verified Debian 13.6 miniPC services (backend/frontend/Discord/Nginx/Docker active, development DB connected) via direct MCP status and shell.
- Fetched main `30cbbe02f0c27a13630aedf4a39190972d890f02`; read AGENTS, README, English master plan `docs/planning/PROJECT_PLAN.md`, Korean companion, previous A QA and open PRs/CI.
- Starting remote branches: 84 (83 unique non-main, no safe deletion); open PRs: 78, conflicting: 8. Preserved all other agents' worktrees and branches.
- Created isolated `auto/hourly-a-20261031-1452-work-exp-floor` from latest main; task design and initial evidence recorded under `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-31-1452-work-exp-floor/` before editing code.

## In progress
- Chose a non-overlapping P1 user capability: minimum estimated EXP on the owner-scoped Work task board, not a reward payout. No migration, new grant, ledger mutation, or feature flag change.
- TDD RED: Backend 15 failures, Frontend 5 failures; then implemented canonical 18-digit integer-string validation, parameterized `work_experience_preview` SQL, Next.js filter, and Android app-api stale-200 rejection.
- TDD GREEN: Backend 15/15 and Frontend 21/21. Additional RED found `maxReward=0/1` legacy overload collision when combined with EXP; fixed it. A second RED found that simultaneous `availableOnly=1` and `maxReward` silently discarded the ceiling; the optional combined filter path now preserves both. Backend targeted 17/17. Accessible UI test was rerun with `NODE_ENV=test` (server default is production) and passed along with web/Android: 22/22.
- Isolated PostgreSQL 17.11: 311 migrations, one app-role test PASS, `work_task_catalog` direct SELECT false, `work_experience_preview` EXECUTE true, ledger 0 before/after, transaction rolled back and temporary container removed.
- Initial full Backend 2,793 PASS / 502 SKIP; initial full Frontend 2,791 PASS; database unit 62 PASS / 4 SKIP; security/release 22 PASS; dependency audit no known production vulnerabilities; Typecheck PASS; Lint 0 errors / 1,049 warnings. Final exact-SHA gates and GitHub candidate checks pending.
- Code commit v1 `82d29b256568e0460b23c9d0c488e15820604726` pushed; Draft PR #2156 opened with explicit HOLD. Follow-up v2 repairs combined filters and adds mandatory bilingual worklog.

## Finished / release state
- Pending final exact-SHA CI, candidate image build, and full gate confirmation. Official Test `c2129625...` differs from candidate; Production public `95485a299...` while backend/frontend process cwd points to deleted v1515. Authenticated exact-SHA Test E2E, independent restore, and GitOps release gates unverified.
- **HOLD**: no merge, Test/Production deployment, service restart, operational DB mutation, rollback or branch deletion. Unique non-main commits and other agents' work are protected.
