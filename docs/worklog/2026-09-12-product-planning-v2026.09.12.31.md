# Product Planning Worklog — v2026.09.12.31

## Scope

Prioritize unfinished Moneyverse work and define production-grade first-party registration/login security for a real public service.

## Repository baseline reviewed

- latest `main` at start: `1b430f540d978751e67f1417ae5747e048f8bd74`;
- Living Project Plan;
- Product Growth Plan;
- Detailed Product Design Specification;
- Season System Specification;
- existing authentication backend structure (`backend/src/auth`), secure-cookie/session/TOTP foundations;
- current privacy/monetization/search planning.

During the work, `main` advanced first to `381a26a097dc3c5970a94ad43603f9653613684b` and at final recheck to `0ed6693665b8313136e3c39d0081e841db4387a5`. The concurrent changes were documentation/integration work outside this authentication specification. The comparison at final recheck showed this branch 8 commits ahead and 13 commits behind `main`; no automatic merge is performed. The branch must be synchronized with the latest main and any INDEX overlap reconciled before merge.

## Runtime verification

- `https://easy-scraping.com` returned HTTP/fetch status 530 through the available external check.
- the test endpoint could not be independently verified through the available web path.
- Runtime Product Reality Audit for authentication therefore remains **runtime verification unavailable**; no healthy runtime state was assumed.

## External research checked

### Adopted
- NIST SP 800-63B-4, final publication 2025-08-01: password length, compromised-password blocklist, no arbitrary composition rules, no routine periodic rotation, secure verifier/storage guidance.
- OWASP Password Storage Cheat Sheet, current retrieval: Argon2id, salts, work-factor evolution and secret separation.
- OWASP Authentication and Session Management Cheat Sheets, current retrieval: generic errors, recovery, reauthentication, session lifecycle and credential-stuffing controls.
- OWASP Top 10:2025 A05 Injection and SQL Injection Prevention: parameterized queries and constant query structure.
- Korea PIPC current materials: strengthened breach-prevention/remedy legal and safeguard changes effective 2026-09-11; service-specific applicability must be reviewed rather than guessed.

### Reference-only
- CAPTCHA/device-risk scoring: optional adaptive controls only, never trusted as authorization, privacy or database security boundaries.

## Product/security decisions

1. P0 is account security/private-data integrity, not monetization or additional gameplay.
2. First-party email/password is implemented as `local_email` within the existing identity/session model.
3. Single-factor password baseline is 15+ characters; 64+ accepted; no silent truncation or composition-rule dependence.
4. Argon2id is preferred with production-class benchmarked parameters and rehash support.
5. SQL injection is a release blocker. Auth/admin inputs require parameterized DB contracts and negative/injection tests.
6. Production private data is not copied into Test/development by default.
7. Account recovery, revoke-all, MFA/reauthentication, privacy deletion/export and backup deletion replay are part of completion, not optional later polish.
8. Security throttles are explicitly protective exceptions to the unlimited-default gameplay policy and require false-positive metrics.

## Files added/changed

- `docs/planning/AUTHENTICATION_SECURITY_PRIORITY_SPEC.md`
- `docs/planning/AUTHENTICATION_SECURITY_PRIORITY_SPEC.ko.md`
- `docs/changelog/2026-09-12-auth-security-priority-v2026.09.12.31.md`
- `docs/changelog/2026-09-12-auth-security-priority-v2026.09.12.31.ko.md`
- this worklog and Korean counterpart
- documentation index entries

## Deployment/testing

Documentation-only. No runtime Test/Production deployment is performed in this planning pass. Any implementation must use a separate development branch, migrate schema only through new migrations, execute auth/SQLi/BOLA/session/privacy negative tests, deploy exact SHA to the isolated Test stack, and only then consider Production.

## Next priority

1. Synchronize this planning branch with current main and reconcile documentation INDEX edits before merge.
2. Implement DB schema/functions and local credential repository behind least-privilege roles.
3. Implement registration/email verification/login/recovery with Argon2id and generic public errors.
4. Add session security center/revoke-all and ordinary-user TOTP.
5. Add attack telemetry/rate policies and redaction tests.
6. Run full staging security QA and runtime UI audit before enabling public local authentication.