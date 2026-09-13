# Internal Worklog — v2026.09.13.48

## Request
Simplify first-party app authentication, remove the numeric password minimum, document the app login/registration API in detail, verify the real API on the isolated test stack, then merge and promote to Production.

## Implementation
- Registration policy changed from 15–128 characters to non-empty through 128 code points, with no numeric minimum.
- Login request validation no longer declares a numeric minimum.
- Obvious common short passwords are blocked explicitly.
- Existing Argon2id/NFC/session/CSRF/enumeration-resistant behavior remains.
- Added `docs/app-auth-api-guide.md` and Korean parity document.
- Updated current auth planning and mobile integration documents.

## Required release checks
- local lint/typecheck/build/tests;
- exact-SHA test deployment;
- real test-server prelogin/policy/consent/register/verify/login/viewer/logout checks where mail/test credentials permit;
- test backend health/version confirmation;
- merge to main only after Test passes;
- Production exact-SHA/backend verification after promotion.
