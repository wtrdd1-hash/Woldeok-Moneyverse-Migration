# QA A0549 — Private current-week quest snapshot (2026-10-26, RELEASE HOLD)

## Identity and scope
- Baseline main: 1c5b84a1c45baafcca83f375a6f99698121e9bb5 (checked start/mid).
- Candidate code SHA: f553b210b8cb3d6ae44aab8422beecdecfbee10b.
- Branch: auto/hourly-a-quest-goals-export-20261026-0549 (isolated data-disk worktree).
- P1 read-only CSV of current weekly goals from migration 101 early_game_weekly_goals. Four catalog goals include one lifetime/self-reported NPC metric, explicitly labeled. Not a history archive, settlement receipt or verified WLD payout.
- Backend session-derived actor, existing SECURITY DEFINER function; no migration, no new grants, no ledger writes. Next /quests/weekly.csv validates all fields before sending, protects against CSV formulas, preserves decimal strings, no-store/noindex, denies guests; accessible non-prefetching CTA. Android app-api private response override and generated contract: 180 endpoints.

## TDD and focused evidence
- RED: Nest route 404; missing CSV renderer/route; Android proxy leaked upstream public,max-age=600.
- GREEN: backend route 11/11; backend controller owner/failure 2/2; frontend CSV/route/Android 18/18.
- Backend full: 1,316 PASS / 398 SKIPPED, rc0.
- Frontend full: 1,405 PASS / 6 FAIL, rc1 (baseline: SEO/i18n 3, login touch 1, calculator registration link 1, admin M2 telemetry 1). Candidate focused tests PASS; unrelated failures prevent merge.
- Database package 15 PASS / 3 SKIPPED; contract package 38 PASS; Typecheck PASS; lint PASS with 0 errors / 1,128 warnings.
- Backend build PASS; initial frontend build FAILED due cross-worktree symlinked node_modules Turbopack resolution. Corrected by copying dependencies into isolated data-disk worktree; frontend build rerun PASS without source workaround.
- Mobile API contract: 180 endpoints; generator/check PASS after code commit. Bot initially missing youtube-dl-exec in isolated workspace; local npm ci (no lock edits) and bot 8 PASS.
- Security: production dependencies 2 HIGH; full audit 2 CRITICAL / 10 HIGH / 11 MODERATE / 3 LOW; bot 1 CRITICAL / 5 HIGH. All remain RELEASE HOLD.

## Real PostgreSQL 17.11 evidence (isolated, read-only)
- Docker moneyverse-test-db, DB wdmv_v761_test_acl (NOT shared Production/dev port 5433).
- Migrator selected two active fixture actors without logging IDs. BEGIN TRANSACTION READ ONLY; SET LOCAL ROLE moneyverse_app.
- Each actor's public.early_game_weekly_goals(uuid) returned 4 rows; one row lifetime/self-reported NPC. Function EXECUTE=true, catalog direct SELECT=false, ledger posting INSERT=false. ROLLBACK; zero fixture writes and zero Production DB writes.
- Boundary limitation: DB function accepts server-passed UUID and does not independently authenticate the caller. Nest session guard + requireUserId(request) are mandatory and unit-tested. This does NOT prove official Test authenticated E2E.

## Release, rollback and blockers
- Latest main unchanged at mid-check. Remote audit: 227 branches including main, 223 open PRs; same-tip SHA duplicates 0; conflicting PRs #1107, #1110, #1143 preserved. Zero branch deletion, no existing PR merge or other worker edits.
- Official Test and Production release SHAs differ from candidate. Exact candidate SHA official Test backend/API/DB/auth/user-flow E2E NOT RUN / BLOCKED. No authorized GitOps gate PASS.
- Root filesystem 99% (about 1 GiB free), data disk 72%. Capacity risk; no unrelated cleanup.
- Verdict PARTIAL / BLOCKED. No main merge, Test promotion, Production deployment, service restart, live DB migration or WLD write. Rollback: leave Draft branch unmerged; no runtime/DB state to reverse.
- Logs: /srv/moneyverse-data/a0549-gates/ (full tests, build, audits, focused tests, contract). PR comments record post-push exact SHA and CI status.
