# v2026.09.12.29 — Authentication Security & Implementation Priorities

## Summary

- Ranked unfinished work with first-party account security as P0.
- Added implementation-level planning for email/password registration, verification, login, recovery, session security and user security center.
- Added SQL injection prevention, Argon2id password storage, CSRF/XSS/session fixation defenses, enumeration resistance, credential-stuffing protections, MFA/passkey roadmap, least-privilege database design, privacy retention/deletion/export, masked operator access and append-only security audit requirements.
- Kept existing OAuth/OIDC, server sessions, reauthentication and TOTP/admin security as the base architecture rather than replacing them.

## Deployment

Documentation-only. No test-server or Production deployment is required for this documentation change. Runtime implementation must use a separate development branch and pass isolated test-server exact-SHA backend/database/API/security validation before Production.