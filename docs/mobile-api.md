# Mobile / external app API

The Moneyverse backend already exposes the application surface under `/api/v1`.
The production service is intentionally private and normally accepts requests only
from the Next.js frontend over the compose network with `x-internal-token`.

A native/mobile application must **not** embed `INTERNAL_API_TOKEN`. Treat that
secret as server-to-server only. The safe integration pattern is:

1. The app talks to an app-facing gateway/BFF over HTTPS.
2. The gateway is the only component that holds `INTERNAL_API_TOKEN`.
3. The gateway forwards the caller's Moneyverse session cookie and CSRF token to
   the NestJS API, adding `x-internal-token` itself.
4. OAuth login remains Authorization Code + PKCE through the existing
   `/auth/:provider/authorize` and `/auth/:provider/callback` endpoints.
5. Mutating requests use the session's CSRF token in `x-csrf-token`.

This preserves the existing session, consent, reauthentication and database
security model instead of creating a second authentication system.

## Discovery

Non-production environments publish Swagger UI at `/docs`. The raw OpenAPI JSON
is available at `/docs-json` through Nest Swagger. The document describes the
versioned `/api/v1` endpoints and the two server-side headers.

## Client-visible API groups

The OpenAPI tags are the source of truth. Normal app clients should use member
or public groups such as `auth`, `wallet`, `banking`, `stocks`, `shop`,
`businesses`, `casino`, `board`, `profile`, `progression`, `work`, `content`,
`engagement`, `seasons`, `privacy`, `activity`, and `early-game`.

The `admin` and `discord` groups are not app-client APIs.
