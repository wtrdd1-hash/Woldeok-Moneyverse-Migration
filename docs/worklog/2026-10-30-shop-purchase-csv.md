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

### In progress — 12:39 KST (version 2)
- TDD RED reproduced missing Nest export and missing CSV parser, then GREEN: backend 2 tests, frontend 8 tests. Authenticated Nest route e2e 14 tests; additional privacy decorator RED reproduced and patched.
- Strict UTF-8 CSV, formula injection escape, duplicate/overlong query rejection, fail-closed invalid 200, Android no-store/noindex, member-only browser CTA implemented.
- Typecheck PASS; full lint PASS (0 errors / 1,043 existing warnings); API generated contract check PASS; database unit 56 PASS / 4 SKIP; production dependency audit 0 known vulnerabilities.
- Isolated PostgreSQL 17.11: 305 immutable migrations applied; shop DB 5 PASS; synthetic owner 2 receipts / 190 WLD, stranger 0, direct app-role purchase SELECT/UPDATE denied; transaction ROLLBACK; only this run's isolated container removed. First synthetic proof attempt blocked by missing bind mount; corrected and re-ran successfully.
- Remote main rechecked unchanged 9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef. Full build/CI/Test E2E still pending; no release.
