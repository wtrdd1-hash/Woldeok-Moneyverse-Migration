# Backend B v680 — Public Treasury disclosure reconciliation gate

**Status: DRAFT / RELEASE HOLD.** Baseline `origin/main` `761a55a094fb9dd383d213e817305e68c79fa23c`.

## Reproduced defect

`GET /api/v1/treasury/public-overview` returned HTTP 200 and a success-shaped WLD balance even when the repository's reconciliation status was `UNVERIFIED` or absent. The controller also generated a wall-clock `timestamp`, which could be mistaken for a certified financial observation. In isolated HTTP tests, six uncertified fixtures returned 200 before the change. A raw PostgreSQL `42501` failure returned HTTP 500 instead of a safe source-unavailable response.

## Code and contract

- Nest public Treasury route returns HTTP 503 `PUBLIC_TREASURY_RECONCILIATION_PENDING`, `Cache-Control: no-store`, and no WLD/vault fields when reconciliation evidence is missing, inconsistent, invalid or future-dated.
- A successful public projection requires `RECONCILED`, zero discrepancy, matching ledger/vault/total WLD strings, a parseable non-future reconciliation time and vault-sum consistency. Its `timestamp` is the reconciliation time, not request time.
- Unhandled repository/SQL errors are mapped to 503 without leaking table names. Existing typed `ServiceUnavailableException` failures preserve their existing 503 codes.
- No DB schema, grants, WLD, ledger, authentication, frontend or write path was modified.

## Evidence and limitations

TDD RED: six unsafe 200 responses; SQL privilege-error test RED 500. GREEN: 22 focused tests after the first change and 1 real PostgreSQL HTTP test after 311 clean migrations. The clean DB `moneyverse_app` has vault SELECT but cannot insert into `ledger_postings`; no real financial transaction was performed. Full lint/typecheck/tests/build and remote CI are separately recorded in the PR and internal v680 logs.

**This is a defensive disclosure gate, not independent ledger certification.** Current repository reconciliation is `UNVERIFIED`; a genuinely certified reconciliation/receipt source and Next frontend `/api/treasury/overview` artifact/edge attestation remain separate P0 work (#1917/#1976). Never infer Production behavior from mocked HTTP tests or clean DB alone. No main merge, official Test promotion, Production deployment or automation change without all exact-SHA release gates.
