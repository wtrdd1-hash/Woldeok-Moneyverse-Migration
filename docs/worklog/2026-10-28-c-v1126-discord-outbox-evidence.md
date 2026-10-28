# C v1126 — Discord Delivery Evidence Integrity (EN canonical)

## Before work — 2026-10-28 15:39 KST
- Base `origin/main`: `952e487d0a0eb4d7520fa98a81e413a1b2cb869c`; independent `auto/hourly-c-discord-outbox-evidence-v1126-20261028-1545` worktree.
- Debian 13.6 miniPC: backend/frontend/bot/MCP/desktop/nginx/docker active; development DB reachable. **Do not write to the shared live-connected DB.**
- Read `AGENTS.md`, README, Korean README, EN/KO living project plans; reviewed open PRs/CI and QA/A/B/C. C #1704 pension, #1699 money flow; A #1698 notifications, B #1697 monetary query limits, QA #1687 dependency security. Avoid overlap.
- P1 gap: `/admin/discord` directly trusts `apiOrNull<T>` JSON; malformed counts/route metadata can display misleading delivery health or enable DM test. Existing NestJS GET `/api/v1/admin/discord` reads PostgreSQL `admin_discord_outbox_health` and `admin_discord_routes` SECURITY DEFINER functions. No SQL change required.
- Plan: RED tests for malformed response; strict evidence parser; fail-closed server-rendered UI with accessible retry; focused/whole gates, real isolated PostgreSQL, exact-SHA CI; no merge/release until all mandatory PASS.

## In progress — 2026-10-28 15:42 KST
- RED: missing evidence parser rejected by Vitest; GREEN: 25/25 focused parser+SSR tests pass.
- Existing SSR fixture updated to include actual PostgreSQL `delivered_count` field. Fail-closed accessible retry prevents unverified DM test and delivery counters.
- Existing NestJS `/api/v1/admin/discord` remains authenticated and uses SQL 106 `SECURITY DEFINER` functions; no broad grants, no DB migration, no WLD mutation.
- Mid-run `origin/main` re-fetched: `952e487d0a0eb4d7520fa98a81e413a1b2cb869c` unchanged; plans unchanged. Next: full validation and CI.


## Finished
- Pending validation. No Test/Production change authorized.
