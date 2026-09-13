# Changelog — Mobile OAuth Handoff v2026.09.13.49

Date: 2026-09-13
Korean: [2026-09-13-mobile-oauth-handoff-v2026.09.13.49.ko.md](2026-09-13-mobile-oauth-handoff-v2026.09.13.49.ko.md)

- Added native Google/Discord OAuth return flow through a fixed app deep link.
- Added five-minute, single-use OAuth handoff codes; app exchanges the code for its own session cookie and CSRF token.
- Added `POST /app-api/v1/auth/mobile/handoff`.
- Mobile authorize requests now receive a browser start URL instead of opening the provider from the app HTTP cookie jar.
- Web OAuth behavior remains unchanged.
- Added migration 184 and DB regression coverage for one-time handoff consumption.
- Updated the full mobile API reference with exact Android/iOS integration steps and security requirements.
