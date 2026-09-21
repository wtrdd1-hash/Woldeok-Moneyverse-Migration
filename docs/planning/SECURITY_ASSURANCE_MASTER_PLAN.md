# Security Assurance Master Plan

> Version: **v2026.09.21.324**
> Status: Living defensive-security planning specification
> Korean counterpart: [SECURITY_ASSURANCE_MASTER_PLAN.ko.md](SECURITY_ASSURANCE_MASTER_PLAN.ko.md)

This document is the defensive security baseline for all Moneyverse web, API, mobile, admin, economy, social, AI, infrastructure and release workflows. It does not authorize destructive testing against third-party systems or Production.

## Evidence model
Security research must be traceable, not inflated by unverifiable reference counts. The baseline uses OWASP ASVS 5.0.0, OWASP Top 10, OWASP API Security Top 10:2023, MITRE CWE/2025 CWE Top 25, NIST SP 800-218 SSDF, NIST SP 800-63B-4, CISA Secure-by-Design, CVE/CISA KEV and vendor advisories. The 2025 CWE Top 25 itself was derived from 39,080 CVE records. Where possible, every control and finding should map to ASVS/CWE/OWASP identifiers.

## Mandatory threat model
For every route, API, background job, webhook and administrator action record: subject, resource, action, trust boundary, authentication, authorization, input schema, output data class, rate/resource budget, idempotency, DB authority, audit event, dependency, abuse case, rollback and test evidence.

Required threat classes: spoofing, tampering, repudiation, information disclosure, denial of service, elevation of privilege, BOLA/IDOR, mass assignment, injection, CSRF, SSRF, replay, race conditions, duplicate value creation, workflow bypass, unsafe file handling, unsafe third-party data, supply-chain risk and AI/tool privilege expansion.

## Cross-cutting controls
- **Authentication/session:** HttpOnly/Secure/SameSite cookies, session rotation after login/privilege changes, server-side revocation, idle+absolute expiry, recent-auth/step-up for high-risk actions, enumeration resistance and credential-stuffing throttling/alerts.
- **Authorization:** deny-by-default, server-side subject-resource-action checks, independent admin authorization, DTO/property allowlists and cross-account negative tests for all user-owned resources.
- **Injection/input:** strict bounded schemas, parameterized DB access, no user-controlled shell command construction, contextual output encoding, raw HTML denied by default, bounded deserialization and constrained file/path/URL/redirect handling.
- **Browser/API:** CSRF on state-changing cookie-authenticated requests, explicit CORS allowlists, CSP/frame/MIME/HSTS hardening, API inventory/version ownership and noindex/no-store where applicable.
- **Secrets/crypto:** approved secret stores, rotation procedures, no secrets in Git/logs/screenshots/client bundles, adaptive password hashing, platform CSPRNG and no custom cryptographic protocols.
- **Availability/abuse:** operation-specific rate limits, bounded pagination/query complexity, concurrency/cost budgets for search/AI/uploads/messages/exports and fail-closed high-impact workflows.
- **Logging/privacy:** structured security events, redaction of tokens/cookies/passwords/DM bodies/payment data, tamper-evident audit for privileged/value-moving actions and alerts for repeated authz failures/credential abuse/privilege changes.

## Feature security matrix
| Feature family | Primary risks | Required defenses / release evidence |
|---|---|---|
| Account/OAuth/security center | takeover, fixation, redirect/state confusion, recovery abuse | strict redirect allowlist, state/nonce/PKCE where applicable, re-auth for linking/unlinking, session inventory/revocation, fixation/replay/enumeration tests |
| Wallet/transfers/rewards/treasury | duplicate credit, forged actor, replay, races | server-authoritative balance, DB transaction/constraints, actor-checking DB functions, idempotency, immutable ledger, reconciliation, concurrency tests |
| Stocks/market admin | order/price/settlement manipulation, halt bypass | server state machine, transactional/idempotent settlement, immutable evidence, scoped admin auth, halt/race/stale-state tests |
| Banking/credit | unauthorized debt mutation, precision abuse, leakage | atomic ledger/debt writes, decimal policy, server eligibility, least-data responses, cross-user and precision tests |
| Casino/game economy | predictable/forged outcome, replay, value duplication | server-generated outcome, CSPRNG where required, immutable play ID, transaction settlement, wager bounds, replay/concurrency tests |
| Jobs/quests/businesses | forged completion, duplicate rewards, scheduler overlap | server-verifiable completion, DB reward bounds, idempotency, scheduler locks, allowlisted policy knobs, overlap tests |
| Chat/DM/social | sender spoofing, conversation BOLA, block bypass, leakage | canonical membership, server-owned sender identity, block/mute, bounded payloads, privacy-safe notifications, forged-ID/reconnect/replay tests |
| Boards/comments/uploads/search | XSS, unsafe upload, traversal, search DoS | safe rendering, type/size validation, generated storage keys, authorization on attachments, search budgets, dangerous-markup/file tests |
| Admin console | function-level auth failure, CSRF, overexposure | endpoint-level auth, step-up for dangerous actions, CSRF, minimal read models, immutable audit, ordinary-user negative matrix |
| APIs/webhooks/third parties | BOLA, unsafe consumed data, SSRF, forged webhooks | strict schemas, object/function auth, outbound URL policy, webhook signature/timestamp/replay defense, timeout/circuit breaker tests |
| AI/agents/automation | prompt injection across privilege boundary, tool misuse, secret leakage | model output treated as untrusted, capability allowlists, deterministic policy gates, shadow before write, sensitive prompt redaction, fail-closed/tool-boundary tests |
| Billing/subscriptions | webhook spoofing, duplicate entitlement/refund | signed events, idempotency, server price/SKU authority, transactional entitlement, duplicate/out-of-order tests |
| Mobile/external app | embedded secrets, deep-link/token abuse | no privileged static secret, PKCE where applicable, verified links, secure OS storage, scoped/revocable tokens, same server authz as web |
| Infrastructure/DB/CI/CD/backup | exposed services, excessive privilege, supply-chain compromise, unsafe deployment | segmentation, least privilege, hardened containers, restricted DB grants, lockfiles/SBOM/secret scanning, protected branches, isolated Test, encrypted/off-host backups, restore drills, exact-SHA promotion |

## Automated assurance pipeline
Each implementation branch runs the applicable controls:
1. typecheck/lint plus security-focused static analysis;
2. dependency/SCA and lockfile review;
3. secret scanning;
4. IaC/container/configuration policy checks;
5. validation/authz/idempotency unit tests;
6. real-DB integration tests for transaction/concurrency behavior;
7. authenticated API authorization-matrix tests;
8. non-destructive DAST against isolated Test;
9. parser/upload/input fuzz or property tests in isolated environments;
10. SBOM and release evidence;
11. exact-SHA Test smoke/security regression;
12. Production only after blocking findings are closed or formally risk-accepted by authorized ownership with compensating controls.

Production is not the primary vulnerability-discovery target.

## Severity / release gates
- **P0 Critical:** unauthorized admin/value mutation, credential/secret compromise, arbitrary code/command execution, large-scale private-data breach, destructive integrity failure or known active exploitation path. Block release and contain affected capability.
- **P1 High:** reliable BOLA/IDOR, serious auth/session bypass, high-impact stored XSS, impactful webhook forgery, value-duplication race/replay, unsafe SSRF or critical dependency exposure. Block Production until remediated or explicitly accepted by authorized ownership.
- **P2 Medium:** meaningful but constrained weakness; owner, due date and regression test required.
- **P3 Low:** hardening item with limited direct impact; normal backlog.

CVSS can supplement but never replace product context, exploitability, exposure, data sensitivity and economic impact.

## Remediation lifecycle
Detect -> safely validate -> map to CWE/ASVS/API category -> identify affected versions/routes/data -> contain -> patch in isolated branch -> add regression test -> exact-SHA Test -> zero-downtime Production -> post-release monitoring -> root-cause review.

## Acceptance checklist for every feature
A feature is not security-complete until applicable evidence exists for authentication/session, subject-resource-action authorization, input/output schema and data classification, CSRF/CORS, idempotency/concurrency/value integrity, abuse/resource controls, privacy-safe logging/audit, dependency/secret scans, cross-account negative tests, rollback/disable path and exact-SHA Test.

## Execution order
- **v2026.09.21.324-01:** inventory all routes/APIs/jobs/webhooks/admin actions and trust boundaries.
- **-02:** map each item to ASVS/CWE/OWASP API plus business-logic abuse cases.
- **-03:** implement missing P0/P1 controls on isolated code branches.
- **-04:** add automated authz/idempotency/concurrency/SCA/secret/IaC/DAST gates.
- **-05:** run authenticated exact-SHA Test, including real-DB mutation paths.
- **-06:** re-read the latest living plan mid-work and reconcile new scope.
- **-07:** merge only passing candidate, rebuild exact merged SHA and promote Test -> Production with zero downtime.
- **-08:** post-promotion security/health/session checks and evidence update.

## Current state
v2026.09.21.324 is planning/documentation only. It does not claim that all controls are already implemented, that Production was penetration-tested, or that 100,000,000 individual references were manually reviewed.

## Update history
### v2026.09.21.324 — 2026-09-21
- Added the full-feature defensive security assurance plan, authoritative evidence strategy, feature threat matrix, automated gates, severity policy and exact-SHA release requirements.
