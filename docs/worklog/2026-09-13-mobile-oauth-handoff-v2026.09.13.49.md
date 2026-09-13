# Worklog — Mobile OAuth Handoff v2026.09.13.49

Date: 2026-09-13
Korean: [2026-09-13-mobile-oauth-handoff-v2026.09.13.49.ko.md](2026-09-13-mobile-oauth-handoff-v2026.09.13.49.ko.md)

## Planning re-check
- Started from `main` `a57fc851c2800d77c8bb284cb1c168cfb3638bc2`.
- Re-read the current v2026.09.13.47 Weekly World Brief pilot plan before implementation.
- The plan change is documentation/growth-only and does not conflict with this auth/API repair.

## Defect
Native Google/Discord OAuth was completed in an external browser and then returned to the website. A browser cookie cannot safely become a native app cookie, so redirecting only the final URL would leave the app unauthenticated.

## Implementation
- Mobile authorize requests use the web start route so the external browser owns the OAuth prelogin cookie.
- OAuth challenges record whether the round trip is mobile.
- Successful mobile callbacks mint a five-minute one-time handoff and revoke the temporary browser login session.
- The frontend redirects to the fixed app URI with only the opaque one-time code.
- The app exchanges that code through `/app-api/v1/auth/mobile/handoff` to receive its own session cookie and CSRF token.
