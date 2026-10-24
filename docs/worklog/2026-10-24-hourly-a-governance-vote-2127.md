# Development A — Verified citizen budget vote (2026-10-24 21:27 KST)

## BEFORE WORK
- Branch: `auto/hourly-a-governance-vote-20261024-2127`; base `49788d09494fed3e463651945b83386e87dd47bc` (`origin/main` verified after fetch).
- Remote branches: 1123 non-main refs (1124 total); 823 remote branches not merged to main; open PRs: 65. All existing workers' branches and PRs preserved.
- Read `AGENTS.md`, README, English and Korean living/integrated plans, QA release notes, open PRs, CI and worktrees. Previous #1174 exact SHA failed runtime-check (5 known frontend failures).
- P0 member defect: citizen budget vote UI sends `BUYBACK_BURN`, `INFRA`, `EMERGENCY`, while the existing SECURITY DEFINER SQL function accepts only `WELFARE`, `INFRASTRUCTURE`, `CITIZEN_DIVIDEND`, `CURRENCY_STABILIZATION`. Browser POST omits one-use CSRF token; service can return a fabricated success if repository method is missing.
- Bounded design: preserve existing PostgreSQL function/migrations, align choices and accurate descriptions, submit via server action/CSRF, fail closed if persistence cannot be verified, validate current KST quarter, and retain app-api parity. No new ledger writes, direct DML or database migrations.
- No approved Production/Test release; isolated real PostgreSQL read-only ACL inspection only. Existing security, CI, migration parity and Test exact-SHA gates remain blockers.

## IN PROGRESS
- [ ] RED tests: repository-missing/invalid choice/current quarter; web options and app-api.
- [ ] GREEN: backend/service/controller, Next server action and vote UI.
- [ ] Focused tests, lint/typecheck/build, isolated DB inspection, full gates.
- [ ] Recheck latest main and plans; publish Draft PR; document CI and release HOLD.

## FINISHED
- Pending verification; no merge or deployment authorized.
