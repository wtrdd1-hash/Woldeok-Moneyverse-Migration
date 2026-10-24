# Development A — Wallet activity filters integration (2026-10-24 09:25 KST)

## START / baseline
- Debian 13.6 miniPC services active; development DB reachable (status connector).
- Source main: `54d5140ddb49dd3e2193a2f82b71a6a0a57cfede` (fetched 09:22 KST); 58 remote branches including main, 56 open PRs at start.
- New isolated worktree `auto/hourly-a-wallet-filters-unified-20261024-0925`, based solely on current main; no edits to other agents' branches.
- Integrate owner-scoped wallet activity direction (#1074), verified category (#1090), and rolling period (#1093) filters into one usable backend/API/PostgreSQL/frontend/Android contract. These source-only candidates are independently unmerged; preserve them until verified main merge. No new migration, no ledger writes, no app-role grants.
- Known pre-existing gates: wallet CSV lint, blog test, Next/Zod dependency advisories, app-role excessive DML and Test/Production DB isolation, exact-SHA authenticated Test E2E.
- Workflow: read existing feature plans and tests; reproduce RED on base where feasible; cherry-pick source changes; resolve conflicts by composition; verify focused/full suites, real PG read-only, CI; HOLD unless all required gates PASS.
