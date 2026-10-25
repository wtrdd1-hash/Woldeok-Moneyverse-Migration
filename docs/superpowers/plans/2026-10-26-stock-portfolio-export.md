# A0025 — Owner-only virtual-stock holdings CSV (engineering plan)

Baseline: main `1c5b84a1c45baafcca83f375a6f99698121e9bb5`, isolated `auto/hourly-a-stock-portfolio-export-20261026-0025` worktree. Non-interactive product decision: export a read-only **current** holdings snapshot; not a trade, settlement receipt, historical price, or guarantee of value. No migrations or WLD writes. Existing `stock_my_positions(p_actor)` is the only data source.

1. TDD RED: add Backend session/shape/boundary tests, frontend CSV validation/guest/error tests, Android gateway privacy test; run to witness missing feature.
2. Backend: add guarded `GET /api/v1/stocks/portfolio/export` returning `{ scope: 'current_holdings_only', holdings }`; validate <=100 rows, UUIDs, exact canonical integer strings, labels and fail 503 on DB/shape failure. Reuse owner-scoped SECURITY DEFINER portfolio query; no direct table reads or new grant.
3. Web: `GET /api/stocks/portfolio/holdings.csv` using viewer + internal API, no-store/noindex, safe RFC4180 CSV escaping/formula injection defense, BOM, and explicit snapshot-only wording. Add accessible link to `/stocks/portfolio` when holdings loaded.
4. Android: existing `/app-api/v1/stocks/portfolio/export` session-forwarding proxy with forced private headers for this sensitive endpoint; verify route and contract catalog; do not add new Android-native UI without a native app repository.
5. Verify TDD GREEN, typecheck/lint/build, full unit/integration/real-PG ACL and rollback, security/a11y/SEO/mobile contract; re-fetch main and living EN/KO plan mid/pre-integration; check exact SHA Test and CI. No merge/Production without all gates PASS. Preserve other workers' unique branches.
