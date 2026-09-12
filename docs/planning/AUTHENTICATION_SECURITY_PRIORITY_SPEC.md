# Woldeok Moneyverse — Authentication Security & Implementation Priority Specification

> Version: v2026.09.12.29
> Status: implementation-oriented security/product specification
> Date: 2026-09-12
> Korean counterpart: [AUTHENTICATION_SECURITY_PRIORITY_SPEC.ko.md](AUTHENTICATION_SECURITY_PRIORITY_SPEC.ko.md)
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, security and privacy operations docs

## 1. Purpose

This specification prioritizes currently incomplete product work and defines a secure first-party email/password registration and login system for a real production service. Existing OAuth/OIDC, server-side sessions, reauthentication, TOTP/admin controls, PostgreSQL security boundaries, audit logging, and deployment gates remain authoritative and are reused rather than replaced.

## 2. Implementation priority order

### P0 — security and account foundation
1. First-party registration/login/recovery with email verification.
2. Account/session security center: active sessions, revoke other sessions, recent security events.
3. Strong database access boundary for identity/private data.
4. Abuse controls: credential stuffing, brute force, password spraying, signup automation, enumeration resistance.
5. Privacy data inventory, retention/deletion workflows, least-privilege operator views.
6. Runtime reality audit of auth flows after service recovery.

### P0.5 — release blockers before broad public growth
1. Legal/privacy disclosure parity for Korea and U.S.
2. Consent/terms version recording.
3. Account deletion/export/recovery operational runbooks.
4. Security monitoring, alerting, incident response, backup/restore proof.
5. CAPTCHA/challenge provider only when risk signals justify it; do not add universal friction by default.

### P1 — product completeness
1. Personal dashboard/onboarding closure.
2. Season 1 full content catalog and reward tables.
3. Stock-market detail/replay/portfolio UX.
4. Business/job/shop/marketplace seed catalogs and admin policy consoles.
5. Casino/probability feature only behind separate legal/channel gates.

### P2 — growth and monetization
1. SEO landing/content system and Search Console operations.
2. Contextual advertising on approved public pages.
3. Ad-free subscription/non-P2W cosmetics after consent/legal gates.
4. Referral/share loops only after anti-abuse instrumentation is proven.

Security/account integrity outranks monetization, growth, and new gameplay because a public service must be able to identify users safely before increasing traffic or value-changing activity.

## 3. Account model

Use one internal immutable random `user_id` as the canonical subject. Login identifiers are separate credentials/identities attached to that user.

Recommended identity types:
- `local_email` — first-party email/password;
- supported OAuth/OIDC providers;
- future passkey/WebAuthn credentials.

Never use email, display name, Discord ID, or sequential database ID as the sole authorization subject exposed to clients.

An OAuth identity and a local credential can be linked only after the user is authenticated to the existing account and completes recent reauthentication. Never auto-merge solely because two providers return the same email string.

## 4. Minimal personal-data principle

Registration collects only what is needed for the service contract:
- verified email address;
- password credential material as a one-way hash only;
- display name/username if required for product identity;
- locale and terms/privacy consent versions;
- security metadata necessary for abuse prevention and incident response.

Do not collect real name, resident registration number, home address, phone number, date of birth, government ID, financial account information, or other sensitive identifiers unless a future feature has a documented legal/product necessity and separate review.

Private account data must not be copied into public profiles, analytics event payloads, ordinary application logs, error traces, URLs, page HTML, browser localStorage, or client-readable JWT claims.

## 5. Password policy and storage

Passwords are never stored, logged, encrypted for later recovery, emailed back, or exposed to administrators.

Use Argon2id for password hashing. Initial implementation target should meet or exceed current OWASP guidance and be load-tested on the production-class backend. Hash records include algorithm/version/work parameters and salt; each password receives a unique random salt. A server-side pepper may be used as defense in depth and must live in the deployment secret manager, never the database or repository.

The system must support transparent rehash on successful login when hash parameters are upgraded.

Password UX:
- minimum length policy aligned to current NIST/OWASP guidance;
- permit long passphrases and Unicode;
- do not require arbitrary character-class composition rules;
- do not silently truncate;
- reject known-compromised/common passwords using a privacy-preserving blocklist/breach-check design;
- allow password managers and paste/autofill;
- no forced periodic password rotation without compromise/risk reason.

## 6. Registration flow

`START → INPUT_VALIDATED → EMAIL_VERIFICATION_PENDING → EMAIL_VERIFIED → ACCOUNT_CREATED/ACTIVATED`

Recommended sequence:
1. User enters email and password through TLS-only form.
2. Server normalizes email according to a documented conservative rule; do not invent provider-specific alias collapsing that can merge distinct accounts.
3. Validate syntax/length; use parameterized DB operations only.
4. Perform abuse/rate/risk checks.
5. Create a short-lived single-use verification challenge; store only a hash of the token if practical.
6. Send verification email without exposing whether another sensitive account exists beyond the generic UX policy.
7. On valid verification, create/activate internal account transactionally.
8. Issue a new authenticated session and rotate any anonymous/pre-auth session identifier.
9. Record consent/version and security event.

If email already exists, public responses should avoid high-confidence account enumeration. Account owners can still receive a secure notification or recovery option.

## 7. Login flow

Input: normalized login identifier + password. Output: authenticated server-side session only after credential verification and risk checks.

The user-facing error remains generic for invalid email/password. Internal telemetry may distinguish nonexistent account, wrong password, blocked credential, throttled attempt, and disabled account without exposing that distinction publicly.

On successful login:
- rotate session identifier;
- set `HttpOnly`, `Secure`, host-scoped cookie; prefer `__Host-` cookie naming where architecture allows;
- use `SameSite=Strict` where compatible, otherwise explicitly justified `Lax`;
- never put auth tokens in localStorage/sessionStorage;
- store session meaning server-side;
- log safe security metadata and update last-authentication state.

## 8. SQL injection and input handling

All authentication queries must use parameterized queries/prepared statements or fixed stored procedures/functions. User-controlled strings must never be concatenated into SQL text.

Forbidden examples include dynamic SQL constructed from email, username, password, sort key, reset token, session ID, provider ID, IP-derived text, or admin search fields.

For dynamic identifiers that cannot be parameterized, use explicit allowlists mapped from internal enum values; never pass arbitrary client column/table names.

Database functions must validate actor/ownership where relevant. Application validation is not the final authorization boundary.

All input DTOs require explicit length bounds, type validation, normalization rules, and rejection of unexpected fields. Validation does not replace parameterized SQL.

## 9. Database privacy and privilege design

The application runtime role receives only the minimum execute/select permissions needed for approved auth functions/views. It must not have broad direct `INSERT/UPDATE/DELETE` access to identity/security tables if sensitive writes can be mediated through reviewed functions.

Recommended logical tables:
- `users` — opaque user ID, account state, created timestamps;
- `user_private_profile` — private email and minimal private attributes;
- `auth_local_credentials` — user ID, password hash metadata, credential status, changed time;
- `auth_identities` — OAuth/local identity links;
- `auth_email_verifications` — hashed challenge, expiry, attempts, consumed time;
- `auth_password_resets` — hashed reset challenge, expiry, consumed/revoked time;
- `auth_sessions` — random server-side session ID hash/reference, user ID, auth strength, issued/last seen/expiry/revoked timestamps;
- `auth_security_events` — append-only safe event metadata;
- `consent_acceptances` — privacy/terms versions and acceptance timestamp.

Email should be treated as private personal data. If lookup requires canonical email equality, store a normalized lookup representation protected by database access controls; encrypt sensitive values at rest where the threat model/operations require it. Database backups inherit the same or stronger confidentiality requirements.

No administrator list screen should display full emails by default. Mask by default and require scoped reason/reauthentication for exceptional access where operationally necessary, with an audit event.

## 10. Password reset and account recovery

Reset tokens are cryptographically random, short-lived, single-use, purpose-bound, and invalidated after successful reset. Store only token hashes where practical.

Recovery response must not reveal whether an account exists. Email links use HTTPS and no sensitive token is copied to analytics/referrer destinations.

Successful password reset:
- changes password hash;
- rotates/invalidate other active sessions by default;
- revokes outstanding reset tokens;
- records security event;
- sends account-security notification;
- requires fresh login or issues a carefully controlled new session.

Support staff must never manually set or read a user's password.

## 11. Brute force / credential stuffing / signup abuse

Use layered protection rather than a simple permanent account lockout:
- per-IP, per-account-key, per-network/device-risk throttling;
- progressive delay/backoff;
- compromised-password screening;
- suspicious-login challenge or temporary step-up;
- MFA/passkey encouragement;
- safe CAPTCHA/challenge only after risk threshold;
- monitoring for password spraying across many accounts;
- notification on suspicious successful login.

Avoid denial-of-service vectors where an attacker can lock another user's account indefinitely by intentionally failing passwords.

Rate-limit policy is a security protection and must be measured for false positives.

## 12. MFA and passkeys

P0 local accounts support optional TOTP MFA for ordinary users, reusing existing secure second-factor primitives where appropriate but keeping admin policy stricter.

P1 should add WebAuthn/passkeys as the preferred phishing-resistant path after implementation/QA. Recovery codes are one-time, hashed at rest, downloadable once, and regenerating them invalidates old codes.

High-risk actions require recent reauthentication and may require MFA even when ordinary browsing does not:
- password/email change;
- linking/unlinking identity providers;
- disabling MFA;
- account deletion/export;
- high-risk economy/security changes where policy requires it.

## 13. CSRF, XSS and session theft defenses

Cookie-authenticated state-changing endpoints require CSRF protection in addition to SameSite defense in depth. Do not use GET for mutations.

Apply CSP/output encoding and avoid rendering untrusted values into raw HTML. Authentication pages must not load unnecessary third-party scripts. Login/reset URLs must not leak secrets via query logging, analytics, screenshots, referrers, or support tooling.

Session fixation protection requires rotation after login and privilege/auth-strength changes. Logout revokes the server-side session and clears cookie. Password reset, account compromise response and administrator action can revoke all sessions.

## 14. Email change

Changing login email requires:
1. active authenticated session;
2. recent reauthentication;
3. verification of new email;
4. notification to old email;
5. uniqueness/identity-link checks;
6. session/security-event policy review;
7. no public indication of private account associations.

Do not immediately replace the old verified address before the new address is proven.

## 15. Account states

Suggested states:
`PENDING_EMAIL → ACTIVE → SECURITY_HOLD | USER_LOCKED | SUSPENDED → ACTIVE`, with `DELETION_PENDING → DELETED/ANONYMIZED` as the privacy lifecycle.

Business moderation suspension and security-compromise hold are distinct concepts. Security recovery should not silently alter economy ledger history.

## 16. Privacy deletion/export

Account deletion must not break append-only financial/game audit integrity. Personal identifiers should be deleted/anonymized according to the legal retention policy while transaction records preserve non-identifying references required for integrity, security, fraud investigation, or legal obligations.

Document each retained field with purpose, retention basis, duration, and deletion/anonymization method. Backups need documented expiry and restore-time deletion replay procedures.

User export must be actor-scoped, authenticated, rate-limited, and delivered securely; never expose other users' private data.

## 17. Logging and monitoring

Never log passwords, password hashes, reset/verification tokens, session cookies, TOTP secrets, recovery codes, OAuth tokens, full request bodies, or database secrets.

Security events may include safe IDs, event type, timestamp, result, coarse/risk-scoped network/device metadata, session ID reference, and trace ID.

Alerts should cover:
- credential stuffing/spraying patterns;
- abnormal successful-login geography/device changes where signals are reliable;
- repeated reset attempts;
- session replay anomalies;
- mass account creation;
- MFA disable bursts;
- unexpected privileged/private-data access.

## 18. API contract

Suggested P0 endpoints:
- `POST /auth/register`
- `POST /auth/verify-email`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/logout-all`
- `POST /auth/password/forgot`
- `POST /auth/password/reset`
- `POST /auth/password/change`
- `POST /auth/email/change/start`
- `POST /auth/email/change/confirm`
- `GET /auth/sessions`
- `DELETE /auth/sessions/:sessionId`
- `GET /auth/security-events`
- MFA endpoints under a separate explicit namespace.

Responses use stable public error codes that do not expose database/internal auth details.

## 19. UI/UX

### Registration
Fields: email, password, confirm password only if necessary, required policy consent. Show password requirements before submission, permit password-manager autofill, and do not disable paste.

States: default, validation error, verification-sent, expired verification, already-verified/generic recovery path, throttled, maintenance.

### Login
Email + password, password-manager compatible, clear forgot-password path, OAuth alternatives visually separated but equal. Generic invalid-credential message. No ad slots or third-party marketing trackers on auth forms.

### Security center
Show active sessions with approximate device/browser, last activity, created time and revoke control; password change; MFA/passkey status; linked providers; recent security events; account export/delete. Sensitive values remain masked.

Admin screens never expose raw credential material.

## 20. Testing requirements

Required before runtime rollout:
- unit tests for normalization, password hashing/rehash and token expiry;
- SQL-injection tests across every auth input/search field;
- login enumeration timing/response tests;
- brute-force/credential-stuffing throttling tests;
- CSRF tests for cookie-auth mutations;
- session fixation/rotation/revocation tests;
- concurrent password-reset token consumption test;
- email-verification replay test;
- BOLA tests for sessions/security-event endpoints;
- XSS/output-encoding tests for displayed profile/security metadata;
- database-role negative tests proving direct private-table writes fail;
- backup/restore test confirming credential/private-data controls survive restore;
- test-server end-to-end signup/login/reset/logout-all flow with exact release SHA.

No production rollout until these pass in the isolated test environment.

## 21. Security Definition of Done

The feature is not complete merely because users can log in. Completion requires:
1. Argon2id or approved equivalent password hashing and rehash path;
2. parameterized DB access everywhere;
3. no auth tokens in localStorage;
4. secure rotating server-side session cookie;
5. CSRF/XSS/session fixation defenses;
6. enumeration-resistant login/recovery;
7. email verification and single-use recovery tokens;
8. layered abuse protection with false-positive monitoring;
9. optional MFA and secure high-risk reauthentication;
10. least-privilege DB roles and actor-scoped private reads;
11. masked operator UI and append-only sensitive-access audit;
12. privacy retention/deletion/export design;
13. incident/session revocation controls;
14. EN/KO UI/error/legal text parity;
15. test-server exact-SHA security QA before Production.

## 22. External evidence used

Current OWASP guidance recommends parameterized queries rather than dynamic SQL concatenation, adaptive password hashing such as Argon2id, server-side secure session management, generic authentication errors, reauthentication for sensitive actions, and layered credential-stuffing defenses. NIST digital identity guidance remains the password/authentication baseline to cross-check before implementation. Korea privacy design must follow current PIPC requirements for access control, security safeguards, least privilege, retention/destruction, and accurate disclosure.

## 23. Version record

### v2026.09.12.29 — first-party authentication security planning pass
- Ranked unfinished work with account/security foundation as P0.
- Defined first-party email/password registration, verification, login, recovery and security center.
- Added Argon2id password storage, session lifecycle, CSRF/XSS/SQL-injection defenses, enumeration resistance and credential-stuffing protection.
- Added least-privilege PostgreSQL/private-data model, operator masking, audit and privacy lifecycle.
- Required staging exact-SHA security validation before any Production runtime implementation.

Documentation-only. Runtime implementation requires a separate development branch and test-server verification.