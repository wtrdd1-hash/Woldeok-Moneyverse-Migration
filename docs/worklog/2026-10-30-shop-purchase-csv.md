# 2026-10-30 Development A — Owner-private recent shop purchase CSV
## Before work — 12:28 KST
- Main SHA: `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`; isolated `auto/hourly-a-20261030-1225-shop-receipt-csv` worktree.
- 6 remote branches, 5 open Draft PRs, unique unmerged commits preserved. #1985 shop totals overlaps nearby files; do not overwrite its work. B #1987 and planning #1983/#1990 remain separate.
- QA v1388 P0: Production process path mismatch, Test synthetic Treasury 200, incomplete independent restore and full exact-SHA release proof. Production HOLD.
- Read AGENTS.md, README.md, EN/KO integrated project plans and Superpowers workflow.
- User outcome: download a UTF-8 CSV of **own recent 100 shop purchases**, optional same bounded product-name search; not a lifetime financial statement.
- Design: authenticated/consented Nest GET /api/v1/shop/purchases/export -> existing SECURITY DEFINER shop_list_my_purchases owner read -> strict Next CSV BFF -> private Android JSON app-api. Escape spreadsheet formula payloads; preserve decimal integer strings. No DB DDL, mutation, new grant or ledger change.
## In progress
- [ ] RED regression tests; [ ] Backend and Next/API implementation; [ ] app-api and browser access; [ ] exact-SHA target tests; [ ] real isolated PostgreSQL owner/ACL proof; [ ] full gates and CI; [ ] PR + release HOLD evidence.
## Finished
- Pending. No main integration, Test or Production deployment without full gates.
