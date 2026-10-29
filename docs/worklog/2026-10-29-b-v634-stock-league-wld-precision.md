# Backend B v634 — Stock league WLD read precision (2026-10-29)

## Scope and safety

Starting main `679cb5904f779a1b2067f10809fcca83e31dbe91`; mid-run main `95a8fdb85f6670cac9e52e16383711ac94924e93`. Isolated worktree `mv-b-v634-stock-league-safe-wld-20261029-1505`, branch `auto/hourly-b-v634-stock-league-safe-wld-20261029-1505`. Read repository instructions, English/Korean plans, QA v1366, open PRs and CI. Avoided B v633 treasury PR #1852 and QA's dependency fix PR #1687.

## Reproduced P1 defect

PostgreSQL NUMERIC WLD values above `Number.MAX_SAFE_INTEGER` silently round when `Number(...)` is used in stock league season, leaderboard, whale and owner subscription responses. TDD RED: 4 unsafe-integer failures (9007199254740993 became 9007199254740992), plus 1 additional fractional-NUMERIC failure (9007199254740991.01 silently rounded to 9007199254740991); safe values passed.

## Implementation

Added an exact-decimal `safeWld` fail-closed converter (BigInt range check before Number conversion; `.00` accepted, nonzero fractions rejected) for WLD integer fields in `StockLeagueRepository` and reused it for the existing owner participation precision boundary. Unsafe/missing/noninteger WLD evidence returns HTTP 503 with `STOCK_LEAGUE_WLD_PRECISION_UNAVAILABLE`, rather than a rounded success response. Exact safe values remain numeric and unchanged. HTTP route `GET /api/v1/stocks/league/current` inherits the 503. No schema, migrations, financial SQL, ledger balances, grants or auth guards changed. Frontend is not marked complete or deployed.

## Verification and release

RED 5, GREEN 7; repository focused suite 20 PASS; real NestJS HTTP 2 PASS; isolated PostgreSQL 17.11 read-only role 1 PASS (out-of-range NUMERIC rejected and UPDATE denied), container stopped. Full typecheck PASS; final-source full tests PASS (backend 1,972 PASS / 441 SKIPPED; frontend 1,916 PASS; database 46 PASS / 4 SKIPPED; contract 38 PASS); full lint PASS with 1,091 preexisting warnings; full Backend + Next.js build PASS (609 pages); API contract check PASS. Security audit FAIL: qs@6.16.0 Moderate, separately owned by QA PR #1687. CI and exact-SHA Test are not yet certified; no main merge/Production promotion.

## Contract / remaining risk

Affected stock league GETs may now return HTTP 503 instead of inaccurate monetary JSON. This is intentional fail-closed behavior. To support WLD values above the JavaScript safe integer range in future, introduce a coordinated contract migration to canonical decimal strings across NestJS, Next.js, Android and all consumers. Production schema integration and authenticated user-flow E2E remain required for release. P0 QA financial provenance, migration lineage and independent backup restore remain unresolved.

## Frontend C handoff / not end-to-end complete

The current `frontend/src/app/stocks/league/stocks-league-client.tsx` still seeds a fictional member subscription and five `defaultWhales`, and displays those when `/api/stocks/league` fails. Closed unmerged C PR #1168 addressed this earlier but is not in inspected main. Backend 503 therefore does **not** guarantee truthful UI. Coordinate with C through existing issue #1169; never claim a complete member flow or promote this PR alone.

**Final hardening:** An additional RED test exposed a fractional NUMERIC precision hole in the initial candidate SHA. Its exact-gate task was intentionally cancelled before final certification, the converter was corrected using decimal-string/BigInt checks, and all final-SHA gates must be rerun. No release claim is based on the superseded SHA.
