# SWF internal liquidation containment (B v529)

## Problem and alternatives
The existing service mutates the treasury vault and portfolio in application SQL. Controller-only holds do not cover internal invocation. A new ledger-backed PostgreSQL function would require isolated DB migration and financial reconciliation, which cannot be certified on the live-shared dev DB. Until that work is completed, fail closed at the service boundary; do not rely on an environment flag as a financial attestation.

## Steps
1. Add a focused failing test proving liquidation never queries the DB or emits a notification, regardless of the runtime flag and requested target.
2. Replace the unjournaled liquidation code with an explicit ServiceUnavailableException, preserving method signature for the current API and its 503 semantics.
3. Run focused regression, lint, typecheck, backend build, API contract, and other available gates; record exact failures and blocked official Test/Production.
4. Compare latest main, English/Korean plan, open PRs and CI before submitting a Draft PR. Do not merge without authorized exact-SHA Test and security/financial gates.
