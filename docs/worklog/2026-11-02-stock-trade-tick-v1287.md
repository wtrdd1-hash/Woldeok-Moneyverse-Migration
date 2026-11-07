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

## Candidate verification / release decision — 2026-11-02 06:55 KST
- First committed candidate `f957998171826e78f955f06ee91845fdac40388d`: full lint 0 errors / 1,027 warnings; typecheck PASS; app-api 184 endpoints PASS; build PASS; backend 2,980 PASS / 518 SKIP; frontend 2,941 PASS; production-only high-severity audit PASS.
- Full dependency audit FAIL (8 moderate, 1 low); full route QA FAIL (missing `artifacts/qa/full-route-ledger.json`); official exact-SHA Test and authenticated browser/Android E2E BLOCKED. Production/Test currently advertise `510dbe6...`, not this branch. Latest QA v1456 also reports P0 app-role privilege and runtime/edge mismatches.
- Added explicit in-product warning that synthetic price-ladder depth is **not actual liquidity**; actual execution rows remain strictly server-event sourced. Added socket integration test and keyboard dismiss regression. Final exact-SHA rerun required after this checkpoint.
- **Release decision: DRAFT / HOLD.** No merge, Test deployment, Production promotion, financial write, branch deletion or rollback. Follow-up: independent certified real orderbook source and full authenticated E2E.
