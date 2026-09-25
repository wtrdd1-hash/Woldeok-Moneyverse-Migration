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



## Mobile/responsive acceptance — v2026.09.25.440

All administrator workspaces, including Economy Operations and AI Council, follow the P0 responsive contract in `ACCESSIBILITY_RESPONSIVE_INTERACTION_SPEC.md`. Mobile layouts must not create page-level horizontal overflow, clipped navigation, overlapping cards or unreachable controls. Economy sliders must keep thumb position, displayed number, draft state, submitted payload and server-authoritative saved value synchronized; any mismatch disables apply/save. Material admin UI changes require at least five complete QA passes across the required mobile/tablet/desktop viewport matrix before promotion.
