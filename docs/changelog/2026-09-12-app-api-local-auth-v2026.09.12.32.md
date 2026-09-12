# v2026.09.12.32 — App API + First-Party Authentication

## Added

- First-party `local_email` registration and login APIs on the same session/CSRF core used by OAuth.
- Email-verification activation endpoint and hashed single-use verification tokens.
- Native Node Argon2id password hashing with a 19 MiB / 2-pass / p=1 baseline.
- Least-privilege credential and pending-registration database tables behind SECURITY DEFINER functions.
- Authentication security-event storage and generic invalid-credential responses.
- `local_email` in auth provider discovery.

## Existing app login support retained

- Discord OAuth Authorization Code + PKCE.
- Google OAuth/OIDC Authorization Code + PKCE.
- Member-facing `/app-api/v1/*` BFF, which adds the internal API token server-side and forwards session cookies/CSRF without exposing internal credentials to apps.

## Deployment status

Not production-deployed. GitHub CI and the isolated Test server must pass first. `@미니pc홍` is currently unavailable, so the Test server validation gate remains open.

Production local registration additionally requires a real verification-email delivery adapter and sender-domain configuration; production never returns the raw verification token.
