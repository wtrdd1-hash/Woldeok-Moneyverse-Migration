# Progression owner HTTP response privacy — v725

## Scope and safety
The existing authenticated progression controller serves personal stage, credit grade, loan history, unlock status, and mutation receipts. Controller guards can reject a request before a method-level response header is applied. A shared intermediary must never cache any of these owner responses, including refusals.

Implement route-scoped pre-guard middleware for ProgressionController only. Preserve the existing SessionGuard, AuthenticatedGuard, ConsentGuard and CsrfGuard ordering, response bodies, status codes, route map, financial ledger, database ACL, and applied migrations. Do not broaden the middleware to public routes.

## Implementation and verification
1. Write a real NestJS/Supertest HTTP regression that invokes the production module's middleware, covering successful reads, refresh, rejected consent/CSRF/auth, unavailable prestige, HEAD, and an unrelated public route. Observe RED.
2. Add a NestModule middleware to ProgressionModule that sets Cache-Control: private, no-store; X-Robots-Tag: noindex; Referrer-Policy: no-referrer before guards. Observe GREEN.
3. Run focused and full tests, lint, typecheck, builds, contract and database checks, and isolated PostgreSQL integration with least-privilege assertions.
4. Preserve Draft/HOLD and do not merge or deploy unless all required gates and exact-SHA Test/Production release prerequisites pass.

## Review
No new SQL or monetary command. No client-visible success semantics changed. The middleware applies to the controller class only, so public endpoints are unaffected. Local focused tests do not substitute for the full regression or official Test exact-SHA gate.
