# v2026.09.14.91 — Web first-party login

## Summary

- Added a first-party email/password login form to the public web login page.
- Reused the existing `auth/local/login` backend flow and the existing server-managed session model; no parallel authentication/session system was introduced.
- Added pre-login session bootstrap and CSRF handling inside the Next.js server action before credential submission.
- Relays API-issued session cookies through the existing secure cookie relay helper.
- Added Korean user-facing error messages for missing credentials, invalid credentials, unavailable local authentication, and generic local-login failure.
- OAuth login options remain available unchanged.

## Security notes

- The browser still never receives `INTERNAL_API_TOKEN`.
- Passwords are submitted only to the server action/API flow and are not written to browser storage.
- Invalid-email and invalid-password outcomes remain a single generic credential error in the UI.
- Existing server-side session rotation, HttpOnly/Secure cookie policy, Argon2id verification, rate limiting, and account-enumeration protections remain authoritative.

## Version / delivery

- Version: `v2026.09.14.91`
- Development branch: `feat/web-local-login-v2026.09.14.91`
- Promotion policy: branch candidate CI -> integration to `main` -> isolated Test exact-SHA gate -> Production GitOps promotion.
