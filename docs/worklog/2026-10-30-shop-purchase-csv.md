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
## Finished — 12:49 KST (version 3: candidate completed, release blocked)
- Feature code commit 7379f1635a7ad0aa68b1a048e8a25fe0fb88abb5; Draft PR #1991. Code is end-to-end but **not released**.
- Backend regression 21 PASS, frontend receipt/SEO 17 PASS; full lint 0 errors/1043 warnings; typecheck PASS; build PASS; app-api contract PASS; security 17 PASS; production audit 0 known vulnerabilities; isolated PG 305 migrations, DB 5 PASS, owner/ACL/rollback PASS.
- Full backend 2567 PASS / 119 FAIL / 495 SKIP, full frontend 2615 PASS / 53 FAIL. QA v1388 on unchanged main had the same 119/53 failures. **Full gates FAIL**.
- Exact-SHA GitHub CI #40998581810 and candidate #40998561840 policy/classify PASS, runtime-check PENDING at last read. Official Test exact SHA/auth E2E and independent restore BLOCKED; Production P0 cwd/link mismatch and Test Treasury HTTP 200 synthetic data persist.
- Remote branches 6->7, open Draft PRs 5->6, unique unmerged work retained. Deleted 0, main merges 0, Test/Production deploy 0, DB changes 0, rollback 0. Rollback path is code-only revert after future approval. **PRODUCTION HOLD**.


### In progress — 12:39 KST (version 2)
- TDD RED reproduced missing Nest export and missing CSV parser, then GREEN: backend 2 tests, frontend 8 tests. Authenticated Nest route e2e 14 tests; additional privacy decorator RED reproduced and patched.
- Strict UTF-8 CSV, formula injection escape, duplicate/overlong query rejection, fail-closed invalid 200, Android no-store/noindex, member-only browser CTA implemented.
- Typecheck PASS; full lint PASS (0 errors / 1,043 existing warnings); API generated contract check PASS; database unit 56 PASS / 4 SKIP; production dependency audit 0 known vulnerabilities.
- Isolated PostgreSQL 17.11: 305 immutable migrations applied; shop DB 5 PASS; synthetic owner 2 receipts / 190 WLD, stranger 0, direct app-role purchase SELECT/UPDATE denied; transaction ROLLBACK; only this run's isolated container removed. First synthetic proof attempt blocked by missing bind mount; corrected and re-ran successfully.
- Remote main rechecked unchanged 9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef. Full build/CI/Test E2E still pending; no release.
