# API Disclosure & Public Surface Security Specification

> Version: v2026.09.23.398
> Status: P0 planning/security contract
> Korean counterpart: [API_DISCLOSURE_SECURITY_SPEC.ko.md](API_DISCLOSURE_SECURITY_SPEC.ko.md)

## 1. Decision

Woldeok Moneyverse MUST NOT intentionally publish API endpoint inventories, request/response schemas, OpenAPI/Swagger documents, cURL/code examples, privileged mutation descriptions, internal service routes, or live API consoles on the public product website.

Detailed API documentation is maintained in GitHub planning/developer documentation only. Repository visibility is the actual disclosure boundary: if the repository is public, the GitHub documentation is still public on the Internet. "GitHub-only" means "not intentionally surfaced by the Moneyverse web product"; it does not make a public GitHub repository secret.

## 2. Public website policy

The production and test web products MUST remove or disable public developer-portal surfaces that enumerate APIs, including:
- endpoint lists and searchable API catalogs;
- OpenAPI/Swagger/JSON/YAML downloads;
- request/response schema viewers;
- cURL/TypeScript/Python examples;
- "Try it out", live endpoint testers, GraphQL explorers, Postman-style consoles, or equivalent interactive clients;
- admin, treasury, wallet, stock, banking, settlement, reward, moderation, account, authentication, or other privileged/economic API documentation;
- internal hostnames, service names, ports, topology, debug routes, build metadata, secrets, tokens, credentials, signing material, or security-control implementation details that are not required for normal user operation.

A generic user-facing statement such as "this feature communicates securely with the service" is allowed, but it MUST NOT enumerate the callable API contract.

## 3. Runtime reality and non-security-by-obscurity rule

Removing public API documentation is a disclosure-reduction control, not the primary authorization control. Browser/mobile clients necessarily reveal some network destinations to an authorized user and an attacker can inspect their own traffic. Therefore every API remains protected as if its route and schema are known.

Required server controls include deny-by-default authorization, object-level authorization/BOLA protection, server-authoritative actor identity, CSRF protections for browser mutations, input allowlists and bounded validation, rate/resource limits, idempotency and concurrency protection for economic mutations, append-only audit where required, and step-up/re-authentication for sensitive operations.

No feature may weaken these controls because its API is absent from the public website.

## 4. Client architecture

Where practical, the web frontend SHOULD call a same-origin BFF/server action rather than exposing unnecessary internal service topology to the browser. Sensitive internal services MUST NOT be directly routable from the public Internet merely to support the UI.

The client MUST NOT receive server secrets, database credentials, internal API keys, signing secrets, privileged bearer tokens, or service-to-service credentials. Public browser bundles MUST be scanned for accidental route inventories, source maps containing private operational data, embedded OpenAPI artifacts, and secrets.

## 5. GitHub API documentation authority

GitHub is the canonical location for detailed API descriptions. Documentation there SHOULD include the complete engineering contract required by v397: method/path, authentication/authorization, request/response schema, validation, stable errors, pagination/filtering, idempotency, concurrency, rate/resource limits, persistence/failure semantics, audit/telemetry, versioning/deprecation, and positive/negative test expectations.

Detailed API documentation MUST stay synchronized with implementation, but it MUST NOT be copied automatically into the public website or shipped as a production static asset unless a later explicit planning decision reverses this policy.

If stronger confidentiality is required, the repository or API documentation storage MUST be private/access-controlled; a public GitHub repository cannot be treated as confidential.

## 6. Build and release gates

Production/Test web builds MUST fail or block promotion when they unintentionally publish:
- OpenAPI/Swagger specifications;
- developer-portal API catalog pages;
- downloadable API collections;
- live API execution consoles;
- generated route inventories that contain non-user-facing endpoints;
- secrets or privileged internal configuration.

Release QA MUST crawl public routes and static assets for known developer/API-documentation artifacts and verify direct access returns an approved non-disclosing response (normally 404/410 or an intentionally minimal public page).

## 7. Migration from the current developer portal

The currently visible developer portal/API center is treated as a P0 disclosure-hardening migration target. Implementation work MUST:
1. inventory every public developer/API route and downloadable artifact;
2. classify content as user-facing product help vs detailed API engineering documentation;
3. move detailed API descriptions to GitHub documentation;
4. remove public endpoint catalog/OpenAPI download/live tester surfaces;
5. verify no navigation, sitemap, robots-discoverable page, static artifact, or cached build still serves the removed documentation;
6. run authorization/security regression tests independently of this disclosure change;
7. deploy to Test, verify backend/frontend/API behavior on the exact SHA, then follow the normal zero-downtime Production promotion gate.

This v398 change is planning/documentation only. It does not claim the public developer portal has already been removed from runtime.
