# Backend API Data-Truth and Owner Isolation QA — v2026.11.18.4

**2026-11-18 KST · English canonical · INCIDENT / RELEASE HOLD.** Korean counterpart: `2026-11-18-backend-api-data-truth-v2026.11.18.4.ko.md`. This is measured evidence, not a platform-release certificate.

## Authority / source
Project plan and integrated master govern G0–G6 gates, precise endpoint ownership, ledger single-writer and exact-SHA acceptance. GitHub `main` remained `0590fac4e8a82bc986ba1b8c64f014d18daca9e9` at start/mid/pre-commit, MiniPC shared main `f45ddcbad9b687a1eae9d3d3b1f3d6180c17545a` untouched. Dedicated branch `repair/backend-api-read-contract-v20261118-v4` stacks on local v3 commit `462e230cc80fb81198b630c815a24fabbe60bef7`; previous published Draft PR #3267 is the parent stack, NOT adopted into `main`.

## Production source-of-truth reconciliation — confirmed defect
Count-only SELECTs of the **actual PostgreSQL database used by production Spring (same database as its JDBC URL)**, independently of runtime JSON:

| Canonical Postgres function | Production DB rows | Old Production Spring API rows | Isolated v4 Spring + independent Test DB rows | Disposition |
| --- | ---: | ---: | ---: | --- |
| `shop_catalog_list_v2(NULL::uuid)` | 146 | 2 (fabricated fallback; HTTP 200) | 146 | P0 fail-open false source |
| `business_catalog()` | 9 | 2 (fabricated fallback; HTTP 200) | 9 | P0 wrong SQL columns/fallback |
| `stock_market_overview()` | 10 | 10 | 10 | Quantity matches only; detailed business contract not certified |

The QA database is specifically `wdmv_v761_test_acl` on separate Docker Test PostgreSQL; do not substitute counts from its default CI database. The candidate's public JSON counts were compared against the database named in its effective JDBC URL, not an unrelated DB. No records, credential values, user IDs or individual portfolio values printed.

## Privacy and fabricated data bugs proven in old production
- Anonymous personal work dashboard HTTP 200 with 29 assignments versus candidate 401. Anonymous stock trade history HTTP 200 with two records versus candidate 401. Anonymous private profile HTTP 200 versus candidate 401. Member identity was taken from untrusted user headers or a hard-coded fallback actor.
- Old Production notification inbox 200/empty, stock portfolio 200/empty, business/my 200/empty: emptiness **not** proof of a successful DB query. Candidate requires server-verified session and returns 401 to anonymous calls.
- A nonexistent club detail returned HTTP 200 with an invented club on Production; candidate returns 404. Club join/leave returned success despite no implemented mutation; candidate returns 503 pending canonical source.
- Admin user-directory SQL errors were turned into empty users; reconciliation SQL errors into invented healthy ledger and balances; some administrative update failures bypassed actor-aware stored procedures through direct-table SQL. Candidate fails closed.
- Work and Business PostgreSQL functions require UUID idempotency keys, have different return columns from old Java calls; new candidate requires CSRF, idempotency UUID and actual authoritative receipt. Unverified Business withholding-tax settlement is intentionally 503; no amount was credited.
- Stock quote/list/chart errors returned invented prices, trade failures invented receipts, watchlist errors returned synthetic success. Candidate removes these paths; private reads/writes require verified owner and changes CSRF.
- Notification list/count DB errors incorrectly returned true empty/zero; read-all failures falsely returned success. Candidate preserves genuine empty while reporting source failures.

## QA verification
- RED→GREEN source-truth: Work+Business+Admin 9 focused cases, **8 RED initially**; Notification+Club six cases, **6 RED initially**; both focused suites GREEN after changes.
- Fresh Gradle `clean test bootJar` PASS: **169 tests, 0 failures, 0 errors, 0 skipped** across 44 JUnit XML reports. This is not a credentialed end-to-end integration proof.
- Final candidate source SHA `8541a47167b84248774cba8e92e168269c9683d2`; immutable test artifact SHA256 `bf626169837212d299c88ef2ebd4baba3d16a048c2d6ceb79143c464813e3dcd`, exact corresponding isolated read-only Spring candidate on localhost 4613, isolated Test PostgreSQL on 5585, no Discord bot.
- Candidate HTTP checks: public shop 200/146, stocks 200/10, business catalog 200/9; public clubs 200/0 (Test DB clubs = 0), missing club 404; anonymous protected work/business/stocks/notification/profile/admin 401. Admin invalid-bearer GET **123/123 responded 401**. 124 carefully bounded public/anonymous GET samples: 85 HTTP 200, 27 HTTP 401, 12 HTTP 503 (some intentional). Source-specific fallback and parse validation remain separate gates.
- Official `test.easy-scraping.com` still HTTP **502**; its existing Nginx upstream is not available. Static admin `/admin/users` still has baked Next export failure state, so authenticated Web UI acceptance is **not** certified.

## Operational containment (reversible, limited, NOT a new Java app release)
Previously existing temporary P0 administration/pension Nginx safeguards remain. Following read-only evidence, production Nginx also temporarily denies verified-owner-dependent work/notifications/profile/business-personal and stock-personal paths, plus dynamic stock-order and club join/leave paths. Exact and prefix guards tested, nginx -t passed before graceful reload; sample protected paths returned 403; public homepage/health/shop/stocks/business catalog/club list still return 200 (the old public catalog values remain WRONG until a verified source deployment). Backups and raw logs stay on restricted MiniPC, not GitHub. Production Spring process PID remained unchanged and no Production DB/ledger write was performed. These temporary denies also block valid users of those functions.

## Release gates and unresolved blockers
**RELEASE HOLD**: restore independently configured official Test (no production DB or copied private data served to public Test), prove same exact artifact SHA and rollback/restore; verify positive signed-in member and admin sessions and role changes/MFA/CSRF, owner/data source mapping, UI dynamic authenticated rendering, real PostgreSQL function permissions and positive read contracts, test-only rollback-based financial receipt invariants, Discord voice and capacity/Android later. Existing other domain fallbacks also require full inventory. JUnit green and HTTP status 200 are not sufficient for Production promotion. Continue issue #3265 and security issue #3202.
