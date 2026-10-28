# C v1138 — Status summary freshness, START

- Start: 2026-10-29 00:45 KST; main SHA: 35971c600f25869c96f1c666d4b9f58927202730; branch: auto/hourly-c-status-overall-freshness-v1138-20261029-0045.
- Source: /status uses server-supplied freshnessState per row but computes overall from raw state only; all-stale operational rows can show an overall healthy headline.
- Scope: server-rendered public status headline and regression tests. Preserve backend collector's freshness contract; no DB/schema, finance, authentication, or shared workspace changes.
- Design: map non-fresh observations to unknown for aggregate only; preserve confirmed outages and degraded rows as worst-first; distinguish no observations from stale evidence in copy. Use TDD and verify frontend/API contract.
- Release: HOLD until full exact-SHA gates, isolated PostgreSQL and official Test; no direct main or Production changes.

## MID
- RED reproduced: 7 failing assertions across 2 test files (new aggregate function missing; status headline ignored freshness).
- GREEN: 9/9 focused assertions passed. New aggregation treats stale/unknown observations as unknown; fresh outage/degraded remain worst-first. Stale badge is not styled as an active outage.
- Mid-run main fetched again; unchanged at 35971c600f25869c96f1c666d4b9f58927202730.

## Verification and release hold (pre-PR)
- Main fetched at start/mid/end of coding: `35971c600f25869c96f1c666d4b9f58927202730`, unchanged. Independent worktree; no direct main mutation.
- TDD RED 7/9 assertions failed; GREEN 9/9, final focused 11/11. Full frontend before final test-only a11y additions: 1,878/1,878 PASS; contract 38/38 PASS; database package 46 PASS/4 SKIP.
- Frontend and backend build/typecheck PASS; full ESLint 0 errors, 1,099 existing warnings; bot 11/11 PASS and bot production audit 0 vulnerabilities.
- Isolated PostgreSQL 17.11: 290 migrations applied, public status function app EXECUTE PASS, direct users SELECT denied. App-role status query returned unknown states, no invented live status. Test container removed.
- Isolated backend suite: first run used owner connection and incorrectly failed 56 ACL assertions; corrected to application role with separate migrator connection, 2,524 PASS/70 SKIP, 1 FAIL. The remaining existing `admin/control-center-v2.db.test.ts` macro-money large-number assertion expected 9007199254740993 but got 9007199254740997; reproduced in focused test, unrelated to changed status files. Do not claim full PASS.
- app-api contract generator reported drift in three generated docs despite unchanged routes (180 endpoints); generated files restored only in this isolated worktree. Root test command not invoked due known host-backup side-effect P0 #1718.
- Production audit 1 moderate (`qs`), full audit 3 low/9 moderate. Official Test exact-SHA auth/API/DB E2E not run; no Production release.
- Backend status service already maps stale to unknown, so this frontend change is a defensive second boundary against inconsistent payloads and a clearer stale headline; no observed Production misreporting is claimed.
- CI/PR status to be appended in GitHub and local closeout after push. Release HOLD; preserve A/B/QA/Gemini work and existing PRs.
