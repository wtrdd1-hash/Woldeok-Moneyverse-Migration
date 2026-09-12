# 2026-09-12 — Product Planning Worklog v2026.09.12.29

## Focus

Prioritized currently incomplete work and specified first-party account registration/login as the highest-priority security foundation for a real production service.

## Inputs reviewed

- latest Living Project Plan and current main branch state;
- existing NestJS auth module, OAuth/OIDC, session-cookie, reauthentication and TOTP/admin security implementation;
- current OWASP Authentication, Password Storage, SQL Injection Prevention, Session Management and Credential Stuffing guidance;
- current NIST digital identity guidance as a standards cross-check;
- current Korea PIPC security/privacy safeguards as a privacy design baseline.

## Priority decision

P0: first-party auth, session/security center, private-data DB boundary, abuse controls, privacy lifecycle, runtime auth audit.
P0.5: legal/privacy parity, consent versioning, deletion/export/recovery runbooks, monitoring/incident response/restore proof.
P1: core product/content closure.
P2: SEO, monetization and referrals after account/security instrumentation is proven.

## Key security decisions

- Reuse existing OAuth/server-session/admin-security foundations; add local credentials as another identity method.
- Passwords are one-way hashed using Argon2id or an approved equivalent; never plaintext/reversible storage.
- Every auth database operation uses parameterized SQL/prepared functions; user input is never concatenated into SQL.
- Auth tokens/session IDs are not stored in browser localStorage/sessionStorage.
- Login/recovery responses resist account enumeration.
- Session IDs rotate on login/auth-strength changes; server-side revocation supports logout-all and incident response.
- Private email/account data is separated from public profile data, masked in operator UI and protected by least-privilege database roles.
- Recovery/verification tokens are short-lived, one-time and hash-stored where practical.
- CSRF, XSS, session fixation, credential stuffing, password spraying, brute force and BOLA tests are release requirements.

## Concurrency check

Main moved during this planning pass from `f4d86b110c14ee4853f9e6491ac1b6dbf7ae10e9` to `1b430f540d978751e67f1417ae5747e048f8bd74`. The concurrent changes were Korean documentation/navigation work, not authentication/security logic. The PR should be synchronized with latest main before merge.

## Deployment

Documentation-only. No staging deployment is needed for this planning change. Runtime implementation must be performed on a separate development branch and pass exact-SHA test-server backend/database/API/security validation before Production.