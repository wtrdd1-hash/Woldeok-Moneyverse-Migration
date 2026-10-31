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
