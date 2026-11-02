# Backend B v748 — Venture finance write CSRF boundary (DRAFT / RELEASE HOLD)

- Source: `origin/main` `a8541927c3a351d980454c66e95a3356c47e0722`; isolated branch `auto/hourly-b-v748-venture-write-csrf-20261102-0935`. Existing venture evidence/source-hold changes (C #2336) are not modified.
- Defect: authenticated, consented `POST /businesses/ventures/invest`, `/claim-dividend`, `/apply-founder` did not require session-bound CSRF. Even though these endpoints currently return 503 and do not settle WLD, the missing boundary would be unsafe when enabled. No verified production exploit.
- Fix: attach existing `CsrfGuard` to the three POSTs, after class-level `SessionGuard`, `AuthenticatedGuard`, `ConsentGuard`. Missing/wrong token -> 403; matching session token -> existing 503 financial hold. Read-only GET unchanged; no new route, DB migration, grants, money movement, or financial success response.
- TDD: RED 9 failed / 1 passed, SHA `fa703675636f0a7f44d3b9b4241a6177a88018b0`. GREEN 12/12 HTTP tests, including existing GET evidence tests. Existing HTTP fixture now provides CSRF dependencies.
- Frontend: no active venture finance POST caller found in main; venture financial settlement remains disabled. Future enabling must use the authenticated server-side CSRF request path and complete owner/ledger/idempotency/integration tests.
- Gate: pending full verification; do not merge or deploy before exact-SHA official Test, authenticated E2E, CI, finance/DB/ACL and independent restore all PASS. Main/Test/Production untouched.
