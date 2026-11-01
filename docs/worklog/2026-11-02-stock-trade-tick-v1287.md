# v1287 — Verified Stock Trade Ticks (P1, Release Hold)

## Before work
- Main: `a8541927c3a351d980454c66e95a3356c47e0722` (fetch and recheck).
- Existing `/stocks/[symbol]` toast creates arbitrary buy/sell executions every 14 seconds, with randomized WLD price and quantity. This is not an executed trade.
- Nest `StockService.trade` publishes real `stock:trade` payloads after repository trade success; Next `useStockTrades` exists but is not used by the toast.
- Independent branch/worktree; A/B/Gemini/QA preserved; no main/DB/Production edits.

## Plan / in progress
1. RED: prove no synthetic trade without verified server event; valid trade displays, malformed/foreign/stale trade ignored, room reconnects.
2. GREEN: render server-validated trade payload only and maintain stock-room subscription on reconnect.
3. Validate focused regression, full build/lint/typecheck/tests, contract/DB/security/CI and isolated exact-SHA Test where available. Hold release on any failure.

## Finished
Pending.

## Midpoint — 2026-11-02 06:46 KST
- TDD RED: 17 failures for synthetic toast and missing runtime parser; separate recent-trade list test failed on fabricated entries.
- TDD GREEN: 28 focused tests PASS across four suites, including 15 malformed/stale event cases. `NODE_ENV=test` is required because miniPC shell defaults to `NODE_ENV=production` (React test renderer otherwise fails).
- Actual data path: `StockService.trade` → `MarketBroadcast.publishTrade` → stock room → `useStockTrades` → validated toast and orderbook recent-execution list. No new endpoint or database grant.
- Repaired a discovered `useSyncExternalStore` infinite rerender by using a stable empty snapshot; room subscription now renews on socket reconnect.
- Midpoint origin/main still `a8541927c3a351d980454c66e95a3356c47e0722`; full lint/build/test/CI/Test release gates still pending.
- Known separate gap: illustrative orderbook depth and ratios are still synthetic; do not interpret as actual order liquidity. Separate P1 work required.
