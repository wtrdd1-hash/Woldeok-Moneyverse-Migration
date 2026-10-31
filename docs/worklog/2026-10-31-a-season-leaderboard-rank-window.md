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
