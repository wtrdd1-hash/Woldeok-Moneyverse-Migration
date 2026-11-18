# v2026.11.18.4 — Backend API Data Source Truth Candidate

2026-11-18 KST | P0 API/Source-truth isolated code & Production reversible **security guards only** | **NO APP RELEASE**.

- Production PostgreSQL confirmed shop146, business9, stocks10; old Production API misleading 200 shop2/business2 and anonymous private-account reads.
- Implemented verified actor+CSRF+idempotency/receipt on work, business, stocks and notification; fail-closed admin directory/reconciliation/control, canonical business/shop/stock/public data, honest club 404 and unimplemented join/leave 503. No synthetic price, balance, income, club, empty-on-error, or receipt claims.
- Red/green tests, full Spring 169/169 clean test and bootJar PASS, isolated localhost4613 real Test DB read-only exact-SHA public count/401 verification. Official Test 502 and authenticated positive/financial/UI E2E remain unverified.
- Production Nginx temporary private API denies with private rollback; original Java app and production DB unchanged; public web remains HTTP 200. Related findings, worklog, #3265/#3202 and a new Draft PR. All other domain API contracts remain backlog.
