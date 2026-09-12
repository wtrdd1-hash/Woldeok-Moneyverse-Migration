# Internal Worklog — v2026.09.12.32 App API + Local Authentication

Date: 2026-09-12
Branch: `feat/app-api-local-auth-v2026.09.12.32`
Scope: member-facing app API authentication

## Implemented

- Preserved the existing `/app-api/v1/*` BFF gateway so native/mobile clients never receive `INTERNAL_API_TOKEN`.
- Confirmed the app gateway already forwards every member-facing API group, including `auth`, while excluding admin/Discord integration groups.
- Kept Discord and Google OAuth on the existing Authorization Code + PKCE/session flow.
- Added `local_email` as a first-party identity provider inside the same server-side session model.
- Added local registration, email-verification completion, and local login API endpoints.
- Added Argon2id password verification using Node's native crypto implementation with 19 MiB memory, 2 passes, and parallelism 1.
- Added private credential/pending-registration/security-event tables with no direct `moneyverse_app` table privileges.
- Added SECURITY DEFINER functions using bind parameters only for registration activation and login session rotation.
- Added generic invalid-credential behavior and dummy Argon2 work for unknown emails.
- Added a non-production-only verification token response for staging/CI flows; production does not expose raw verification tokens.

## API surface

- `POST /app-api/v1/auth/prelogin-session`
- `GET /app-api/v1/auth/policy`
- `PUT /app-api/v1/auth/consent`
- `GET /app-api/v1/auth/providers`
- `GET /app-api/v1/auth/discord/authorize`
- `GET /app-api/v1/auth/google/authorize`
- `GET /app-api/v1/auth/discord/callback`
- `GET /app-api/v1/auth/google/callback`
- `POST /app-api/v1/auth/local/register`
- `POST /app-api/v1/auth/local/verify-email`
- `POST /app-api/v1/auth/local/login`
- `POST /app-api/v1/auth/logout`

## Validation state

- Repository implementation and unit coverage have been added.
- `@미니pc홍` is currently offline, so the required local test-server deployment has not yet been executed.
- GitHub PR CI is the next executable validation gate; production deployment must remain blocked until CI and the test server both pass.

## Remaining production gate

Production local registration still requires an outbound verification-email delivery adapter with SPF/DKIM/DMARC-ready sender configuration. The API and token lifecycle are implemented, but production intentionally does not return the raw verification token.
