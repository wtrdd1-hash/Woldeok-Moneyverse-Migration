# Development B v520 — support operator write step-up

Date: 2026-10-25 02:40 KST. State: **BEFORE WORK / RELEASE HOLD**.

## Baseline and coordination
- Authoritative `origin/main`: `c9a868b1e622341e2daa8b936ddf0988eda9988e` (git fetch + ls-remote).
- Independent worktree: `/srv/moneyverse-data/build-workspaces/mv-b-v520-20261025-0240`; branch `auto/hourly-b-support-admin-stepup-v520-20261025-0240`.
- Read AGENTS.md, README.md, both living plans, recent QA/security issues, latest CI and open A/C/B/Planning PRs. C #1135 edits member support actions, not admin support controller or admin UI; do not modify its branch.
- Source finding: `AdminSupportController` already requires role and console session and CSRF, but its member-visible `reply` and ticket `status` writes lack `ReauthGuard`. Existing ReauthGuard requires an independently verified session step-up within 900 seconds. Treat as P1 defense-in-depth, not evidence of exploitation.
- QA #993 shared DB over-grants, #1170 root storage 100%, #1147 migration number conflicts, and unmerged release gate PRs are independent P0/P1 blockers.

## Planned execution
- [ ] RED: backend metadata tests require recent reauthentication for both administrator support mutations.
- [ ] RED: admin support UI test requires an actionable account security step-up link.
- [ ] GREEN: add method-level ReauthGuard without changing member support or API wire format.
- [ ] GREEN: add a visible 15-minute step-up notice and account security link; preserve noindex and admin console gate.
- [ ] Verify changed tests, lint, typecheck, backend build, frontend build, full tests, security audit, CI and exact-SHA Test where possible.
- [ ] Refresh latest main and plan, document immutable SHA, release HOLD, PR and no Production promotion.

No DB migrations, account balances, member support writes, deployment or existing worktrees may be changed.

## IN PROGRESS — test-first implementation
- Backend RED: 2 failed reauthentication guard assertions (2 existing CSRF tests passed); frontend RED under `NODE_ENV=test`: 1 missing step-up notice/link (3 existing UI tests passed). The host defaults to `NODE_ENV=production`; unmodified React tests fail with `React.act is not a function` unless explicitly set to test.
- GREEN: backend support+auth guards 36/36; frontend support view+page 7/7.
- Actual changes: method-level ReauthGuard on admin reply/status only; administrator support page links to existing `/account/security` reauthentication. No member support path, DB, ledger, or API wire format changes.
- Next: run full gates and CI; official Test exact-SHA remains a required release blocker.
