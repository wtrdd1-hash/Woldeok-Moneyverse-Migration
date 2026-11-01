# Development C v1268 — Stock comparison source integrity

## START / BEFORE WORK — 2026-11-01 18:13 KST
- Host: Debian 13.6 miniPC; 7 monitored services active; development PostgreSQL connected. No shared service changes authorized.
- Canonical origin/main: `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0`; branch `auto/hourly-c-stock-compare-truth-v1268-20261101-1813` is an independent worktree from that SHA. The original checkout has an unrelated modified `implementation_plan.md`; preserve it.
- Read `AGENTS.md`, README and Korean README, canonical EN/KO `docs/planning/PROJECT_PLAN*`, current open PRs and CI, plus A/B/QA work. In particular, watchlist PR #2228, market-event PR #2293, stock-community PR #2351 and current planning #2355 must not be overwritten.
- P1 verified gap: `/stocks/compare` trusts `/api/v1/stocks` as a typed payload, then passes unvalidated price strings to `BigInt` in `stock-comparison-math.ts`. A malformed or contradictory row can crash a member view or display a false day range; a success-shaped malformed payload can be mistaken for an empty market. Existing Nest `GET /api/v1/stocks` uses `public.stock_market_overview()` with DB-owned price/float fields, no new write path required.
- Bounded design: add a strict read-only runtime decoder for the existing list contract, including unique UUID/symbol, exact canonical integer strings, positive prices, coherent day low/high, bounded rows and share float. Render an explicit unavailable/retry state when the source is missing or malformed; preserve verified empty and 2+ comparison UX. Test the decoder and server page via RED→GREEN; retain noindex metadata, mobile layout, keyboard and screen-reader status.
- No schema, financial ledger, session, Android route or API mutation. Fail closed rather than silently discard bad rows. No deployment unless all exact-SHA gates pass.

## IN PROGRESS
- [x] TDD red/green and server-page regression: RED missing decoder + false verified UI; GREEN 9/9.
- [ ] Full build/lint/typecheck/unit/integration/security/app-api and isolated PostgreSQL/E2E evidence.
- [ ] Re-fetch main/planning, review other PRs, record final SHA and gate results.

## MID / IN PROGRESS — 2026-11-01 18:20 KST
- Added `verified-market.ts` to reject malformed/duplicate/contradictory stock snapshots before BigInt; verified empty remains distinct. A server-page retry state is keyboard accessible.
- Re-fetched origin/main; still at start SHA; no active stock comparison PR overlap.

## FINISHED
- Pending. Release HOLD until all required gates pass.
