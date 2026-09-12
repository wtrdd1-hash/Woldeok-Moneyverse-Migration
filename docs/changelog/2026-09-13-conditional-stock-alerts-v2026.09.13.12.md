# v2026.09.13.12 — Conditional virtual-stock alerts

- Added member-owned virtual-stock price and daily-change alert rules.
- Added immutable trigger-event history and server-side evaluation driven by the existing market ticker.
- Added cooldown-aware threshold re-entry handling so a continuously true condition does not spam events.
- WLD thresholds remain integer strings end-to-end; daily changes use integer basis points.
- Added `/stocks/alerts` with create/delete controls, current condition state, and recent trigger history.
- Added migration 182 after preserving the active stock-community candidate's migration 181.
- No virtual-stock price, holding, wallet, ledger, ranking, or recommendation outcome is changed by alerts.
- Production remains unchanged until CI and exact-SHA isolated Test validation pass.
