# Development A — Verified member bank movements (2026-10-25 22:25 KST)

## Start (2026-10-25 22:30 KST)
- Status: IN PROGRESS / RELEASE HOLD. Debian 13.6 miniPC connected; backend/frontend/nginx/docker ACTIVE. Root 98% used (2.3 GiB free), data 64% used (68 GiB free).
- Authoritative main at start: `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; remote main checked via `git ls-remote` and fetched.
- Separate branch/worktree: `auto/hourly-a-verified-bank-movements-20261025-2225`, `/srv/moneyverse-data/worktrees/hourly-a-verified-bank-movements-20261025-2225`.
- Plan: `docs/superpowers/plans/2026-10-25-verified-bank-movements.md`. Read AGENTS.md, README.md, docs/planning/PROJECT_PLAN.md/.ko.md, integrated master, latest PRs/CI, previous A release hold. English is canonical, Korean is secondary.
- Scope: P1 owner-only read-only bank deposit/withdraw movement receipts, verified from existing PostgreSQL double-entry ledger, browser and Android gateway. No new ledger writes, no applied migration modifications, no changes to other teams' worktrees/PRs.
- Global release blockers known: main Frontend regression failures, dependency audit, official Test exact SHA mismatch; never merge or deploy without gates.

## Midpoint (2026-10-25 22:37 KST)
- Rechecked remote main SHA `1c5b84a1c45baafcca83f375a6f99698121e9bb5` and living plans (unchanged).
- TDD RED: backend new `recentMovements`/controller missing (5 failed); frontend page missing and Android private cache regression (2 failures). Initial broad test invocation accidentally ran all suites due to pnpm `--` forwarding; subsequent focused commands invoke `pnpm exec vitest run` directly.
- TDD GREEN: Backend 5/5; Frontend page + Android gateway 3/3 after correcting duplicate amount assertion.
- Implemented owner-scoped read-only SQL, strict 1..50 limit, BigInt balanced cash/bank proof and direction validation, no fabricated results; browser bank history page and link; Android private no-store/noindex override.
- Isolated real PostgreSQL 17.11 `woldeok_moneyverse_ci` (214 applied migrations): created synthetic user and 100 WLD bank deposit inside one transaction, `SET LOCAL ROLE moneyverse_app`, executed exact source SQL, verified owner returns 1 ledger row, foreign actor returns 0, ledger INSERT/Posting UPDATE denied, ROLLBACK successful. No Production write.
- Next: full lint/typecheck/test/build/audit/contract/SEO/a11y, remote CI and exact-SHA Test checks. Global release HOLD remains.


## Final (2026-10-25 22:45 KST)
- Code SHA `aac1ce7cfc79aa0775ea8e671e845e61d3dbd202`; documentation/report commit to follow. Draft PR #1336. Main remains `1c5b84a1c45baafcca83f375a6f99698121e9bb5` at final preflight.
- Changed code: `backend/src/bank/bank.controller.ts`, `backend/src/bank/bank.repository.ts`, `backend/src/bank/bank-movements.test.ts`, `frontend/src/app/bank/page.tsx`, `frontend/src/app/bank/movements/page.tsx`, `frontend/src/app/bank/movements/page.test.tsx`, `frontend/src/app/app-api/v1/[...path]/route.ts`, `frontend/src/app/app-api/v1/[...path]/bank-movements-app-api.test.ts`. New plan/QA/EN+KO release/worklog docs.
- 11 focused PASS. `pnpm typecheck` PASS, `pnpm lint` 0 errors/1,128 warnings, `pnpm build` PASS, API contract 179 PASS, real isolated PostgreSQL owner/foreign/ACL/ROLLBACK PASS. Backend 1,318 PASS/398 SKIP; database 15 PASS/3 SKIP; contract 38 PASS; Frontend 1,400 PASS/6 FAIL (SEO3, login a11y1, calculator CTA1, admin M2 1); Bot 8 PASS. Audits: prod High2, full Critical2/High10, bot Critical1/High5.
- Remote branches 193→194; open PR 189→190; 193 non-main branch tips unique unmerged; 0 safe deletions, 0 duplicate tip/tree/last patch groups (2 patch unknown); conflicts #1107/#1110/#1143 preserved. No other developer worktree touched.
- Test public SHA `6f697e74b7bf0cd1e4521d36534cfd9c140f8010` != candidate; Production SHA `6a989b5ac0c6155587d43426d64f6def6b62c917`. Exact-SHA Test authenticated E2E and GitOps release gates BLOCKED. No main merge, Test staging, Production deployment, Production DB write, restart, or branch deletion. Rollback: revert read-only feature commit; no schema migration.
- Reports: `docs/qa/2026-10-25-a2225-verified-bank-movements.md`, `docs/releases/v2026.10.25.a2225.md`, `.ko.md`. Final GitHub CI and PR status must be rechecked on report commit.
- **Outcome: PARTIAL / BLOCKED — Production RELEASE HOLD.** Recurring schedules untouched.

