# App API minimum-version gate — v2026.09.23.372

## Scope
Development B / API-116-01 P1. Current main already exposes the `/app-api/v1` compatibility gateway but had no server-owned minimum supported application version.

## Implementation
- Added optional `APP_API_MIN_VERSION` policy using strict `major.minor.patch` integer comparison.
- Requests below the configured minimum, or without a parseable app-version header while the policy is active, fail before private-API proxying with HTTP 426 and `app_upgrade_required`.
- The response exposes `x-moneyverse-min-app-version` so native clients can render a deterministic upgrade flow.
- Invalid server policy fails closed with HTTP 503 instead of silently disabling compatibility enforcement.
- This is compatibility policy only; authentication and authorization continue to rely on server session/actor/role/consent/step-up controls. Client headers are not treated as identity proof.

## Verification
Focused App API route tests: 10/10 PASS. Frontend TypeScript noEmit PASS. Changed-file ESLint PASS. `git diff --check` PASS.

No schema, migration, DB privilege, ledger, or economic mutation changed. Production promotion remains gated by required CI and exact-SHA evidence.
