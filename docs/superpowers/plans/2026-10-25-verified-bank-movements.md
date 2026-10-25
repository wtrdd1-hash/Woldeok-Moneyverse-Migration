# Verified member bank movements — implementation plan

## Scope and truth contract
Add owner-only, read-only recent bank deposit/withdraw movement receipts (max 50) to existing bank UI and Android app-api, reusing existing immutable ledger tables. Only label a movement verified if it has a real transaction ID and balanced signed USER_CASH and USER_BANK postings with direction consistent with transaction type. Reject corrupt or incomplete rows rather than inventing a transfer or WLD amount. Never claim the full account history (bounded recent bank movements). No migration and no production writes.

## Steps (TDD)
1. `backend/src/bank/bank-movements.test.ts`: RED tests for UUID/limit validation, owner-scoped parameterized ledger query, large integer-string precision, negative balance/direction mismatches, service error. Implement `BankRepository.getRecentMovements()` and `BankController.movements()` with SessionGuard/AuthenticatedGuard/ConsentGuard and no CSRF for read.
2. `frontend/src/app/bank/movements/page.test.tsx`: RED tests for no fictional rows, auth gate, verified display, failure state, privacy/SEO. Implement `/bank/movements` page and navigation from `/bank`.
3. `frontend/src/app/app-api/v1/[...path]/route.test.ts`: RED test for authenticated Android gateway `GET /banking/movements?limit=50` with private cache headers and errors, then update gateway only if necessary.
4. Verify actual app-role read SQL in isolated PostgreSQL transaction with ROLLBACK; test frontend/backend focused, full tests, lint, typecheck, build, database and contract, audit, SEO/a11y/app-api and exact-SHA Test.
5. Record start/mid/end, changed paths, branch and SHA, full branch/PR inventory and CI, preservation/deletion decisions. Push Draft PR only, do not merge or deploy unless every gate passes.

## Rollback
Feature is additive, read-only; rollback by reverting this branch/PR. No DB migration, ledger mutation or service restart. If release gates fail, leave Draft PR and Production HOLD.
