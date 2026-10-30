# F675-182 Owner-Private Wallet Transaction Detail — Worklog

Start: 12:03 KST — Debian 13.6, root 44%, DATA 45%, services active; main 9da6545c; v1502 Draft #1983.

Midpoint: 12:04 KST — main unchanged; Production symlink v1523 94d38f4, live backend/frontend PIDs 2608302/2608303 in deleted v1515 dirs, Test c2129625; DEV PG 17.11 direct ledger SELECT/audit DELETE; QA v1387 #1984.

## v2026.10.30.1504 — F675-182 Owner-Private Wallet Transaction Detail (FEATURE ADDITION / DRAFT / RELEASE HOLD)
- **Cycle:** Previous Improvement v1502 → Current Addition v1504 → Next Improvement v1506 (provisional). `origin/main` `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef` checked start/mid; stacked on unmerged v1502 Draft #1983; [P0/P1 handoff #1988](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1988). English canonical; Korean equivalent.
- **Source-backed gap:** `/wallet/activity` renders 50 owner ledger rows but no per-transaction CTA or Nest detail endpoint. Transfer returns UUID; existing saved views/monthly digest/bookmarks/calendar range do not implement this. Proposed `/wallet/activity/transactions/:uuid` and Nest `GET /api/v1/wallet/activity/transactions/:uuid`, Android parity; exact owner CASH/BANK signed WLD deltas, net-zero own transfer, safe type/time, evidence status, no counterparty leakage. Read-only, feature OFF, 320px/WCAG 2.2 AA, private no-store/noindex, anonymized KPI. Use SECURITY DEFINER owner read, EXECUTE-only app role, no new direct ledger grants or tables; isolate DB EXPLAIN/tests.
- **P0 (4):** OPS1504-01 QA v1387 #1984 Production symlink v1523 advertises `94d38f4...` but active v1515 PIDs run from deleted dirs; SEC1504-02 DEV app ledger SELECT/audit DELETE #993, checksum 5, MCP logs #1972; FIN1504-03 MINT 18,000 WLD/Treasury 552/SWF/Test synthetic 200 #1917; REL1504-04 full CI, independent restore, official Test exact frontend/backend/edge SHA #1979. **P1 (6):** DETAIL1504-05 owner DB function; 06 Nest DTO/404; 07 Next UI/a11y; 08 Android/session/cache; 09 privacy/admin/SEO/KPI; 10 isolated PG/regression/rollback.
- **Acceptance NOT RUN:** 10,001 synthetic transactions, 100 cross-owner, 100 concurrent, 50 missing/frozen/closed, 30 own-pocket zero-net, 50 malformed/unavailable, 30 session switches, 0 ledger/WLD writes. External independent approved new **0**, cumulative **UNKNOWN / 10,000** → BLOCKED / IN PROGRESS. Docs-only Draft/RELEASE HOLD; no merge, Test or Production deployment. Full contract in [integrated master](INTEGRATED_PLANNING_MASTER.md).


Final verification pending: docs diff, GitHub Draft PR and CI recorded separately. Acceptance tests NOT RUN.

**GitHub:** Draft PR #1990 (stacked on unmerged #1983); engineering issue #1988. Docs-only, RELEASE HOLD.
