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


## Finished — 2026-10-28 15:54 KST (CI pending)
- Corrected a TypeScript boolean-vs-number regression found by full typecheck, then re-ran focused tests (25 PASS), full typecheck (PASS), and full build (PASS).
- `pnpm lint`: PASS (0 errors, 1,095 existing warnings). `pnpm test` with isolated real PostgreSQL: PASS (database 45 PASS/3 SKIP; backend 2,522 PASS/70 SKIP; frontend 1,894 PASS). app-api contract: 180 endpoints match. Bot: 11 PASS, high audit 0 vulnerabilities.
- Disposable PostgreSQL 17.11: 289 migrations applied; 19/19 admin read-model DB/ACL tests PASS; `moneyverse_app` can execute the two authorized Discord read functions but cannot SELECT the raw `discord_outbox_routes` table.
- `pnpm build`: PASS (NestJS and Next.js). Production dependency high audit PASS with 1 moderate finding; full moderate audit FAIL (3 low, 9 moderate). Existing QA #1687 owns `qs` dependency remediation; do not duplicate or bypass gate.
- Initial full-test run aborted transiently; isolated retry with a complete frozen-lockfile install passed. No database or Production data mutation.
- Main advanced twice: `952e487d` -> `b2272d5e` -> `d12c948a` (blog code and bilingual planning). Rebase to latest main required; unrelated A/B/QA/Gemini work preserved.
- Official Test `/api/version`: `cfb13272beea53c4d8c20eff7f379b6f66343033`, not candidate; Production version `unknown`. Authenticated exact-SHA official Test E2E BLOCKED. Main merge, Test/Production promotion, GitOps, rollback, branch deletion NOT performed. Release HOLD pending full security and official Test gates.
- Final GitHub CI/Build Test Candidate status will be attached to PR and internal closure evidence after the final SHA is pushed.
