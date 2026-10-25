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

### Midpoint — 08:01 KST
- RED: backend 3 failures (missing service/controller method), frontend module resolution failure; GREEN after implementation backend 3 PASS, frontend CSV 4 PASS.
- Rechecked remote main: `1c5b84a1c45baafcca83f375a6f99698121e9bb5` unchanged. Android proxy contract and private-header regression added.
- **P0 finding (isolated PG 17):** `wdmv_v761_test_acl` does NOT contain `public.in_app_notifications` or any `notification_%` functions. Main migrations through 279 also contain no definition. The pre-existing notification service references this missing relation. Consequently the proposed archive cannot be real-PG/E2E verified or deployed. Do not invent data, grant direct access or edit applied migrations. Requires independently reviewed additive migration/architecture decision in a separate safe sequence; main already has competing unmerged migrations 280/281.
- P0 host root remains 100% (741 MiB free); no deletions performed to preserve other worktrees and live service data.

### Verification — 08:09–08:13 KST
- Focused backend 3 PASS, frontend 18 PASS including app-api session/private headers. Mobile contract generated/check 180 endpoints PASS. Typecheck PASS, lint 0 errors/1128 warnings, full build PASS after fixing local dependency resolution without touching other worktrees.
- Full root test FAIL: contract 38 PASS, DB 15 PASS/3 SKIP, backend 1316 PASS/398 SKIP, frontend 1402 PASS/6 FAIL. Security FAIL: prod 2 High, full 2 Critical/10 High, bot 1 Critical/5 High; bot tests 8 PASS.
- Isolated PG 17.11 read-only check: 281 migrations, source relation missing, 0 notification functions. No owner/foreign ACL or exact-SHA E2E evidence. No fixture, no DDL, no financial ledger writes. No official Test or Production promotion.
- Remote branch heads checked: 238 heads, no duplicate head SHA. Three known conflicting PRs #1107/#1110/#1143. Other developers' unique commits not exhaustively proved; delete 0.

## Finished — candidate HOLD
- [x] RED tests and GREEN focused implementation.
- [x] Web/API/Android candidate, EN/KO docs, exact build/typecheck/lint and full-test evidence.
- [ ] Real-PG notification source and owner/foreign ACL (BLOCKED: source table absent).
- [ ] Full frontend/security gates and official exact-SHA authenticated Test E2E (BLOCKED).
- [ ] main merge, GitOps promotion and Production smoke (PROHIBITED).
- Rollback: no runtime or schema change, leave Production and main unchanged. No branch cleanup, preserve all unique work.
