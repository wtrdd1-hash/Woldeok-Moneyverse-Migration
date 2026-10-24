# B v505 — Central Bank and Mint Administrative Command Boundary

Status: implemented on isolated Draft candidate; release HOLD.

## Intent and bounded design
Only an administrator with a currently open, second-factor-verified admin console session and recent reauthentication may create or burn minted currency, accept a mint batch, or change monetary policy. Retain the existing member session, consent, admin-role and CSRF checks. Keep central-bank member read endpoints unchanged. Do not change monetary balances, database grants, migrations, or API payloads.

## Implementation
1. RED: Add controller guard metadata regressions for the five monetary mutations, and assert a member monetary read remains free of admin-console gating.
2. GREEN: Apply AdminSessionGuard and ReauthGuard to the three central-bank mutations, and to the two mint mutations. Mint read endpoints are already admin-only, so require the admin console at the class boundary.
3. Verify focused regressions, all backend unit tests, API contract, lint, typecheck and build. Run frontend suite and dependency audit. Leave official Test and Production HOLD until every required release gate is green.
4. Coordinate with Development C: the current CentralBankPanel is client-side simulation with local-only success states and is not an authoritative monetary policy UI. Do not claim end-to-end completion.

## API contract
- POST /api/v1/central-bank/mint-batches/:id/accept
- PUT /api/v1/central-bank/base-rate
- PUT /api/v1/central-bank/reserve-requirement
- POST /api/v1/mint/batches
- POST /api/v1/mint/burn

No request/response shape change. Each mutation now additionally requires an open admin console session and recent reauthentication (existing CSRF and role checks remain). The existing guards return 403 if no console session is present, 401 for locked/expired console or stale reauthentication. GET /api/v1/central-bank/monetary-aggregates stays member-readable.

## Safety and rollback
No DB schema, ledger, role grant, migration, operational state or Production/Test deployment changes. Rollback is a code-only revert if authorized; no rollback of monetary records. Backend guards alone do not make the existing fake frontend control panel operational.
