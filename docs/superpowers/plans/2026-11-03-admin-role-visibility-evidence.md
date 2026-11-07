# Admin role-list visibility evidence — Development C v1322

## Scope and source

Existing GET /api/v1/admin/controls calls `admin_list_roles(actor)`. Migration 057 invokes `admin_require_superadmin`, which intentionally raises SQLSTATE 42501 for non-superadmin administrators. Nest currently catches 28000 and expected command codes but not intentional 42501, so an otherwise authorized administrator sees HTTP 500. An older fallback converts certain refusals to `roles: []`, indistinguishable from a genuinely empty authorized list. This is a P1 administrator UX/API contract defect, not a request to weaken the SQL role boundary.

## Decision

Retain PostgreSQL SECURITY DEFINER, guards, role revocation and financial data untouched. Add `rolesEvidence` to the Nest overview response: VERIFIED only after successful role query, RESTRICTED only for explicit role refusal or 28000, UNAVAILABLE for expected command failure. Preserve an actual `42501 permission denied for ...` as a server failure. On Next, require this provenance and reject contradictory nonempty restricted rows. Show an accessible restriction/unavailable notice, retry on unavailable, and allow superadmin role mutation forms only when role evidence is verified. Use the existing private admin session and mobile-responsive cards; do not add public routes or SEO indexability.

## Tests and execution

1. Write backend tests for verified, verified-empty, role refusal, command failure, real missing-grant propagation. RED then GREEN.
2. Write frontend parser tests for verified/RESTRICTED/UNAVAILABLE, missing evidence, contradictory role rows. RED then GREEN. Adjust existing component source test to use Vite raw import and mock form-only dependency; run with NODE_ENV=test.
3. Run focused tests and review for security, type correctness, UI keyboard/screen-reader and privacy; record mid main fetch.
4. Commit HEAD, run full build/lint/typecheck/unit/integration/real-PG/security/app-api/E2E as possible, preserve failures and exact SHA. No Test/Production writes or merge on any failed gate.
