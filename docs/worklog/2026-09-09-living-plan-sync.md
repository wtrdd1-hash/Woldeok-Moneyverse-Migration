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
- Hourly audit finding: the advertising implementation and deployment manifests failed closed when `ADS_ENABLED` was absent, but `frontend/next.config.ts` independently defaulted the CSP advertising switch to `true`. That broadened `script-src`, `frame-src`, and `connect-src` to Google advertising origins even when the release had not explicitly opted in. This contradicted the Living Spec and the existing SEO/ads operations documentation.

## Changes

- Added `docs/planning/PROJECT_PLAN.md` as the English primary Living Spec.
- Added `docs/planning/PROJECT_PLAN.ko.md` as the Korean counterpart based on the uploaded Korean planning draft and current implementation.
- Added a documentation-maintenance rule: intentional validated implementation evolution updates the plan in the same workstream; accidental violations of security/data-integrity invariants are fixed in code instead of documented away.
- Synchronized the admin plan with the implemented single-superadmin security architecture.
- Standardized the documented production economy database on PostgreSQL.
- Documented the current test-stack state while keeping explicit pre-production gates.
- Added the Living Project Plan to `docs/INDEX.md`.
- Updated the hourly project audit automation so specification drift is checked and the Living Spec is updated together with implementation changes.
- Corrected the CSP advertising switch to default to `false`, matching the existing frontend ad loader, backend config, Dockerfile, Compose defaults, and documented release policy.
- Added a regression test proving that an absent advertising flag does not admit AdSense script, frame, or connection origins.

## Validation scope

The Living Spec synchronization was documentation/automation only and passed repository CI before merge. The advertising CSP correction changes frontend configuration and tests only; it does not modify database migrations, secrets, production data, or advertising publisher identifiers. Repository CI and production smoke verification remain required before deployment.

## References consulted for the advertising finding

- OWASP Content Security Policy Cheat Sheet — restrict remote script origins and use an enforced CSP as defense in depth.
- OWASP Next.js Security Cheat Sheet — validate security-sensitive environment configuration and fail closed when a required/optional capability has not been explicitly enabled.
- Google AdSense Program Policies and Publisher Policies — ad code and placements must be deliberately controlled and must not interfere with user interactions or appear on unsuitable surfaces.
- Project `docs/operations/SEO_ADS_LEGAL_AUDIT.md` and Korean counterpart — advertising is an explicit production release-time opt-in.

## Deployment impact

The Living Spec merge itself requires no runtime deployment. The CSP fix should be deployed only after CI succeeds. It is low-risk and fail-closed: an environment that already sets `ADS_ENABLED=true` keeps the same ad CSP, while an environment missing the flag becomes more restrictive. Rollback is the previous frontend image/commit; no data rollback is involved.

## Follow-up

- Continue comparing implementation against the Living Spec on every material feature/security change.
- Restore or replace a dependable isolated pre-production validation environment.
- Expand English/Korean parity when detailed feature-planning sections materially change.
- Keep admin-control-center and security documentation aligned with the actual guard/database-function contract.
- Continue reviewing CSP toward a stricter nonce/hash model where compatible with the rendering strategy; the current `'unsafe-inline'` exception remains a documented residual risk.
