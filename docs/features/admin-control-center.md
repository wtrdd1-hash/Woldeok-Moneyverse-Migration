# Admin Control Center

The admin surfaces expose operational/economy read models and tightly-scoped control functions. They are not a shortcut around the same database security rules members use.

## Principles

1. HTTP/admin UI authorization is necessary but not sufficient.
2. Database functions also verify the acting administrator/operator where the operation is sensitive.
3. Economy amounts remain strings/BigInt-safe through API and UI.
4. The application role should not receive direct write grants to protected economy tables just because the caller is an administrator.

## Shop administration

Catalog read/update operations use admin-scoped functions. Operator/superadmin boundaries and database validation apply to price, stock and active-state changes.

## Economy / member inspection

Read models return the actual database contract. Frontend field names must match returned fields; stale UI schemas can otherwise show zero/undefined values while the underlying data is correct.

## Asset corrections

Any privileged correction path must clearly state the supported asset types and direction. UI options must not advertise a loan mutation that the database does not safely support.

## Macro controls

Actor-scoped macro functions are preferred to unauthenticated/no-actor application-callable functions. This keeps the final authorization decision near the query/control itself.

## Treasury management

The administrator control center includes a planned **Economy → Treasury** workspace governed by the dedicated [Administrator Treasury Management Specification](../planning/ADMIN_TREASURY_MANAGEMENT_SPEC.md).

Treasury balance, available/reserved funds, revenue, expenditure, budgets, correction transactions and reconciliation are server-authoritative accounting state. Administrators may inspect and perform narrowly scoped actor-authorized commands, but may not directly overwrite the balance or edit/delete historical ledger entries.

Manual corrections require recent re-authentication, explicit reason/evidence, BigInt-safe integer-string amounts, idempotency, database-side actor verification, transaction atomicity and immutable audit. Reconciliation findings expose variance and source evidence; they never silently rewrite balances.

