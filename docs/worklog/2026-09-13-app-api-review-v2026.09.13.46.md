# Worklog — App API Review Readiness v2026.09.13.46

## Baseline and plan re-check
- Initial baseline `main`: `5b6efd1f0d2f70bda4cb7385c4efd533c7453c0c`.
- Mandatory mid-work re-check found `main` advanced to `d80c22da548c2f28fb41cf7d06f711dc81c6b00a` / planning v2026.09.13.45. The six intervening files were documentation-only, so there was no runtime/API/DB conflict; this work was renumbered to v2026.09.13.46.
- Re-read the latest retention-safe monetization plan before implementation; it is documentation-only and does not supersede API/auth/runtime requirements.
- Re-read the v2026.09.13.43 user app API coverage audit during implementation.

## Runtime findings
- Production was already serving the baseline SHA and the public BFF after the emergency server recovery.
- Local registration reached register/mail dispatch but failed verification completion with PostgreSQL SQLSTATE 42702.
- PostgreSQL context identified `ON CONFLICT (user_id, consent_version_id)` inside `auth_complete_local_registration` as the exact ambiguity.
- Production's current business settlement function is already the qualified fixed definition; older 42702 settlement entries were historical logs.
- Runtime route map exposed version-neutral OAuth and media paths that the generic app gateway previously translated incorrectly.

## Implementation
- Migration 183 redefines only local-registration completion and uses `ON CONFLICT ON CONSTRAINT user_consents_pkey`.
- Added a real-database LocalAuthRepository registration-completion regression test.
- Added explicit app gateway mappings for version-neutral media and OAuth paths.
- Added complete EN/KO mobile API reference and runtime route inventory.

## Test before merge
- Isolated PostgreSQL container, migrations 0–183: PASS.
- `moneyverse_app` local registration completion DB test: PASS.
- App gateway unit tests: PASS.
- Frontend/backend typecheck for changed modules: PASS.
