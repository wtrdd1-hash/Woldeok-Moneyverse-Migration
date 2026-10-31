# Season event leaderboard rank window — implementation plan

## User outcome and boundary
Authenticated/consented member can select Top 3, Top 10 or Top 20 of an event leaderboard. Default remains Top 20. Existing `public.season_event_leaderboard(uuid,integer)` is the authoritative ranked SQL, with `moneyverse_app` EXECUTE only. This change is read-only; it cannot mint WLD, settle seasons or grant table privileges. Android GET parity must be private and reject unverified data.

## Steps (test-first)
1. Add backend contract tests in `backend/src/season/season-rank-window.test.ts`: defaults, allowlist, duplicate/invalid 400, repository SQL parameters, guard metadata. Run RED.
2. Implement `parseSeasonRankLimit`, controller `@Query`, service/repository typed limit and SQL `$2::integer`. Run GREEN.
3. Add frontend rank limit parsing and tests in `frontend/src/app/seasons/rank-window.test.ts`; run RED, implement parser and accessible rank links on `seasons/page.tsx`, preserve event query and unknown-state handling. Run GREEN.
4. Add Android gateway regression tests for strict query, private headers, malformed 200 and valid 200; run RED. Implement fail-closed rank proof with exact integer strings, no cache/noindex/no-referrer. Run GREEN.
5. Run typecheck/lint/build/full tests, real PostgreSQL function and least-privilege checks, exact SHA CI, isolated Test exact SHA auth E2E and release gate. Do not merge or promote without proof. Recheck main and integrated plans at midpoint and before integration.
