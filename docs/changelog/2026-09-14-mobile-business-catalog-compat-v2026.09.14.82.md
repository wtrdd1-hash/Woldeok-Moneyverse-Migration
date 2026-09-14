# v2026.09.14.82 — Mobile business catalog compatibility

- Adds additive mobile aliases for business purchase price: `price`, `purchasePrice`.
- Adds additive daily net-profit aliases: `expectedProfit`, `dailyProfit`, `netProfit`, `profit`.
- Keeps canonical API fields unchanged: `purchaseCost`, `dailyRevenue`, `dailyOperatingCost`.
- Calculates daily net profit from authoritative server values (`dailyRevenue - dailyOperatingCost`).
- Never overwrites explicit fields already returned by the backend.
- Adds regression tests and bumps the mobile API contract version to `v2026.09.14.82`.
