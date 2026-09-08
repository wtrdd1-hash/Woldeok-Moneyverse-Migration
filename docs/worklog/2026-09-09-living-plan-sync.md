# 2026-09-09 — Living Project Plan synchronization

## Summary

The original 2026-08-26 project-planning draft was reviewed against the current repository implementation and converted into an implementation-synchronized Living Spec.

## Findings

- The draft still described SQLite WAL as the MVP economy database, while the implemented architecture uses PostgreSQL as the economy and authorization boundary.
- The draft contained an obsolete mandatory two-person approval statement for high-risk administrator operations.
- The current implementation instead uses a single `superadmin` model with compensating controls: admin-session validation, reauthentication at console/high-risk boundaries, TOTP second factor, database-level actor/role checks, least-privilege DB access, and append-only audit evidence.
- The draft mentioned WebAuthn or TOTP as if both were current; the repository currently implements the TOTP/`SecondFactorGuard` path.
- The repository deployment workflow retired the previous always-on test stack on 2026-09-08. Pre-production verification remains a project requirement and must not be reported as a test-server pass when no dedicated test server exists.
- The project lacked a single indexed Living Project Plan location in `docs/`.

## Changes

- Added `docs/planning/PROJECT_PLAN.md` as the English primary Living Spec.
- Added `docs/planning/PROJECT_PLAN.ko.md` as the Korean counterpart based on the uploaded Korean planning draft and current implementation.
- Added a documentation-maintenance rule: intentional validated implementation evolution updates the plan in the same workstream; accidental violations of security/data-integrity invariants are fixed in code instead of documented away.
- Synchronized the admin plan with the implemented single-superadmin security architecture.
- Standardized the documented production economy database on PostgreSQL.
- Documented the current test-stack state while keeping explicit pre-production gates.
- Added the Living Project Plan to `docs/INDEX.md`.
- Updated the hourly project audit automation so specification drift is checked and the Living Spec is updated together with implementation changes.

## Validation scope

This change is documentation/automation only; it does not modify application code, database migrations, secrets, production data, or deployment manifests. Repository CI is still required before merge to ensure documentation changes do not violate repository checks.

## Deployment impact

No runtime deployment is required for this documentation-only change. After merge, the GitHub documentation becomes the maintained planning reference for subsequent implementation work.

## Follow-up

- Continue comparing implementation against the Living Spec on every material feature/security change.
- Restore or replace a dependable isolated pre-production validation environment.
- Expand English/Korean parity when detailed feature-planning sections materially change.
- Keep admin-control-center and security documentation aligned with the actual guard/database-function contract.