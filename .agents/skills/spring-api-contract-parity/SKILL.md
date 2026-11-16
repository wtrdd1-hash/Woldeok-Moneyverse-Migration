---
name: spring-api-contract-parity
description: Migrate or review NestJS REST API controllers, DTOs, error mapping, session behavior, Next.js BFF and Android Retrofit contracts for Spring MVC. Trigger for Spring controller conversion, OpenAPI/schema parity, API versioning, serialization or mobile compatibility work.
---
# API contract parity for Spring MVC

## Contract inventory
- Read authoritative API catalog, shared contract package, Nest controller/DTO source, Next.js API gateway and Android Retrofit consumers. Identify every status, query/path/header/body field, nullable value, cookie and cache directive.
- Establish request/response fixtures for normal, missing, malformed, unauthorized, forbidden, conflict, throttled and upstream-unavailable paths. Keep a per-endpoint parity checklist.
- Do not conflate `null`, absent field, verified empty, unavailable, and stale result. Preserve signed integer WLD amounts as exact strings/BigDecimal, never floating-point money.

## Implementation rules
- Use Spring MVC `@RestController`, Bean Validation and a single reviewed `@RestControllerAdvice` error mapping; explicitly retain existing wire-level JSON names, timestamps, precision and statuses.
- Preserve server-only Next BFF, identity provenance, CSRF and session propagation; do not accept actor IDs from member-controlled query/body as authority.
- Restrict request parameters, pagination and timeouts; keep `Cache-Control: private, no-store` and robots headers for private endpoints, on both success and errors.
- Update shared web contract and Android expectations in coordinated branches when real parity changes are approved.

## Gate
Run real HTTP contract comparisons of legacy and Spring in isolated Test, including Android client decode and authenticated flows. Document endpoint-to-test mapping and all exceptions before a switch; do not mark mocked tests as production parity.
