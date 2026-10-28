# A0625 — Member work-task minimum WLD reward filter

## Before work — 2026-10-29 06:30 KST
- Base: `origin/main` `35971c600f25869c96f1c666d4b9f58927202730`, separate worktree/branch.
- QA v1358: production-linked DB risk, 18,000 WLD ledger/member discrepancy, excessive app DML and PUBLIC bank function rights, migration parity, exact-SHA authenticated Test and backup restore remain release blockers. Root/data/tmp capacity 98/99/97%.
- Scope: bounded optional `minReward` string filter for member work task catalogue; actor-scoped SECURITY DEFINER board read only, Next.js accessible preset selector, Android app-api query forwarding and no-store. No schema or ledger writes.
- TDD: add failing backend repository/controller, frontend filtering and app gateway tests; then minimal implementation. Run isolated PostgreSQL, build/lint/typecheck/tests/security, CI, and release gates. Preserve other agents' branches and PRs.

## In progress
- Pending implementation and independent checks.

## Finished
- Not yet verified. Main merge and Production remain HOLD pending all required gates.

### Implementation checkpoint — 2026-10-29 06:32 KST
- RED observed: backend 10/10 failures, frontend 3 reward-filter failures; controller fixture corrected to the real session `user_id` shape before GREEN.
- GREEN observed: backend new suite 10/10, frontend focused suites 35/35. Bounded 18-digit decimal string and actor-scoped `work_task_board($1)` with `$2::numeric` floor. No direct table grants or migration; web filter uses BigInt and excludes paused reward previews. Android gateway forwards exact query and prevents private cache on all statuses.
- Next: full gates, isolated real PostgreSQL, independent code review and latest main recheck.

### Verification checkpoint — 2026-10-29 06:41 KST
- Main remained `35971c600f25869c96f1c666d4b9f58927202730` at start, mid and integration preflight; English/Korean living and integrated plans re-read.
- Full local backend 1,949 PASS / 440 SKIP; frontend 1,878 PASS; DB 46 PASS / 4 SKIP; bot 11 PASS; lint 0 errors (1,099 pre-existing warnings); backend/frontend typecheck and builds PASS after repairing an isolated worktree's missing `undici` dependency link and test mock typing.
- Security `pnpm audit --prod --audit-level high` exit 0: 1 moderate, no high/critical. Red/green backend 11 and frontend 35 focused PASS. PostgreSQL 17.11 scratch instance: core + 290 migrations applied; member board 24 tasks; actor-scoped floor 100 returns 24, floor >2^53 returns 0; app-role direct catalogue SELECT=false; work board DB tests 11 PASS. Scratch container stopped; no Production/dev DB writes.
- Android `/app-api/v1/work/tasks?minReward=` forwards the exact 64-bit-unsafe integer string; all 200/400/401/500 gateway responses private no-store and noindex. Web has accessible bilingual preset selector; `/work` remains noindex. The filter is an estimated preview, not a guaranteed settlement payout.
- Release HOLD: official Test exact candidate SHA and authenticated E2E unavailable, independent restore not proven, historical 18,000 WLD member/ledger discrepancy, broad DB grants and bank PUBLIC EXECUTE, migration parity, root 98% / data 99% / tmp 97%. Never auto-merge on CI alone.
- Starting repository audit: 106 remote branches including main, 103 open Draft PRs, 3 conflicts, all unique unmerged heads preserved. PR #1788 modifies overlapping work files; integration requires sequential rebase and fresh gates, not branch deletion.

## Finished — code candidate only
- One member-visible P1 work reward-floor feature across NestJS API, PostgreSQL scoped function query, Next.js client board, Android gateway. No new migrations, DML, money mint, permissions or applied checksum edits.
- PR candidate only, no main merge, official Test or Production deployment, rollback, operational DB changes or branch deletion. Rollback after approval: revert this isolated feature commit; no schema rollback needed.
- GitHub CI and exact-SHA Test gates must be checked separately after push. Local build/test evidence does not authorize integration.
