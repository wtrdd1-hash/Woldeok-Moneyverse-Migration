# Worklog — v2026.09.15.105 Identity privacy/auth parity audit

## Scope
Documentation-only integrated planning audit. Runtime code, APIs, database, migrations, Kubernetes/GitOps, branch protection and security implementation were not modified.

## Required sequence and evidence

1. **External research first**
   - OWASP ASVS 5.0.0 and OWASP API Security Top 10 2023 for authentication/session/BOLA/resource-consumption verification.
   - Korea PIPC current 2026 materials emphasizing accurate disclosure of processing purpose, processed items, retention and user-rights procedures.
   - Google Search Central technical/indexing/canonical guidance for private/auth pages and noindex behavior.
   - FTC 2026 negative-option/subscription enforcement only as a future real-money monetization consumer-protection reference.
2. **Repository/runtime comparison**
   - Starting `main`: `1679fe33a8b276035c4a8fc0ab8e79d42cb2f07c`.
   - Mid-run recheck: same SHA; no concurrent main change observed.
   - Production anonymous `/login` exposes Discord/Google login only.
   - Production `/guide` says users do not make a separate password and still contains the already-known unlimited profession-reward copy.
   - Production privacy notice describes OAuth identity processing but not first-party email/password credentials or verification-token processing.
   - Production public status reports web/economy API/ledger DB healthy at its latest snapshot; this is not authenticated-flow QA.
   - `main` contains `LocalAuthController`, Argon2id password policy, `/app-api/v1/auth/local/register|verify-email|login`, local-auth migrations and mobile API coverage.
3. **QA/CI evidence**
   - Branch protection still reports required-status-check enforcement off/empty.
   - Legacy combined commit status for starting SHA has no status entries.
   - A Production Release workflow for the current docs SHA completed with `test-gate` and `build` skipped. The workflow condition requires a successful `Build Test Candidate` workflow on `main` or manual dispatch. Available evidence is insufficient to claim why the upstream candidate did not satisfy the condition; therefore Production promotion success is not claimed.
4. **Contract audit**
   - Current controller `POST /auth/local/verify-email` has no `SessionGuard`/`CsrfGuard` and completes registration from the bearer verification token, matching migration 186/cross-browser documentation.
   - `docs/app-auth-api-guide.md` is stale because it still instructs the client to send the original prelogin cookie and CSRF for verify-email.

## New issues

### AUTH-105-01 — P0 — OPEN / public rollout HOLD
Local-email implementation/data processing is ahead of public privacy/login/guide disclosure. The plan now requires an explicit rollout state, updated published privacy version/consent, data-retention/deletion/recovery contract, exact-SHA test validation and security/privacy QA before general availability.

### AUTH-105-02 — P1 — TODO
Canonical app-auth integration documentation must be synchronized with the current cross-browser, one-time verification-token contract. Related mobile schema/reference docs must be consistency-tested so future clients do not depend on the obsolete cookie/CSRF requirement.

## Existing blockers

- `QA-104-01` P0 remains OPEN.
- `REL-104-02` P0 remains OPEN.
- `REL-104-03` P1 remains TODO.

## Planning decisions

- Local auth data model explicitly includes normalized email, email hash, Argon2id password verifier, display name, hashed one-time verification token, policy-consent version and authenticated session state.
- Verification token is treated as a short-lived bearer secret. Token-bearing pages must be noindex, ad-free and third-party-analytics-free until token consumption, use strict referrer policy, avoid query-string logging, and redirect to a clean URL after exchange.
- Register/login verification endpoints require abuse budgets and 429 behavior; numeric thresholds remain an operator-configured implementation value and must be captured/tested before rollout rather than invented in planning.
- Generic invalid-credential and verification failures remain required to reduce account/token enumeration.
- Local-auth account linking must never silently merge an email credential into an OAuth identity without authenticated, collision-safe linking rules.
- Auth/verify/recovery routes remain excluded from sitemap/indexing; privacy/terms remain public canonical legal content.
- Business value is indirect activation/retention and identity-provider resilience, offset by SMTP, fraud, support, security and privacy-operation costs. No fabricated ARPU uplift is claimed.

## QA acceptance added

- prelogin/policy/consent/register/verify/viewer/session/login/logout contract tests;
- same-browser and cross-browser verification; expired/reused/invalid token; token scanner/link-preview behavior;
- duplicate email and collision safety; wrong-password/account-enumeration equivalence; credential-stuffing/rate-limit behavior;
- cookie rotation/logout invalidation; CSRF on guarded mutations; verify-email intentionally unguarded except bearer token validation;
- no raw password/verifier/token/cookie/CSRF in logs/analytics/error telemetry;
- policy-version consent and local-auth privacy notice rendered before registration;
- account deletion/credential removal/pending-registration cleanup and ledger-preservation checks;
- mobile API parity and old-client compatibility;
- exact-SHA isolated-test evidence before enabling public local-auth signup.

## Integration state

Prepared v2026.09.15.105 English/Korean Living Plan updates plus English/Korean changelog/worklog. Main is rechecked again immediately before the final Git tree/ref update; the ref update is non-force and must fail rather than overwrite concurrent work.
