# Woldeok Moneyverse — Repository-Wide Security Master Plan

> Version: **v2026.09.21.324**
> Date: **2026-09-21**
> Status: planning / security verification baseline
> Canonical language: English
> Korean counterpart: [SECURITY_MASTER_PLAN.ko.md](SECURITY_MASTER_PLAN.ko.md)
> Scope: every current and planned Moneyverse feature, API, privileged workflow, data path, runtime, build pipeline and operational surface
> Runtime implementation state: **NOT implied by this document**

## 0. Purpose and decision

This specification defines the minimum security architecture, verification coverage, release gates, vulnerability handling, and incident-response expectations for Moneyverse.

The requested scale of "100 million references" must not be represented as a fabricated count of individually reviewed documents. The security program instead uses authoritative standards and large vulnerability corpora that aggregate real-world weaknesses and CVEs, then maps those controls to the repository's concrete architecture and feature set.

The baseline adopts:
- **OWASP Top 10:2025** as web-risk awareness coverage.
- **OWASP ASVS 5.0.0** as the primary application-security verification checklist.
- **OWASP API Security Top 10:2023** for object/function authorization, resource consumption, SSRF, inventory and unsafe upstream API use.
- **2025 CWE Top 25** and broader CWE/CVE mappings for weakness root-cause coverage.
- **FIRST CVSS v4.0** for technical severity communication.
- **CISA Known Exploited Vulnerabilities (KEV)** as a threat-prioritization input.
- **NIST SP 800-218 SSDF 1.1 final** as the secure-development lifecycle baseline. SSDF 1.2 Rev.1 is draft as of this plan and may inform future updates but is not treated as final normative text.
- OWASP software-supply-chain guidance and **SLSA** concepts for provenance, dependency and build integrity.

No single Top-10 list is sufficient. OWASP explicitly describes its Top 10 as an awareness starting point, so release security must use ASVS, architecture-specific threat modeling, business-logic abuse testing, dependency intelligence and operational verification together.

## 1. Security principles

1. **Deny by default.** A route, action, DB function, socket event, queue job or admin operation is unavailable unless its authorization contract is explicit.
2. **Server authority.** Client UI state never authorizes value transfer, role changes, market settlement, moderation, treasury operations, AI actions or security-sensitive changes.
3. **Least privilege.** Browser, frontend server, backend runtime, DB roles, CI identities, bot credentials and operators receive only permissions needed for their task.
4. **Defense in depth.** Validation, authorization, database invariants, rate limits, idempotency, audit and monitoring must overlap for high-value flows.
5. **Fail closed.** Security-control errors do not silently downgrade to allow.
6. **No secret in client or repository.** Tokens, signing keys, DB credentials, peppers, OAuth client secrets and webhook secrets remain outside client bundles and source history.
7. **No trust from identifiers.** User IDs, listing IDs, stock symbols, message IDs, session IDs or admin-selected resource IDs are locators, not authorization proof.
8. **Immutable financial/economy evidence.** Ledger-affecting actions create durable receipts and actor-linked audit evidence.
9. **Exact-SHA release evidence.** Security verification applies to the exact artifact promoted.
10. **Security controls are testable requirements, not prose promises.**

## 2. Required threat model

Every feature must identify:
- protected assets;
- actors and privilege levels;
- entry points;
- trust boundaries;
- data stores;
- third-party dependencies;
- abuse cases;
- confidentiality, integrity and availability impact;
- rollback/recovery behavior;
- observability signals;
- negative tests.

Threat modeling uses STRIDE-style coverage where helpful, but business-logic threats specific to a virtual economy are mandatory even when they do not fit a classic category.

### Core adversary classes

- unauthenticated internet attacker;
- authenticated malicious member;
- compromised member account;
- compromised moderator/admin account;
- bot/automation fleet;
- malicious third-party integration;
- compromised dependency/build runner;
- insider/operator mistake or abuse;
- stolen backend/internal token;
- database credential compromise;
- malicious prompt/content targeting AI-assisted workflows;
- replay/race attacker;
- denial-of-service actor.

## 3. Mandatory attack-surface inventory

The security backlog must cover all of the following.

### 3.1 Authentication, OAuth, password and sessions

Threats:
- credential stuffing/spraying;
- user enumeration;
- weak recovery;
- OAuth state/nonce mix-up;
- redirect URI abuse/open redirect;
- session fixation;
- session theft/replay;
- missing logout/revoke;
- CSRF;
- missing step-up auth;
- account-linking takeover;
- email verification/reset token replay.

Controls:
- server-side sessions in Secure/HttpOnly cookies;
- rotation on login/privilege change;
- CSRF protection for state change;
- generic public auth failures;
- layered per-account/per-IP/network throttling;
- short-lived, hashed, single-use recovery tokens;
- state/nonce/PKCE where applicable;
- strict redirect allowlists;
- recent reauthentication for credential, email, identity-link and privileged changes;
- revoke-all capability and immediate server-side invalidation;
- security-event logging without password/token leakage.

Required tests:
- stolen old cookie after rotation;
- parallel reset-token redemption;
- wrong OAuth state/nonce;
- duplicate provider linking;
- cross-origin write attempt;
- logout/revoke replay;
- rate-limit bypass via headers/casing/IP spoof fields.

## 4. Authorization and IDOR/BOLA/BFLA

Every object and function access must be authorized server-side.

High-risk objects include:
- user profiles/private fields;
- wallet/ledger records;
- bank positions/loans/bonds;
- stock orders/positions/alerts;
- business ownership;
- inventory/listings/crafting state;
- club/co-op resources;
- messages/chats;
- moderation actions;
- treasury settings;
- admin policies;
- notification settings;
- security sessions.

Controls:
- actor identity comes from trusted session context, not request body;
- resource ownership/role checks at service and DB boundary for sensitive mutations;
- no "admin=true" or role supplied by client;
- list/search endpoints apply the same authorization as detail endpoints;
- mass assignment prevented through explicit DTO allowlists;
- admin namespaces require explicit privileged guard and per-action authorization;
- destructive admin actions use step-up auth, impact preview, idempotency and immutable audit.

Negative test rule:
For every endpoint accepting a resource identifier, test "valid object belonging to another actor" and "privileged function called by lower role."

## 5. Input handling, injection and parser safety

Release-blocking classes:
- SQL injection;
- command injection;
- template injection;
- code/eval injection;
- LDAP/XPath-style injection if ever introduced;
- header injection;
- log injection;
- path traversal;
- unsafe deserialization;
- prototype pollution;
- ReDoS from attacker-controlled regex or pathological payloads.

Controls:
- parameterized SQL and reviewed fixed DB functions;
- no shell execution with untrusted interpolation;
- no runtime eval/new Function on user data;
- strict DTO schema/type/size limits;
- enum allowlists for dynamic identifiers;
- safe parsers with bounded depth/size;
- structured logging;
- canonical path resolution and storage outside executable roots.

## 6. Browser and frontend security

Threats:
- stored/reflected/DOM XSS;
- unsafe Markdown/HTML;
- CSP bypass;
- clickjacking;
- mixed content;
- cache poisoning/leaking authenticated content;
- open redirects;
- client-side secret exposure;
- DOM clobbering;
- unsafe third-party scripts.

Controls:
- escape by default;
- sanitize any intentionally rendered HTML with allowlist policy;
- avoid `dangerouslySetInnerHTML` unless reviewed and tested;
- strict Content Security Policy with minimal script origins and nonces/hashes where needed;
- frame-ancestors / anti-clickjacking policy;
- Referrer-Policy, nosniff and appropriate permissions policy;
- authenticated/member pages no shared caching;
- public cache keys must not vary incorrectly on attacker-controlled headers;
- redirects use fixed/validated local destinations;
- never expose `INTERNAL_API_TOKEN`, secrets or server-only modules to client bundles.

Required automated checks:
- XSS payload corpus against board/chat/profile/stock-discussion/notification text;
- build-time client-bundle secret scan;
- cache-control tests on private pages;
- security-header regressions.

## 7. API security

Apply OWASP API Top 10 coverage to all REST/server-action/BFF interfaces.

Mandatory:
- BOLA and BFLA negative tests;
- request and response property allowlists;
- pagination and upper bounds;
- body-size limits;
- expensive-operation quotas;
- consistent auth on every method;
- SSRF defenses for any URL-fetch function;
- explicit API inventory and deprecation;
- safe upstream API parsing and timeout/retry policy;
- no trust in upstream content merely because TLS succeeded.

Resource-consumption controls cover:
- login;
- search;
- board/chat;
- stock queries;
- AI generation;
- exports;
- uploads;
- image/media processing;
- notification fan-out;
- WebSocket subscriptions;
- admin reports.

## 8. SSRF and outbound network safety

Any feature that fetches a URL, webhook, image, feed, OAuth metadata or AI tool result must:
- allowlist expected schemes;
- reject localhost, link-local, RFC1918/private ranges, metadata endpoints and internal service names unless explicitly required;
- resolve DNS safely and re-check destination after redirects;
- set short connect/read timeouts;
- cap response bytes;
- restrict redirect count;
- avoid forwarding internal auth headers;
- log destination class and policy decision without sensitive URL tokens.

## 9. Database and PostgreSQL security boundary

The database remains a primary authority for high-value mutations.

Requirements:
- restricted runtime roles;
- no broad direct table writes for economy/security-sensitive tables;
- actor-scoped `SECURITY DEFINER` functions where appropriate;
- safe explicit `search_path`;
- internal actor validation;
- no dynamic SQL from client-controlled identifiers;
- migration checksums remain immutable after application;
- grants reviewed as security changes;
- private credential/session tables inaccessible to ordinary read paths;
- backups preserve grants and security state.

Database negative tests:
- direct table mutation denied;
- cross-user function call denied;
- missing/forged actor denied;
- replayed idempotency key safe;
- race/concurrency maintains ledger invariants;
- malformed numeric values cannot overflow/round silently.

## 10. Economy, wallet and ledger abuse

Security is not limited to classic code vulnerabilities. Business-logic abuse is a P0 integrity risk.

Threats:
- duplicate rewards;
- race-condition double spend;
- replay;
- negative or overflow amounts;
- rounding arbitrage;
- self-transfer abuse;
- faucet/sink bypass;
- stale-price settlement;
- rollback inconsistency;
- unauthorized admin balance edits.

Controls:
- integer-string / exact numeric contracts;
- atomic DB transactions;
- idempotency keys;
- invariant checks at authoritative layer;
- ledger receipt per value mutation;
- no client-computed final amount;
- bounded issuance and anomaly detection;
- admin mutations require reason, actor, before/after, step-up auth and append-only audit.

## 11. Stocks and market integrity

Threats:
- unauthorized portfolio/order access;
- stale quote exploitation;
- manipulation through admin or automation;
- malformed price/quantity;
- price-alert abuse;
- discussion spam/XSS;
- race during suspension/delisting;
- hidden order replay.

Controls:
- server authoritative market state;
- atomic order/settlement lifecycle;
- explicit trading-state checks;
- deterministic suspension/delisting settlement rule;
- immutable market/admin action audit;
- limits on order/alert creation;
- strong validation of symbol, price and quantity;
- discussion content follows community security controls.

## 12. Banking, loans and bonds

Threats:
- interest duplication;
- backdated accrual;
- loan state manipulation;
- repayment replay;
- negative principal;
- unauthorized account visibility.

Controls:
- one authoritative accrual formula;
- atomic settlement timestamps;
- replay-safe repayment;
- state-transition validation;
- no client-authored credit grade/interest rate;
- private financial-learning data authorization and audit.

## 13. Shop, inventory, crafting and marketplace

Threats:
- item duplication;
- escrow bypass;
- price tampering;
- seller/buyer authorization failures;
- cancellation/purchase race;
- forged inventory quantity;
- fee bypass.

Controls:
- atomic inventory + ledger mutations;
- server-side price/fee computation;
- escrow ownership invariants;
- unique transaction/idempotency keys;
- concurrency tests for purchase/cancel;
- no trusting client item metadata.

## 14. Businesses, clubs, co-op and personal spaces

Controls:
- role/ownership authorization for every mutation;
- invitation token entropy and expiry;
- membership transition state machine;
- prevention of self-escalation;
- bounded shared-resource actions;
- append-only logs for ownership/treasury/policy changes.

## 15. Community boards, messages and 1:1 chat

Threats:
- stored XSS;
- markdown link abuse;
- spam/flood;
- IDOR on private messages;
- enumeration of conversation IDs;
- attachment malware;
- notification abuse;
- WebSocket room hijacking;
- deleted-content leakage.

Controls:
- strict output encoding/sanitization;
- URL scheme allowlists;
- per-user/per-conversation rate limits;
- participant authorization on every read/write;
- opaque IDs where feasible;
- moderation/audit path;
- attachment scan/quarantine if uploads are supported;
- socket handshake auth plus per-event room authorization;
- session revocation invalidates real-time access.

## 16. Uploads, images and files

Requirements:
- allowlist MIME + extension + magic-byte validation;
- random server-generated storage names;
- size and image dimension/decompression limits;
- no user path components;
- store outside executable/static roots unless transformed safely;
- malware scanning/quarantine for general attachments;
- metadata stripping where privacy requires;
- signed/time-limited private download authorization;
- Content-Disposition safety;
- reject polyglot and archive bombs where relevant.

## 17. Admin control center and treasury

Admin and treasury actions are highest-risk.

Mandatory controls:
- separate privileged authorization check on every operation;
- recent reauthentication/step-up;
- optional second-factor/passkey policy based on current project auth decision;
- no permanent privilege inferred from frontend route access;
- impact preview for destructive/bulk actions;
- four-eyes approval for exceptionally dangerous operations where operationally feasible;
- idempotency;
- actor/reason/ticket metadata;
- before/after values;
- append-only audit;
- immediate privilege/session revocation capability;
- emergency break-glass account/process documented and tightly audited;
- treasury cannot bypass ledger or DB invariants.

No admin UI may display password hashes, reset tokens, MFA secrets, raw session cookies or backend secrets.

## 18. AI and automation security

AI-assisted stock news, tuning, support, moderation or future agents introduce new trust boundaries.

Threats:
- prompt injection;
- indirect prompt injection from user/community/web content;
- data exfiltration;
- tool/command abuse;
- unauthorized policy mutation;
- poisoned retrieved context;
- unsafe generated SQL/code;
- hallucinated administrative action;
- cost/resource exhaustion.

Controls:
- model output is untrusted data;
- AI cannot directly become an authorization oracle;
- privileged tool calls require server policy checks independent of model text;
- strict tool allowlists and typed arguments;
- sensitive actions require deterministic validation and, where high impact, human confirmation;
- never place secrets in model prompts unnecessarily;
- retrieved content labeled/untrusted;
- output encoding/sanitization;
- budget/rate limits;
- immutable audit of model/tool/action chain sufficient for incident review;
- no generated SQL executed without fixed safe interface.

## 19. Mobile / Android application

Threats:
- embedded secrets;
- insecure WebView bridges;
- deep-link hijacking;
- token leakage to logs/backups;
- exported components;
- unsafe local storage;
- TLS downgrade.

Controls:
- no `INTERNAL_API_TOKEN` or server secret in APK;
- use public BFF/gateway contracts;
- Android Keystore-backed sensitive credential storage where native credentials exist;
- validate app/deep links;
- minimize exported activities/services/providers;
- WebView JavaScript bridges disabled unless necessary and tightly scoped;
- no auth tokens in URLs;
- clear sensitive logs;
- TLS validation uses platform-safe defaults; certificate pinning only with a documented rotation/recovery strategy.

## 20. WebSocket / real-time security

- authenticate handshake;
- authorize every subscription/room join;
- re-check revoked sessions;
- message size and frequency limits;
- schema validation;
- origin policy;
- no trusting client event names/payload actor IDs;
- backpressure and connection caps;
- safe reconnect/replay semantics.

## 21. Secrets and key management

- central inventory of secrets and owners;
- secret manager/CI secret storage;
- no long-lived personal tokens for automation when scoped workload identity is possible;
- rotation procedure and expiry;
- separate Test/Production credentials;
- least privilege;
- repository history/CI log scanning;
- redact secrets from exception and structured logs;
- webhook signing keys and internal API tokens treated as high impact;
- compromise drill includes rotation and downstream session/token invalidation.

## 22. Dependency and software-supply-chain security

Mandatory controls:
- lockfiles committed and reviewed;
- dependency updates from trusted registries only;
- automated vulnerability scanning on direct and transitive dependencies;
- KEV matches receive emergency prioritization;
- SBOM generated for release artifacts;
- build provenance/attestation target based on SLSA concepts;
- GitHub Actions pinned to immutable commit SHAs for high-trust workflows where feasible;
- minimal workflow permissions;
- no untrusted PR code receives production secrets;
- protected release workflows;
- package provenance/signature verification where ecosystem support is reliable;
- dependency confusion controls for internal package names;
- secret scanning and code scanning;
- container image scanning;
- base images pinned/rebuilt regularly.

## 23. CI/CD and GitHub security

- default workflow token read-only unless job needs more;
- environment protections for Production;
- exact-SHA artifact promotion;
- Test and Production credentials separated;
- artifact digest recorded;
- branch/ruleset requirements cannot be bypassed by routine release;
- workflow changes require security review;
- no `pull_request_target` pattern that executes untrusted checkout with secrets;
- release logs must prove tests and artifact identity.

## 24. Container, Kubernetes, edge and host security

- non-root where possible;
- read-only root filesystem;
- drop Linux capabilities;
- `no-new-privileges`;
- seccomp/AppArmor/SELinux/NixOS hardening where supported;
- network policies/minimal service exposure;
- backend/internal API not exposed as public general origin;
- strict Host handling;
- TLS modern configuration;
- ingress/body/time limits;
- health endpoints reveal minimum information;
- Kubernetes RBAC least privilege;
- namespace/service-account separation;
- no secret values in manifests committed to Git;
- regular node/runtime patching;
- backup channel separated from primary compromise domain.

## 25. Logging, monitoring and alerting

Security events should include:
- auth success/failure/rate-limit;
- password/email/MFA/passkey changes;
- session revocation;
- privilege changes;
- admin/treasury actions;
- permission denials;
- suspicious economy/market behavior;
- dependency/secret scan findings;
- WAF/edge abuse signals where available.

Logs must not contain passwords, full reset tokens, raw cookies, authorization headers, secret keys, sensitive private message bodies by default, or unnecessary personal data.

Alert rules require owner, threshold, escalation, expected false-positive behavior and runbook.

## 26. Availability and denial-of-service

Every public or expensive endpoint requires:
- bounded request size;
- bounded execution time;
- rate/concurrency controls;
- pagination;
- database statement timeout where suitable;
- queue/backpressure strategy;
- cache strategy that cannot leak private data;
- circuit-breaker/timeouts for upstreams;
- graceful exceptional-condition handling.

OWASP Top 10:2025 A10 exceptional-condition handling is explicitly included: exception paths must not bypass authorization, commit partial value transfers, leak internals or leave inconsistent state.

## 27. Privacy and data protection

- collect minimum data;
- field-level data inventory;
- purpose and retention;
- access logging for sensitive admin unmasking;
- deletion/export runbooks;
- no production data copied into dev/test by default;
- analytics events avoid secrets and unnecessary identifiers;
- exact location, credentials, financial identifiers and sensitive private data require explicit justification;
- backups participate in deletion/replay policy.

## 28. Vulnerability discovery and validation program

Use complementary techniques:

1. **SAST** for injection, unsafe APIs, auth patterns and secret-like code.
2. **SCA** for dependency CVEs/licenses/provenance.
3. **Secret scanning** for repository and CI exposure.
4. **DAST** against isolated Test for HTTP/API issues.
5. **IAST/fuzzing/property tests** where valuable.
6. **Database negative tests** for grants/functions/invariants.
7. **Manual abuse-case review** for economy/admin/market/business logic.
8. **Authenticated API authorization matrix tests**.
9. **Concurrency/race tests** for value transfer.
10. **Container/image/IaC scanning**.
11. **SBOM and release artifact verification**.
12. **External penetration testing** before major high-risk releases and periodically thereafter, subject to authorization and scope.

Automated tools do not prove absence of vulnerabilities. Findings require validation and false positives must be documented, not silently ignored.

## 29. Severity and remediation policy

Use CVSS v4.0 as a technical input, then raise priority based on Moneyverse-specific context.

### P0 / Critical
Examples:
- auth bypass;
- admin/treasury privilege escalation;
- remote code execution;
- SQL injection with material DB access;
- secret allowing production control;
- cross-user wallet theft/double-spend;
- KEV-applicable exploitable dependency on exposed surface;
- unrestricted production DB write.

Action:
- block release;
- contain immediately;
- rotate/revoke as needed;
- emergency patch process;
- incident review if exposure may have occurred.

### P1 / High
Examples:
- stored XSS affecting privileged users;
- BOLA exposing private member data;
- SSRF reaching internal services;
- significant session/recovery weakness;
- marketplace/economy exploit with bounded but material value impact.

Action:
- block affected feature promotion;
- prioritized fix with regression tests and evidence.

### P2 / Medium
Examples:
- lower-impact information disclosure;
- bounded abuse requiring substantial prerequisites;
- missing defense-in-depth control without known direct exploit.

### P3 / Low
Hardening and hygiene items with limited exploitability/impact.

**KEV presence, public exploit availability, internet exposure, privilege required, blast radius, data sensitivity, exploit automation and recovery difficulty override raw CVSS ordering when necessary.**

## 30. Release gates

No security-sensitive change reaches Production until:

1. threat model/abuse cases updated;
2. ASVS/API requirements identified;
3. code review complete;
4. unit/integration/negative tests pass;
5. dependency/secret/SAST gates pass;
6. DB security/invariant tests pass if relevant;
7. isolated exact-SHA Test deployment completed;
8. backend/API/DB and real user-flow validation completed;
9. security regression smoke passes;
10. artifact digest/SHA recorded;
11. rollback target verified;
12. Production promotion uses zero-downtime process where supported;
13. post-promotion auth/session/API/ledger/admin smoke passes;
14. monitoring shows no new critical security signal.

Documentation-only changes do not pretend these runtime gates have passed.

## 31. Security definition of done for every feature

A feature is not security-complete until:
- assets and abuse cases documented;
- authentication requirement explicit;
- authorization matrix explicit;
- input/output schema bounded;
- rate/resource limits defined;
- idempotency/race behavior defined if mutating value/state;
- audit events defined;
- privacy classification defined;
- dependency/external-service trust defined;
- negative tests exist;
- incident/rollback behavior exists;
- Test validation evidence attached.

## 32. Priority implementation backlog

### P0
1. Build automated endpoint authorization matrix and cross-user negative tests.
2. Expand repository-wide ASVS 5.0 mapping.
3. Add/verify SAST, SCA, secret, container and IaC security gates.
4. Generate SBOM for frontend/backend/release images.
5. Verify every `SECURITY DEFINER` function, grant and `search_path`.
6. Concurrency/idempotency tests for all ledger/value-changing flows.
7. Admin/treasury step-up + audit + DB actor-check verification.
8. Session revoke/replay and CSRF test suite.
9. Upload/content/Markdown/XSS security suite.
10. SSRF inventory and outbound network policy.
11. AI tool boundary and prompt-injection abuse tests.
12. WebSocket room/event authorization tests.
13. KEV-aware dependency emergency process.
14. Production incident-response and credential-rotation drill.

### P1
1. CSP tightening and third-party script inventory.
2. Formal data-retention/access matrix.
3. Fuzzing/property-based tests for parsers and numeric/state transitions.
4. External penetration test of authenticated economy/admin surfaces.
5. Supply-chain provenance/attestation maturation.

### P2
1. Security maturity assessment with OWASP SAMM/DevSecOps maturity model.
2. Continuous attack-surface inventory drift detection.
3. Periodic tabletop incidents for account takeover, secret leak, dependency compromise and DB breach.

## 33. Required security test matrix by feature family

| Feature family | Mandatory security focus |
|---|---|
| Login/OAuth/account | enumeration, CSRF, rotation, replay, recovery, link/unlink |
| Wallet/transfers | BOLA, double-spend, idempotency, integer overflow, audit |
| Bank/loans/bonds | state transition, replay, accrual race, privacy |
| Stocks | order auth, price/quantity validation, suspension races, market-admin audit |
| Shop/inventory | tampering, duplication, concurrency |
| Marketplace/crafting | escrow, price/fee authority, purchase/cancel race |
| Businesses/clubs | ownership/role escalation, shared treasury |
| Casino | server-authoritative result, replay, limits, RNG receipt integrity |
| Board/gallery | stored XSS, URL/media validation, moderation abuse |
| 1:1 chat/messages | participant BOLA, socket auth, spam, attachment safety |
| Notifications | preference auth, fan-out abuse, URL injection |
| Admin | BFLA, step-up, reason/audit, mass-action safety |
| Treasury | strongest auth, ledger invariant, dual control where feasible |
| AI automation | prompt injection, tool allowlist, data exfiltration, budget |
| Mobile app | secret absence, token storage, deep links, WebView |
| Backup/restore | confidentiality, immutability, restore auth/grants, ransomware separation |

## 34. Reference baseline

Primary normative/reference families:
- OWASP Top 10:2025.
- OWASP ASVS 5.0.0.
- OWASP API Security Top 10:2023.
- OWASP Cheat Sheet Series, especially authentication, session, CSRF, XSS, SQL injection, SSRF, file upload, logging, secrets and software supply chain topics.
- NIST SP 800-218 SSDF 1.1 final; track Rev.1/SSDF 1.2 draft separately until final.
- CWE Top 25 2025 and full CWE taxonomy.
- FIRST CVSS v4.0.
- CISA KEV.
- SLSA current specification.
- Platform/vendor security guidance for Node.js, Next.js, NestJS, PostgreSQL, Kubernetes, GitHub Actions and Android as versions evolve.

## 35. Version history

### v2026.09.21.324 — 2026-09-21
- Created repository-wide security master plan.
- Expanded beyond authentication into all feature families and operational surfaces.
- Added vulnerability discovery, severity, remediation and release gates.
- Added economy/business-logic, admin/treasury, AI, real-time, mobile, supply-chain and incident-response coverage.
- Defined security Definition of Done and P0/P1/P2 implementation backlog.
