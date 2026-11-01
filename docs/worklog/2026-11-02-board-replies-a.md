# Development A — Public Board Replies Filter (2026-11-02)

## Before work
- **State:** IN PROGRESS; isolated `auto/hourly-a-20261102-0025-board-replies` worktree created from latest `origin/main` `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`.
- Reviewed `AGENTS.md`, `README.md`, English/Korean integrated plans, QA, recent development A/B/C PRs and the public board's source. English is canonical, Korean secondary.
- **Scope:** add an opt-in `replied=1` filter for posts with at least one public reply, within the **latest 50 publicly visible posts**; preserve existing stock/title filters and all unfiltered behavior. Never imply a full-archive search.
- **Design:** backend validates the single exact query value and filters within the already-bounded PostgreSQL `SECURITY DEFINER` result; web exposes a labelled checkbox; Android gateway rejects duplicate/invalid parameters and unverified success-shaped results. No new DB function/grants/migration, no financial writes.
- **Safety:** no modifications to main, existing branches, database schema, Test or Production. Existing P0 #993 and release provenance #1984 remain blockers.
- **TDD plan:** RED tests for controller, repository SQL, web parser and Android fail-closed response; GREEN implementation; full local gates and read-only real PostgreSQL check; record final exact SHA and release HOLD.

## In progress
- [x] RED: backend 2 failed/20 passed, frontend 9 failed; captured logs.
- [x] Backend controller validates exact replied=1; SQL parameterized on bounded SECURITY DEFINER result.
- [x] Frontend checkbox, noindex, verified empty/unavailable distinction and 50-row scope.
- [x] Android gateway rejects malformed/duplicate and unverified 200; 19 frontend target tests pass.
- [x] Midpoint main rechecked `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`; full local gates run on feature commit; final exact-head CI and Test remain gated.

## Midpoint checkpoint
- Start audit: 158 remote branches including main, 141 open PRs, mergeability API reported 1 conflicting (many UNKNOWN). No branch deletion.
- RED -> GREEN: Backend 22/22 targeted PASS; Frontend+Android 19/19 targeted PASS. Full typecheck PASS; changed-file lint PASS.
- Worktree remains isolated; no migration, grant, finance mutation or production action.

## Finished — v3 closeout
- **Local code evidence:** backend 2,987 PASS / 518 SKIP, frontend 2,941 PASS, database 62 PASS / 5 SKIP; backend/frontend builds, typecheck and Android API contract (184 endpoints) PASS; lint 0 errors / 1,027 warnings; security 14 PASS; SEO/board 17 PASS; production dependency audit 0 known vulnerabilities.
- **Real DEV PostgreSQL:** moneyverse_app role, READ ONLY / ROLLBACK; public recent posts 1, replied posts 0. The SQL predicate executed; positive multirow evidence unavailable. DEV account_balances UPDATE and user_items DELETE privileges remain true (P0 #993).
- **Git checkpoints:** feature `3bd7ba3b602845a4abdff31302c36d2b658f5ac0`; regenerated Android contract `f817b25dbe4f55210ddc150c1fd2f85c058049c0`; final PR head recorded in GitHub and external evidence.
- **Changed product files:** `backend/src/board/stock-community.{controller,service}.ts`, their tests; `frontend/src/app/board/{page,board-replies-filter}.ts[x]` and helper tests; `frontend/src/app/app-api/v1/[...path]/route.ts` and Android tests; generated mobile API contract and EN/KO schema references. Documentation: EN/KO QA, release HOLD, worklog, implementation plan.
- **Branch audit:** start 158 remote branches (including main), 141 open PRs; midpoint 160 remote branches, 146 unique unmerged, 13 ancestor-only, 141 open PRs, 29 reported conflicting. No deletions: preserve all unique work and ancestor-only branches still potentially owned by other PRs/worktrees.
- **Test/Production:** Test public version `510dbe6...`, Production backend `353c6d5...`; neither is this candidate. Official exact-SHA Test authenticated E2E, independent restore, P0 ACL/finance and GitOps remain BLOCKED. No main merge, Test/Production deployment, DB/ledger write, service restart or rollback. Release HOLD.
- **GitHub:** Draft PR #2399. Local evidence under `/srv/moneyverse-data/tasks/mv-a-20261102-0025-board-replies/evidence/`.
