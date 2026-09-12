# v2026.09.13.13 — Personal Dashboard

- Added a member-only `/dashboard` runtime surface on top of the latest reconciled runtime chain.
- Aggregates ledger-backed WLD balance, stock watchlist, authoritative holdings, recent ledger/trade activity, and recent conditional-alert triggers.
- Adds direct next-action links to quests, work, wallet, and virtual stocks.
- Reuses existing APIs; no new database migration, ledger mutation, stock pricing rule, or economy policy is introduced.
- Adds the dashboard to member navigation in Korean and English.
- Baseline: Conditional Alerts candidate `cf73d089883f7d98d21b7b25b7d4083d9e37c02f`, already synchronized with current `main` `e023c15927035d58b67b76d3765535adc1d2ded0`.
- Production remains blocked until CI and exact-SHA isolated Test validation succeed.
