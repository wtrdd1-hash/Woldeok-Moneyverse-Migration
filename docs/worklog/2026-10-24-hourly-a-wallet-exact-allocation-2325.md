# Development A — Exact Wallet Pocket Allocation (2026-10-24 23:25 KST)

## BEFORE — 23:29–23:34 KST
- Direct miniPC Debian 13.6 MCP status and command: backend, frontend, Discord bot, MCP, nginx, Docker ACTIVE; DB connected. Verified systemd/Docker independently.
- Fresh `origin/main`: `c9a868b1e622341e2daa8b936ddf0988eda9988e`; isolated branch `auto/hourly-a-wallet-allocation-20261024-2325` at same SHA; clean worktree.
- Remote inventory: 79 branch heads (78 non-main), 75 open PRs at start; latest main CI #40101900724 SUCCESS, Test Candidate #40101901061 SUCCESS, but these are not this feature SHA and do not prove authenticated Test E2E. Existing QA v1209 RELEASE HOLD: production-connected DB least privilege, migrations, security and official Test blockers.
- Read AGENTS.md, README.md, docs/planning/PROJECT_PLAN.md and .ko.md, INTEGRATED_PLANNING_MASTER.md and .ko.md, QA v1209, docs/INFRASTRUCTURE.md, docs/RELEASING.md. English is canonical; Korean is second language.
- Existing 75 PRs include other A wallet history/filter/preview features and B/C security/reward fixes; none will be modified or deleted. Baseline main wallet allocation radar uses `Number` on potentially 100-digit WLD, yielding precision loss/Infinity; new owner-only allocation feature is distinct.
- Checklist: [x] inspect [x] plan [ ] RED [ ] GREEN [ ] focused tests [ ] full gates [ ] PG [ ] PR/CI [ ] release decision.

## IN PROGRESS
- Pending implementation and verification. Do not interpret main CI as this branch CI.

## FINISHED
- Pending. No deployment authorized.
