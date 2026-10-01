# Moneyverse App/Site/Economy Core Security Research Review — v2026.10.01.497

> Status: research evidence for written architecture; not runtime proof.
> Base design: v2026.10.01.496.
> Latest checked main: `2bad12eb290cba6b98d08604cd6b1274243e1a4f`.

## 1. Research scope

This review validates the security boundary for:
- separate App Core and Site Core BFFs;
- one authoritative Economy Core and one financial database authority;
- workload/service identity between cores;
- mobile request integrity and replay resistance;
- web session/CSRF isolation;
- PostgreSQL privilege containment;
- AI/model isolation from economic mutation authority;
- bounded numeric AI policy changes.

## 2. Large discovery corpus

The preceding research pass collected Crossref metadata in twelve topic families with 12,000 raw records per family:

1. API/BFF architecture;
2. distributed financial core / ledger / transaction consistency;
3. macroeconomics / fiscal policy / taxation;
4. banking / credit / monetary policy;
5. virtual and game economies;
6. AI economic policy / RL / agents;
7. safe RL / constrained and robust control;
8. causal inference / policy evaluation;
9. market integrity / algorithmic pricing;
10. labour / firms / supply;
11. fraud / Sybil / bot / abuse detection;
12. API security / service identity.

The first ten families produced 120,000 raw records and 95,939 internal unique records. The two security supplements produced 24,000 raw and 23,963 internal unique records. Deduplicating both new sets together by DOI first and normalized title second produced **118,490 new unique records**.

After merging with the existing Moneyverse economy corpus (31,289 rows) and AI economy corpus (11,749 rows) under the same DOI/title identity rule, the discovery index contained **149,691 unique candidate records**.

A conservative title-keyword screen matched 25,765 records to at least one direct design topic. The 149,691 number is therefore a discovery corpus, not a statement that every item was read in full or is equally relevant.

Collection artifact SHA-256 values:
- first-ten-family CSV: `8c50997148e8ebd41b639cd8e945d8bf59ce27f9fcffe125b61d592e9e00effb`;
- security supplement CSV: `86e1dab826080f35b722a9a780e7fdb78f015f0eec93ed376893c07b3177c57b`;
- merged unique working CSV: `ee863813347fbd607690e091a7bfb8c0150ead4cbecbdef6cb31ba7314aed89f`.

## 3. Primary/current architecture evidence

### 3.1 Backend-for-frontend separation

Microsoft Azure Architecture Center, “Backends for Frontends Pattern”:
https://learn.microsoft.com/azure/architecture/patterns/backends-for-frontends

It recommends a backend layer per frontend interface when mobile and web have materially different needs.

AWS Prescriptive Guidance, “API integration – Backend for frontend”:
https://docs.aws.amazon.com/prescriptive-guidance/latest/micro-frontends-aws/api-integration-data-fetching.html

AWS describes BFF as an API layer for authorization, aggregation and transformation rather than the owner of the domain model.

**Moneyverse implication:** App Core and Site Core are channel adapters/BFFs. Economy rules, balances, tax, lending, treasury and market settlement do not live independently in either BFF.

### 3.2 Zero-trust and workload identity

NIST SP 800-207:
https://csrc.nist.gov/pubs/sp/800/207/final

NIST SP 800-207A:
https://csrc.nist.gov/pubs/sp/800/207/a/final

These sources reject implicit trust based on network location and emphasize resource, user and service identity.

RFC 8705:
https://www.rfc-editor.org/rfc/rfc8705.html

RFC 9449:
https://www.rfc-editor.org/info/rfc9449/

These provide proof-of-possession patterns that reduce the value of stolen bearer credentials.

**Moneyverse implication:** App Core and Site Core must not share one long-lived super-token that implicitly grants all internal authority. Workload identities are distinct by caller, audience, environment and scope. Where the physical deployment is split, mutual TLS or another proof-of-possession binding is preferred for the highest-value internal path.

### 3.3 OAuth and native-app login

RFC 9700, OAuth 2.0 Security Best Current Practice:
https://www.rfc-editor.org/rfc/rfc9700.html

Relevant properties include exact redirect URI comparison, PKCE for public clients, defense against authorization-code injection and removal of insecure redirect behavior.

**Moneyverse implication:** mobile browser handoff remains one-time and server-authoritative; future native OAuth modernization uses exact registered redirects and PKCE rather than embedding a confidential client secret in the APK.

### 3.4 API attack surface

OWASP API Security Top 10 2023:
https://api-security.owasp.org/editions/2023/en/0x11-t10/

The directly relevant risks include BOLA, broken authentication, property-level authorization, unrestricted resource consumption, broken function authorization, sensitive-business-flow abuse, inventory drift and unsafe upstream API consumption.

**Moneyverse implication:** generated method/path/scope inventory is part of the security boundary. A broad wildcard proxy is not itself authorization. Every economic mutation needs endpoint, actor, object and function authorization plus resource limits and replay protection.

### 3.5 Mobile security and request integrity

OWASP MASVS:
https://mas.owasp.org/MASVS/

Google Play Integrity standard requests:
https://developer.android.com/google/play/integrity/standard

Play Integrity supports request content binding with `requestHash`; standard requests also include automatic replay mitigation.

**Moneyverse implication:** device/app integrity is an additional high-value-action signal, never the sole user identity. For selected financial writes, the integrity request binds a canonical digest of the economic request. The server recomputes and compares the digest before Economy Core accepts the command.

### 3.6 PostgreSQL authority boundary

PostgreSQL current CREATE FUNCTION guidance:
https://www.postgresql.org/docs/current/sql-createfunction.html

PostgreSQL function-security guidance:
https://www.postgresql.org/docs/current/perm-functions.html

The documentation explicitly warns that `SECURITY DEFINER` executes with owner privilege, recommends a safe `search_path`, and recommends revoking default `PUBLIC EXECUTE` followed by selective grants.

**Moneyverse implication:** keep the existing database-as-final-integrity-boundary pattern. Add narrower runtime roles/functions instead of giving App Core, Site Core or AI broad table rights.

### 3.7 AI security

NIST AI RMF / Generative AI Profile:
https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence

NIST AI Resource Center:
https://airc.nist.gov/

OWASP LLM Top 10 2025, Excessive Agency:
https://owasp.org/www-project-top-10-for-large-language-model-applications/assets/PDF/OWASP-Top-10-for-LLMs-v2025.pdf

These support lifecycle risk management, TEVV, and limiting agent functionality, permissions and autonomy.

**Moneyverse implication:** model output is untrusted proposal data. The inference/model runtime receives no credential capable of ledger mutation or policy execution. Typed proposals must pass deterministic validation and policy-eligibility checks before a separately privileged executor can act.

## 4. Current repository strengths

The current repository already provides several useful containment mechanisms:

- browser -> nginx -> Next -> private NestJS -> PostgreSQL function request path;
- private API separated from normal public routing;
- same-origin HttpOnly browser session model;
- CSRF checks for state-changing web/native-cookie flows;
- restricted `moneyverse_app` role;
- economic writes concentrated in actor-checking `SECURITY DEFINER` functions;
- `economy_post_transaction` as the canonical money mover;
- append-only ledger and audit principles;
- business idempotency patterns;
- Android host pinning to configured API host and redirect refusal;
- no `INTERNAL_API_TOKEN` in the Android contract;
- explicit App API version/compatibility layer.

## 5. Current security drift/gaps relevant to v497

### 5.1 App and Site public contracts are mixed

The web source itself uses many `/app-api/v1/**` routes even though that surface is the native app contract. This mixes client-specific compatibility logic and makes independent evolution and policy enforcement harder.

### 5.2 Shared internal token is too coarse for new cores

The current server-to-server boundary relies on a single `INTERNAL_API_TOKEN`. This was acceptable for a simpler Next -> Nest boundary but should not become the identity system for multiple App/Site/Economy services. Compromise of one bearer secret would otherwise enlarge lateral-movement potential.

### 5.3 Wildcard/dynamic transport needs a generated allowlist

The App gateway supports a broad path-group mapping and the Android client contains universal `@Url` transport helpers. Host pinning prevents arbitrary-host exfiltration, but economic writes still need a generated endpoint/method/scope allowlist so a future route cannot silently become reachable with stronger authority than intended.

### 5.4 AI/automation currently has multiple economic paths

Current runtime/planning contains economy auto-policy, work auto-tuning and automatic stock scenario publication. Even where absolute stock prices are not directly written by the model, separate automation paths can create real economic effects.

**v497 correction:** one Economy Policy Registry and one Economy Core executor own all economic policy mutation. AI, work-tuning and stock-scenario modules produce proposals/evidence only unless a policy family is explicitly registered for bounded automatic execution.

### 5.5 Mobile integrity header exists but request binding must be authoritative

The App gateway forwards `x-play-integrity-token`, but high-value-action acceptance must include verified verdict, expected package/app identity and `requestHash` comparison tied to the canonical economic request.

## 6. Security conclusions adopted by v497

1. App Core and Site Core are separate BFF/security boundaries, not separate economies.
2. One Economy Core and one authoritative financial ledger/database remain the integrity authority.
3. Public clients never call Economy Core directly.
4. App Core and Site Core never receive direct protected-table write rights.
5. Workload identity and end-user actor authority are validated separately.
6. No caller-provided `X-User-Id`-style field is trusted as identity.
7. Economic commands carry idempotency, policy version and request integrity evidence.
8. AI/model runtimes possess no ledger-write or policy-apply credential.
9. AI automatic numeric movement is limited by a pre-approved policy registry, cooldown and cumulative drift budget.
10. Widening an AI envelope is itself a privileged human-governed policy change.
11. A compromised App Core must not grant Site-admin authority, and a compromised Site Core must not gain monetary-policy or DB-owner authority.
12. A compromised AI runtime may at worst produce bad proposals; deterministic validators and executor credentials remain separate.
13. Mobile app integrity is a risk signal plus request-binding mechanism, not a substitute for session/actor authorization.
14. Every new public route is inventory-managed; compatibility routes have an explicit retirement path.
15. Database grants, function ownership and `search_path` remain release-gated security changes.
