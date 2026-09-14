# v2026.09.14.91 — Web first-party login worklog

## Scope

Expose the existing first-party email/password authentication capability on the public web login page without creating a second authentication or session system.

## Ordered versions

- `v2026.09.14.91.1` — Pre-work audit: checked the current login UI, local-auth controller, authentication/security planning document, cookie relay, internal API boundary, and promotion workflows.
- `v2026.09.14.91.2` — Authentication action: added pre-login session bootstrap, CSRF propagation, first-party credential login, and API-issued cookie relay through the Next.js server action.
- `v2026.09.14.91.3` — Login UX: added email/password fields, local-login button, generic credential errors, and retained Discord/Google login.
- `v2026.09.14.91.4` — Mid-work plan recheck and documentation: re-read the authentication priority specification to confirm that local email/password must reuse the existing auth core and server-managed session model. Added EN/KO changelogs and PR metadata.
- `v2026.09.14.91.5` — Delivery gate: exact-head CI / Build Test Candidate must succeed before integration to `main`; after integration the repository's existing isolated-Test exact-SHA and Production GitOps gates remain authoritative.

## Files changed

- `frontend/src/app/login/actions.ts`
- `frontend/src/app/login/login-providers-view.tsx`
- `frontend/src/app/login/page.tsx`
- `docs/changelog/2026-09-14-web-local-login-v2026.09.14.91.md`
- `docs/changelog/2026-09-14-web-local-login-v2026.09.14.91.ko.md`

## Security / compatibility checks

- No new client-side API credential or token storage was introduced.
- The browser still does not receive `INTERNAL_API_TOKEN`.
- Invalid email and invalid password are presented through one generic credential error.
- The implementation reuses the existing local-auth backend, server-side session rotation, CSRF checks, cookie policy, Argon2id verifier, and rate limiting.
- OAuth provider flows remain unchanged.

## Environment note

The designated remote development machines were checked before delivery. The available Remote Desktop Commander devices were offline at that point, so direct interactive verification from the designated mini-PC environment could not be performed. Repository CI/Test promotion remains fail-closed and is used as the executable delivery gate rather than bypassing it.

## Branch / PR

- Branch: `feat/web-local-login-v2026.09.14.91`
- PR: `#309`
- Promotion rule: successful exact-head candidate -> `main` integration -> main candidate -> isolated Test exact-SHA/backend checks -> Production GitOps promotion.
