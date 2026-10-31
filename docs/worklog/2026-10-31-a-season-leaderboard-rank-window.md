# 2026-10-31 — Development A: Verified season leaderboard rank window

## BEFORE — 2026-10-31 20:29 KST
- Task: member-selectable **Top 3 / Top 10 / Top 20** season event leaderboard. This is read-only and reuses `public.season_event_leaderboard(uuid, integer)`; no schema migration, balance mutation, payout, new table privileges or new route.
- Start main: `5bccda44d6db56aff05fa5623ef7f72b2ec0263c`; branch `auto/hourly-a-20261031-2025-season-rank-limits`, isolated worktree.
- Reviewed AGENTS, README, English canonical `docs/planning/PROJECT_PLAN.md`, Korean translation, integrated master, QA v1420, open PRs, branch/CI inventory. 120 remote branches (119 non-main), 105 open PRs. Existing season event cost-sort Draft #2121 touches related UI; avoid changing price sort or season payouts. No branch deletion.
- Design: strict `limit` allowlist 3/10/20 (default 20); reject repeated/invalid query values; server-selected SQL function limit (never client truncation); render accessible links preserving selected event; Android gateway rejects invalid parameters and malformed 200 leaderboard evidence, forces private/no-store/noindex/no-referrer even on error. Existing session/consent guards preserved.
- Red/green: failing tests before implementation, then backend, frontend, Android and DB targeted verification; full gates and exact SHA CI; no merge or deployment without all release gates.
- Baseline P0: DEV app-role excessive grants (#993), official Test not on candidate SHA, Production executable provenance (#1984), independent restore/financial gates HOLD.

## IN PROGRESS
- Pending RED-GREEN implementation and verification.

## FINISHED
- Pending.

### IN PROGRESS — 2026-10-31 20:31 KST
- Test-first RED: backend 14 failures; frontend 6 failures and missing modules before implementation. GREEN: backend 14/14 PASS, frontend rank/parser/proof/Android 28/28 PASS.
- `pnpm typecheck` exit 0 across contract, database, backend and frontend. Backend now binds rank cap 3/10/20 into the existing SQL function; no new migration or direct table access. Android verifies exact string scores and refuses malformed HTTP 200; private no-store/noindex/no-referrer enforced on all season gateway responses.
- Midpoint `origin/main` remains `5bccda44d6db56aff05fa5623ef7f72b2ec0263c`; English/Korean project plan and integrated master hashes unchanged. QA v1420 final FAILED/P0 (DEV ACL, Treasury, exact-SHA official Test, independent restore). No release authorization.
- Next: full gates, real PostgreSQL read-only privilege/function proof, CI, final release decision.

### IN PROGRESS — 2026-10-31 20:38 KST (repair SHA)
- Full first pass: contract 41 PASS, database 62 PASS/4 SKIP, backend 2,800 PASS/501 SKIP, frontend 2,804 PASS, typecheck PASS; production dependency audit 0 high/critical. Full dependency audit FAIL with 13 known advisories (10 moderate, 3 low).
- First full lint FAIL: two `no-loss-of-precision` violations in newly added negative tests, **not product logic**. Replaced unsafe literals with explicit `Number('9007199254740993')`. Added a second RED-GREEN cycle for strict Android payload privacy: 4 RED -> 4 GREEN; targeted backend 14 and frontend 32 PASS, changed-file ESLint PASS.
- First `pnpm build` under forced 1024MB Node heap failed with V8 heap OOM; no evidence of a product compile error. Re-run with a larger isolated heap required. First exact-SHA GitHub CI and candidate runtime FAIL at lint; do not report CI PASS.
- Real PostgreSQL 17.11: DEV has 312 applied migrations, `moneyverse_app` function EXECUTE true, but **direct SELECT and DELETE on `virtual_consumption_event_entries` true** (P0 #993). The live DEV DB has 0 active events; no row-level ranking claims based on it. In separate network-disabled ephemeral PostgreSQL, the canonical migration-037 function with 25 synthetic members returned Top 3/10/20 = 3/10/20 and denied direct SELECT. Test ROLLBACK and container removed.
- Read-only release preflight: official Test and Production advertise `bc8cd8a6c654af0336f550643f23049a58ee1d16`, not candidate; both Production service CWDs are deleted v1515 paths, `/login` advertises `index, follow`. P0 #1984 updated. No official exact-SHA auth E2E or independent restore.
- Branch audit: 121 remote heads, 120 non-main, 112 ahead-by-commit, 8 main ancestors, 0 exact duplicate head SHA; 106 open PRs, 105 Draft, 8 GitHub conflicts. Existing #2121 overlaps season controller/page/gateway files but implements a different cost-sort feature; preserve and reconcile before any merge. Deleted 0 branches.
- GitHub Draft PR #2198; issue comments #993 and #1984. Full repaired-SHA gates and final release decision pending.

### FINISHED — 2026-10-31 20:46 KST (LOCAL VERIFIED / RELEASE HOLD)
- Repaired code SHA `cadb1561fd83265e17be96319dd26050f8567015` full fresh gates: lint **0 errors / 1,050 warnings**, typecheck **PASS**, contract **41 PASS**, DB unit **62 PASS / 4 SKIP**, backend **2,800 PASS / 501 SKIP**, frontend **2,808 PASS**, Backend+Next.js build **PASS** with 3072MB heap, production high/critical audit **PASS**. Full low-threshold dependency audit **FAIL** with 13 advisories (10 moderate, 3 low). All test and build logs under `/srv/moneyverse-data/tasks/mv-a-20261031-2025-season-rank-limits/evidence/`.
- Real PostgreSQL synthetic rank cap 3/10/20 and negative direct SELECT PASS; DEV app role broad table privileges P0 FAIL, Production ACL UNKNOWN. No new migration, ledger mutation, service restart or Test/Production deployment.
- Latest main `5bccda44d6db56aff05fa5623ef7f72b2ec0263c` and English/Korean project plan hashes unchanged at start/mid/final. Official Test/Production `bc8cd8a6...` unchanged; exact candidate authenticated Test E2E **BLOCKED**; independent restore, finance and Production executable provenance **BLOCKED**.
- Final pre-documentation audit: 122 remote heads (121 non-main), 107 open PRs (106 Draft), 8 conflicting PRs; no branch deletion. Existing #2121 code-file overlap must be reconciled, no silent merge.
- GitHub CI and Docker candidate for repaired code SHA were still in progress at final worklog authoring; check exact **final documentation SHA** and post results on Draft PR #2198. No PASS claim without completed run. **Production HOLD.**
- No rollback needed because no deployment or persistent database change was performed. Reservation states and schedules untouched.
