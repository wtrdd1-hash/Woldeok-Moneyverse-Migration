# Woldeok Moneyverse — Authentication Security & Implementation Priority Specification

> Version: v2026.09.12.31
> Status: implementation-oriented security/product specification
> Date: 2026-09-12
> Korean counterpart: [AUTHENTICATION_SECURITY_PRIORITY_SPEC.ko.md](AUTHENTICATION_SECURITY_PRIORITY_SPEC.ko.md)
> Parent specs: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `SEASON_SYSTEM_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`

## 0. Decision summary

Moneyverse is a real public service with economy, community and account data. Therefore unfinished work is not prioritized by visual novelty. The first release priority is account integrity, privacy, database isolation and recoverability; only after those gates pass should broad acquisition, monetization and additional high-risk gameplay expand.

The existing OAuth/OIDC, secure cookie sessions, reauthentication, TOTP/admin controls, PostgreSQL security boundaries, append-only audit, and staging-first deployment model remain authoritative. First-party email/password authentication is an additional identity provider (`local_email`) layered onto the existing authentication core, not a second parallel session/security system.

## 1. Current implementation reality and unfinished-work priority

The repository already contains OAuth/OIDC authentication code, secure-cookie/session infrastructure, reauthentication and second-factor components, actor-scoped database patterns, economy ledger/audit controls, and documented staging gates. The Living Project Plan still identifies user-visible feature gaps and recurring security/specification drift as active work. The first-party email/password lifecycle and full member security center are not current implemented baseline features.

### P0 — release/security blockers

| Order | Work item | Current assessment | Why it is before growth | Exit gate |
|---:|---|---|---|---|
| 1 | First-party registration/login/email verification/recovery | planned / not baseline | account takeover and privacy boundary | security DoD in this spec + staging E2E |
| 2 | Identity/private-data DB boundary | partial foundation exists | breach blast radius | least-privilege negative tests pass |
| 3 | Session security center + revoke-all | planned | user compromise recovery | cross-session revoke/replay tests pass |
| 4 | Credential-stuffing/spraying/signup-abuse defenses | incomplete as full local-auth flow | public auth endpoints attract automation | rate/risk tests + false-positive telemetry |
| 5 | Privacy inventory, retention, deletion/export | planning required | Korea/U.S. production obligation/risk | field-by-field retention matrix + runbook |
| 6 | Security logging/alerting/incident recovery | foundation exists, auth-specific expansion needed | compromise must be detectable/recoverable | alert drills + backup/restore proof |
| 7 | Production auth runtime audit | runtime verification currently unavailable | docs/code can drift from real UI | production-safe read-only audit completed |

### P0.5 — public-scale gates

1. Terms/privacy/consent version recording for Korea and U.S. service paths.
2. Account deletion, export, recovery, breach-response and identity-linking runbooks.
3. Security review of every authentication endpoint against OWASP ASVS 5.0 classes relevant to authentication, session management, access control, validation and data protection.
4. Email sender-domain security (`SPF`, `DKIM`, `DMARC`) and anti-phishing templates before password reset/verification goes live.
5. CAPTCHA or proof-of-human challenge only as adaptive protection after abuse signals; never a universal substitute for server-side throttling.
6. Legal/privacy applicability check against the Korea Personal Information Protection Act and September 11, 2026 strengthened breach-prevention regime; mark obligations requiring counsel/compliance confirmation.

### P1 — product completeness after P0

1. New-user onboarding and dashboard closure.
2. Jobs/profession mastery and seed content reachable from UI.
3. Season 1 end-to-end content/reward/config/settlement readiness.
4. WDX detail/portfolio/replay and market-integrity UX.
5. Business, shop, marketplace/crafting, clubs and personal-space seed catalogs plus admin policy consoles.
6. Casino/probability expansion only behind channel/legal/age gates and separate published game math.

### P2 — growth and revenue

1. Public SEO content system, Search Console operations and EN/KO discovery.
2. Contextual advertising only on allowlisted public content pages.
3. Ad-free subscription and non-P2W cosmetic monetization after billing/privacy gates.
4. Referral/share loops only after account-abuse attribution is proven.

## 2. Identity model

Use one cryptographically unpredictable immutable internal `user_id` as the canonical authorization subject. Login identifiers and providers are credentials linked to that subject.

Supported identity types:
- `local_email` — first-party verified email + password;
- existing OAuth/OIDC providers;
- future WebAuthn/passkey credentials.

Never authorize by email, display name, Discord ID, URL-supplied user ID, or sequential database key alone. Public opaque IDs may be separate from internal primary keys where useful.

Never auto-merge accounts only because OAuth and local login return the same email. Linking requires an authenticated existing account, recent reauthentication, provider proof and conflict checks. Unlinking the last usable authenticator is rejected unless a replacement credential is established first.

## 3. Personal-data minimization

Default registration collects only:
- verified email;
- password verifier material (one-way hash only);
- optional required display identity;
- locale;
- terms/privacy/age-policy acknowledgement versions as legally/product-required;
- narrowly scoped security metadata needed for fraud/abuse/incident response.

Do not collect real name, resident registration number, home address, phone number, government ID, exact location, financial account information or date of birth by default. If age handling requires a mechanism, use the least data-intensive design that satisfies the selected distribution/legal model and document retention separately.

Private identity data must never be copied into public profiles, URLs, ordinary analytics payloads, client-visible JWT claims, browser localStorage, logs, exception messages, metrics labels or support screenshots.

Maintain a data inventory containing: field, purpose, source, table, encryption/access class, processors, retention, deletion/anonymization action, export behavior and legal/product owner.

## 4. Password policy — production baseline

Current NIST SP 800-63B-4 (published August 1, 2025) is the password baseline to cross-check before implementation. Because a password can initially operate as a single factor for ordinary local accounts, require at least **15 characters**. Permit at least **64 characters**; a higher explicit technical ceiling such as 128 or 256 code points may be used for denial-of-service protection but must be documented and must never silently truncate.

Password rules:
- permit passphrases, spaces, Unicode and password-manager generated values;
- normalize Unicode consistently (prefer the current NIST NFC guidance) before hashing, with behavior documented;
- do not require arbitrary uppercase/lowercase/digit/symbol composition;
- do not require periodic rotation without compromise evidence;
- compare the full prospective password against a common/expected/known-compromised password blocklist;
- never use security questions/KBA;
- never show password hints;
- allow paste/autofill/password managers.

Use a client-side strength meter only as guidance, not as a substitute for the server policy.

## 5. Password storage

Passwords are never stored in plaintext, recoverable encryption, logs, analytics, support systems or backups outside the credential table.

Preferred verifier: **Argon2id**. Initial target must meet or exceed current OWASP Password Storage guidance and be benchmarked on production-class hardware. The present OWASP baseline includes Argon2id configurations such as 19 MiB memory, 2 iterations, parallelism 1; production may choose a stronger setting if login latency and denial-of-service resilience remain acceptable.

Requirements:
- unique cryptographically random salt per password;
- PHC/modular encoded record containing algorithm/version/work parameters;
- optional pepper stored only in a secret manager/HSM-class secret boundary, never beside hashes or in Git;
- constant/safe library verification function;
- transparent rehash after successful authentication when policy parameters increase;
- credential table never readable through ordinary member/admin list endpoints;
- password hash exposure is treated as a security incident even though hashes are one-way.

## 6. Registration state machine

`START -> VALIDATED -> VERIFICATION_PENDING -> VERIFIED -> ACTIVE`

Server flow:
1. Receive email/password over HTTPS only.
2. Apply explicit DTO type and size limits before expensive hashing.
3. Normalize email conservatively; do not invent provider-specific dot/plus alias merging.
4. Run abuse/risk throttles before creating unlimited DB rows or sending mail.
5. Check uniqueness through parameterized DB access without exposing account existence in the public response.
6. Generate a high-entropy single-use email verification token; store a hash/reference, purpose, expiry, attempt count and consumed timestamp.
7. Send a non-sensitive verification email.
8. Atomically activate account after successful token validation.
9. Rotate any pre-auth session identifier and establish the normal server-side authenticated session.
10. Write safe security and consent-version events.

Do not issue spendable WLD, referral rewards or economy entitlements before account activation rules are satisfied.

## 7. Login behavior and enumeration resistance

Public invalid-login responses use a stable generic message and stable public error class regardless of whether the email exists, the password is wrong, or the credential is disabled. Internal telemetry may retain the precise reason under restricted access.

Timing does not need artificial perfect equality, but code paths should avoid gross user-existence timing leaks. Rate limiting must not disclose existence via materially different headers or retry behavior.

Successful login:
- rotate session ID;
- set `HttpOnly`, `Secure`, host-scoped cookie; prefer `__Host-` semantics where compatible;
- choose explicit `SameSite=Strict` or justified `Lax`;
- never store session/refresh/auth tokens in localStorage or sessionStorage;
- maintain session state server-side;
- persist authentication strength, issued time, idle/absolute expiry and revocation state;
- record safe login security event.

## 8. SQL injection and all input boundaries

SQL Injection is a release blocker. OWASP Top 10:2025 places Injection in A05 and OWASP guidance continues to recommend parameterized queries/prepared statements rather than string concatenation.

Rules:
- all email, username, password metadata, verification/reset token reference, session ID, provider ID, IP-derived value, search text and admin filter values use bind parameters or fixed reviewed database functions;
- never concatenate user-controlled data into SQL text;
- values that cannot be parameterized (column/order identifiers) map through an internal enum allowlist only;
- dynamic table/function names from the client are prohibited;
- stored procedures are not automatically safe: dynamic SQL inside them follows the same rule;
- database errors never return raw SQL, schema/table names, bind values or stack traces to clients;
- input validation is required but is not considered SQL injection protection by itself.

Authentication/admin search endpoints receive automated injection tests containing quotes, comment markers, Unicode edge cases, overlong input, JSON type confusion and malformed encodings. Passing these tests means queries remain structural constants, not that malicious strings were merely filtered.

## 9. Database isolation for identity/private data

Recommended logical model:
- `users` — immutable subject ID, lifecycle state, timestamps;
- `user_private_profile` — verified email and minimum private attributes;
- `auth_local_credentials` — verifier string/version/status/changed timestamp;
- `auth_identities` — local/OAuth/passkey links;
- `auth_email_verifications` — hashed challenge reference/expiry/consumed state;
- `auth_password_resets` — hashed challenge reference/expiry/consumed state;
- `auth_sessions` — server-side session reference, auth strength, issued/last seen/expiry/revoked state;
- `auth_security_events` — append-only security event metadata;
- `consent_acceptances` — policy version, locale, timestamp and required provenance.

The application database role receives the minimum permissions necessary. Prefer reviewed `SECURITY DEFINER` functions/actor-scoped views where consistent with the current architecture rather than broad direct writes to private credential tables. Sensitive functions set a safe search path and validate the actor internally.

No database credential used by the browser exists. The browser talks only to approved application endpoints.

Admin/operator lists mask email by default. Exceptional unmasking, if necessary, requires scoped authorization, recent reauthentication, reason capture and an audit event. Password hashes, reset tokens, MFA secrets and session cookies have no admin display feature at all.

## 10. Sensitive data at rest, backups and secrets

TLS protects data in transit. Database/storage encryption and infrastructure disk encryption protect at-rest media; especially sensitive application-level fields may use envelope encryption where threat analysis justifies it. Encryption keys/peppers are outside PostgreSQL and outside source control.

Backups inherit or exceed production confidentiality controls. Backup restore drills must prove:
- auth tables restore without weakening grants;
- deleted/anonymized identity records are re-applied when restoring older backups according to the deletion-replay runbook;
- keys and encrypted backups have separate access paths;
- credential/security logs are not exported to developer laptops as routine fixtures.

Production data is never copied into development/test by default. Use synthetic fixtures or irreversible minimization when realistic shape is required.

## 11. Password reset and account recovery

Reset requests always return a generic response. Tokens are CSPRNG-generated, purpose-bound, short-lived, single-use and hashed at rest. Limit issuance and verification separately.

A successful password reset atomically:
- replaces the password verifier;
- consumes and revokes outstanding reset tokens;
- revokes other active sessions by default;
- records a security event;
- sends a security notification;
- requires fresh authentication or establishes a tightly controlled new session after documented review.

Support staff cannot read, recover, set or email a user's password. Manual recovery cannot bypass identity proof merely because a user knows profile/economy details.

## 12. Email change and identity linking

Email change requires current authenticated session + recent reauthentication + verification of the new email + notification to the old address + uniqueness/link-conflict checks. The old verified email is not discarded before the replacement is proven.

OAuth/local linking and unlinking are high-risk operations. They require fresh authentication and create append-only security events. A provider email match alone is insufficient evidence to merge identities.

## 13. Brute force, credential stuffing and signup automation

Use layered controls:
- per-account-key throttle;
- per-IP/network throttle;
- password-spraying detection across many accounts;
- progressive delay/backoff;
- breached/common-password blocklist at registration/change;
- suspicious successful-login notification;
- risk-based CAPTCHA/challenge only when needed;
- optional MFA and future passkeys;
- rate budgets for verification/reset mail to stop mail bombing.

Do not create indefinite lockouts that attackers can trigger against victims. Security rate limits are justified exceptions to the product's unlimited-default policy because their purpose is protection, not gameplay balancing. Every such limit must have metrics for blocks, false positives, bypass attempts and support impact.

## 14. MFA, passkeys and high-risk reauthentication

Ordinary local accounts should support optional TOTP in the first secure rollout by reusing proven primitives where safe. Administrator authentication remains stricter and separate.

Passkeys/WebAuthn are the preferred future phishing-resistant authenticator. Recovery codes are random, one-time, hashed at rest, displayed/downloaded once and regenerated as a full replacement set.

Require recent reauthentication, and MFA where policy demands it, for:
- password or login-email change;
- link/unlink identity provider;
- MFA/passkey disable/reset;
- recovery-code regeneration;
- account deletion/export;
- security-sensitive economy/admin actions already covered by stronger policy.

## 15. Session management

Treat session identifiers as secrets and untrusted input simultaneously. Validate format before lookup and use parameterized DB access.

Required lifecycle:
- rotate after login;
- rotate after privilege/auth-strength changes;
- revoke server-side on logout;
- revoke-all available to the user;
- idle and absolute expiration policies stored server-side;
- suspicious replay can revoke or step-up;
- password reset/compromise response can revoke all sessions.

Security Center UI shows session approximate device/browser, created time, last activity and revoke action without exposing raw session identifiers.

## 16. CSRF, XSS, content security and third parties

Cookie-authenticated mutations use CSRF protection in addition to SameSite defense in depth. GET never changes state.

Authentication pages use strict output encoding and a restrictive CSP. Avoid third-party advertising, behavioral tracking and unnecessary scripts on registration/login/verification/reset/security-center surfaces. Sensitive tokens must not leak through referrer headers, analytics URLs, logs, screenshots or support tools.

## 17. Account lifecycle and privacy rights

Suggested lifecycle:
`PENDING_EMAIL -> ACTIVE -> SECURITY_HOLD | USER_LOCKED | SUSPENDED -> ACTIVE`
with privacy lifecycle `DELETION_PENDING -> DELETED/ANONYMIZED`.

Security hold and moderation suspension are distinct states. Neither rewrites economy/audit history.

Account deletion must remove/anonymize personal identifiers according to the documented retention basis without corrupting the append-only economy ledger or security evidence that has a valid retention need. Every retained field must have purpose, legal/product basis, retention duration and deletion/anonymization method.

User data export is authenticated, actor-scoped, rate-limited and securely delivered. Export generation must not include other users' private data, credential hashes, security secrets or internal anti-abuse rules.

## 18. Logging, monitoring and breach readiness

Never log:
- plaintext passwords or password hashes;
- verification/reset tokens;
- session cookies/raw session IDs;
- TOTP/passkey private material or recovery codes;
- OAuth access/refresh tokens;
- database passwords/keys/peppers;
- unrestricted request bodies.

Security events may include opaque user/session references, event type, result, timestamp, trace ID and bounded risk metadata. Access to those logs is restricted and retention is documented.

Alert classes:
- credential stuffing/spraying;
- unusual successful-login risk change;
- reset/verification bombing;
- mass account creation;
- session replay;
- MFA disable/recovery bursts;
- unexpected private-data reads;
- credential-table permission/grant drift.

The September 11, 2026 Korea privacy-law/safeguard changes increase the importance of demonstrable prevention governance and breach readiness; applicability of specific obligations such as certification thresholds must be reviewed against actual service scale and status rather than assumed.

## 19. Public API contract

P0 candidate endpoints:
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

MFA/passkey routes live under an explicit separate namespace. Public responses use stable domain errors and never expose database/internal exception details.

All state-changing requests define idempotency/replay behavior. Registration, verification and reset flows must be safe under duplicate requests and concurrent token consumption.

## 20. UI/UX requirements

### Registration
Show only necessary fields. Present length guidance before submit, support browser/password-manager autofill, permit paste, and use accessible inline errors. After submission, show verification state without leaking whether another account owns the email.

### Login
Email + password and existing OAuth alternatives. Generic invalid-credential error. Clear recovery path. No ads. No dark patterns. Keyboard and screen-reader complete.

### Security Center
Sections: password, MFA/passkey, linked providers, active sessions, recent security events, account export/delete. Sensitive values remain masked. Destructive actions use reauthentication and explicit confirmation.

### Error states
Define offline, maintenance, throttled, verification-expired, token-used, security-hold and recovery-unavailable states. Do not render raw backend errors.

## 21. Mandatory security tests before implementation can ship

1. Password normalization/hash/rehash and compromised-password policy tests.
2. SQL injection regression tests on every auth input and admin/private-data search field.
3. DB negative tests proving runtime role cannot directly read/write credential secrets outside approved contracts.
4. Account enumeration response/timing tests.
5. Credential stuffing, password spraying and rate-limit false-positive tests.
6. Registration/reset/verification mail-bomb controls.
7. CSRF tests on every cookie-authenticated mutation.
8. XSS/output-encoding/CSP tests on auth/security pages.
9. Session fixation, rotation, expiry, revoke-one, revoke-all and replay tests.
10. Concurrent reset/verification token single-consumption tests.
11. BOLA/IDOR tests for session/security-event/account-export endpoints.
12. Identity-link/unlink takeover tests.
13. Backup/restore permission and deletion-replay tests.
14. Logging redaction tests proving secrets never appear in logs/traces.
15. Exact-SHA end-to-end staging test: register -> verify -> login -> reauth -> password change -> reset -> revoke-all -> OAuth link/unlink -> delete/export lifecycle where enabled.

No Production rollout before all release-blocking tests pass on the isolated test stack.

## 22. Security Definition of Done

Local authentication is complete only when all are true:
- current NIST-aligned password policy with compromised-password blocklist;
- Argon2id adaptive hashing, versioning and rehash path;
- parameterized SQL/fixed reviewed DB functions everywhere;
- least-privilege private-data roles and negative permission tests;
- secure server-side rotating sessions; no localStorage auth tokens;
- CSRF/XSS/session fixation/replay defenses;
- email verification and single-use recovery;
- enumeration resistance;
- layered anti-automation with measurable false positives;
- MFA/recent reauthentication for sensitive actions;
- user session security center and revoke-all;
- operator masking and auditable exceptional private-data access;
- retention/delete/export/backup rules;
- breach/incident response hooks;
- EN/KO UI/legal/error parity;
- staging exact-SHA security QA and rollback plan.

## 23. External evidence used in v2026.09.12.31

Adopted:
- NIST SP 800-63B-4 (published 2025-08-01): 15-character minimum when passwords are used as a single factor, 64+ supported length, no arbitrary composition rules, no routine forced rotation, compromised/common-password blocklist, protected channel, salted adaptive password verifier.
- OWASP Password Storage Cheat Sheet (current 2026 retrieval): Argon2id preferred; adaptive memory-hard hashing and unique salts; work-factor upgrade path.
- OWASP Authentication and Session Management guidance (current 2026 retrieval): generic errors, secure recovery, credential-stuffing defenses, session rotation/revocation and sensitive-action reauthentication.
- OWASP Top 10:2025 / SQL Injection Prevention: injection remains a high-impact class and parameterized queries are the primary defense.
- Korea PIPC materials current as of 2026-09-12: strengthened privacy breach-prevention/remedy framework took effect 2026-09-11; actual applicability and organizational obligations require service-specific legal/compliance confirmation.

Reference-only:
- risk-based CAPTCHA/device signals. These are supplementary controls and are not trusted as authorization or SQL/input security boundaries.

## 24. Version record

### v2026.09.12.31 — implementation priority + first-party auth security consolidation
- Rebased planning against the current main planning/security baseline rather than the earlier draft branch.
- Made first-party account integrity/private-data isolation the P0 implementation priority.
- Updated password design against final NIST SP 800-63B-4 rather than older draft guidance.
- Added explicit SQL-injection release gates, least-privilege database negative tests, production-data separation and backup deletion replay.
- Added session security center, identity-link safety, recovery/email security, adaptive abuse protection and breach readiness.
- Added Korea September 11, 2026 privacy-regime review note without assuming thresholds that depend on actual service status/scale.

Documentation-only. Runtime implementation must occur in a separate development branch and pass the isolated test-server exact-SHA security gate before Production.