# Hourly A — member support recent-subject search (2026-10-28 08:25 KST)

## Before work
- Source main: `b1cd54fda1123fb07ca81b6e5b3ead70f59f556c`; isolated branch: `auto/hourly-a-support-recent-search-20261028-0825`.
- Objective: authenticated member-only literal case-insensitive subject search over **the latest 100 own support threads**; no claim of all-history search. No schema change, writes, finance mutation, or elevated DB grants.
- Read AGENTS, README, English/Korean living plans, integrated planning, previous A/QA worklogs and open PR inventory. Existing Draft #1421 is status filtering; do not implement status filtering or alter its scope.
- Design: optional bounded `q` on existing owner-only GET; filter in SQL over the existing SECURITY DEFINER `support_my_threads(actor,100)` result, not direct table access. Preserve legacy 50 default; ensure literal substring semantics (`strpos`), no SQL injection/wildcard expansion, invalid query 400, private no-store. Web GET form shows exact search scope and preserves query in links. Android gateway passes query and never publicly caches response.
- Success: RED→GREEN controller/repository/frontend/gateway tests, full gates and isolated real PostgreSQL evidence; keep Draft/HOLD unless exact-SHA official Test and all gates pass.

## In progress
- Pending test-first implementation and validation.

## Finished (local candidate; release HOLD)
- RED: backend 2 failing, frontend 3 failing before implementation. GREEN: backend 3 PASS, frontend 19 PASS (including Android proxy).
- Full backend 1,691 PASS / 430 SKIP; full frontend 1,684 PASS; Bot 8 PASS after isolated dependency installation.
- Typecheck PASS, backend build PASS, Webpack frontend build PASS, API contract 180 endpoints PASS, changed-file ESLint PASS, root High+ audit PASS (12 low/moderate remain).
- Isolated PostgreSQL 17.11 PASS: migration 196 owner-scoped function, 100-row boundary, literal wildcard, older-row exclusion, other-actor exclusion from owner result, legacy 50, app-role direct table SELECT denied. Synthetic DB only; the DB function accepts caller-supplied actor and does not bind actor to an authenticated DB identity (pre-existing P0 #993).
- Blockers: global ESLint 2 errors in pre-existing blog-data.ts (1,108 warnings); full pnpm test migration 283 duplicated/285 missing; default Turbopack SIGABRT despite Webpack PASS; bot dependency audit 1 Critical/5 High. Official Test version differs and test-current symlink target missing. No authenticated exact-SHA Test, independent restore or GitOps/host release gate.
- Release decision: Draft/HOLD; no main merge, Test/Production deployment, DB migration, ledger writes, feature activation, rollback or branch deletion.
- Branch and PR counts and exact commit SHA are captured in the companion QA/release report and PR. No other worktrees modified.

- RED stage: authored backend repository/controller, web SSR, and Android app gateway regression tests before product code.
- GREEN implementation: backend owner-only DB function wrapper with literal SQL `strpos`, bounded q/400; Next.js GET form, visible 100-thread scope and safe selected thread; Android no-store response fence. No migration or finance mutation.
