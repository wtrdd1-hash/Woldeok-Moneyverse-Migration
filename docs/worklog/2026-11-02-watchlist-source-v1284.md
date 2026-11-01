# C v1284 — Verified member stock watchlist and Android owner privacy

## Before work — 2026-11-02T04:46:20+09:00
- Main: a8541927c3a351d980454c66e95a3356c47e0722; independent branch auto/hourly-c-watchlist-source-v1284-20261102-0445; existing main implementation_plan.md change untouched.
- Checked AGENTS.md, README.md, README/README.ko.md, English/Korean PROJECT_PLAN, open PRs/CI, A/B/C/QA worktrees. No current watchlist-source PR found.
- Verified backend GET /api/v1/stocks/watchlist authenticates session and consent, calls public.stock_my_watchlist(actor) (migration 177, owner-scoped SECURITY DEFINER). No new DB grants or WLD writes.
- P1 reproduction target: web watchlist trusts untyped API, BigInt can throw on malformed prices; Android app-api forwards owner watchlist with upstream public cache and no noindex; verified empty and source failure are conflated.
- Plan: RED tests for source parser and Android privacy; GREEN fail-closed validation and private edge; accessible retry and member noindex; run exact-SHA gates. No production changes.

## In progress
- Pending implementation and tests.

## Finished
- Pending.

## In progress — 2026-11-02 04:48 KST
- RED: parser import missing; Android 3 tests failed (public cache and forged success); SSR page threw `Cannot convert bad to a BigInt`.
- GREEN: 19 focused tests pass (3 files). Web now validates SQL-backed rows before BigInt and distinguishes verified empty from unavailable; Android owner GET validates JSON and overrides public cache/index/referrer on success and auth errors.
- Existing authenticated Nest GET and migration 177 owner SQL remain unchanged; no financial writes or direct table grants.
- Re-fetched origin/main mid-task; exact SHA recorded by shell log.
