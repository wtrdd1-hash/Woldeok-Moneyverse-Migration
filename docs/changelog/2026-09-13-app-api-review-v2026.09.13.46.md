# Changelog — App API Review Readiness v2026.09.13.46

Date: 2026-09-13
Korean: [2026-09-13-app-api-review-v2026.09.13.46.ko.md](2026-09-13-app-api-review-v2026.09.13.46.ko.md)

## Fixed
- Repair first-party email registration completion: PostgreSQL no longer raises SQLSTATE 42702 on the `user_consents` conflict target.
- Route app BFF `/app-api/v1/media/*` to the backend's version-neutral `/media/*` surface.
- Route app BFF OAuth start/callback paths to the backend's version-neutral `/auth/:provider/*` surface.

## Verified
- Fresh isolated PostgreSQL schema applies migrations 0 through 183.
- Real `moneyverse_app` registration-completion regression test passes.
- Production runtime route map was re-audited against the app BFF boundary.

## Documentation
- Added `docs/mobile-api-reference.md` and Korean second-language companion with session/CSRF/auth/upload usage and the audited app route inventory.
