# A0751 — Private notification archive snapshot (HOLD)

## Before work — 2026-10-26 07:51 KST
- Canonical main `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; 237 remote branches and 233 open PRs before new branch. Prior QA/CI: frontend six failing cases, dependency audit Critical/High; root filesystem 100%, data 76%.
- Read AGENTS.md, README.md, docs/planning/PROJECT_PLAN.md and .ko.md, integrated planning master EN/KO, notification source and prior PRs. Main has owner-session guarded notification list; planned archive/export is not implemented. Avoid overlap with A0725 privacy, B0735 status and C0745 prediction.
- Worktree isolated at `/srv/moneyverse-data/worktrees/hourly-a-notification-archive-20261026-0751`; no changes to main, other worktrees, applied migrations or Production.
- [ ] RED tests for bounded owner-only notification archive and CSV/Android contract.
- [ ] GREEN backend/frontend/API/Android implementation, security/privacy/CSV validation.
- [ ] Exact SHA focused/full gates, isolated PostgreSQL ACL and rollback, Test E2E, CI, release decision.

## In progress
- Design: read-only last-100 archive snapshot. If 101st row exists, reject rather than misrepresent an incomplete export. Authenticated session user ID is server-derived; no client-supplied actor. Preserve timestamp and notification status. Reject malformed rows and CSV formula injection. No new migration, no ledger write.
- Known P0 release blockers: disk 100%, full frontend six failures, security audit findings, exact-SHA official Test not established. Never merge or deploy without gates.

## Finished
- Pending.
