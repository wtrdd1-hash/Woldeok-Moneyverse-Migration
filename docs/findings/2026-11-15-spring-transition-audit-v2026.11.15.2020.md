# Moneyverse Spring Migration — Measured Status (v2026.11.15.2020)

[한국어](2026-11-15-spring-transition-audit-v2026.11.15.2020.ko.md) | **EN canonical**

**Status:** PARTIAL / OBSERVED. **Measured:** 2026-11-15 20:14–20:18 KST. **Source baseline:** GitHub `main` `f45c6e1513d3e11c9395bd2a510a26ddfee71292`. This is a read-only audit, **not** a deployment receipt or a new product-plan authority.

## Executive result

Java Spring Boot 3.3.5 is running on 127.0.0.1:4550. The immutable legacy Node.js/NestJS backend is *also running* on 127.0.0.1:4500; Nginx routes selected API prefixes to Spring and leaves other paths on Node. Next.js, Nginx, and PostgreSQL are active. **The migration is not complete.**

The *nominal source implementation footprint* is **106 Spring HTTP-method mapping annotations ÷ 615 legacy NestJS endpoint-method decorators = 17.24%**. This is an indicative, non-equivalent code-count ratio, **not a certified functional migration %, share of live traffic, or tests passed %**. Class-level mappings, overlapping routes, aliases, and newly added features prevent a direct percentage. No reliable traffic-weighted migration percentage was established.

| Evidence | Observation | Interpretation |
| --- | --- | --- |
| Spring source | 26 `*Controller.java`; 106 method mappings; 13 additional `@RequestMapping` annotations | Implementation present, not necessarily parity |
| Legacy source | 89 `*.controller.ts`; 615 HTTP-method decorators | Legacy API baseline is still broad |
| Spring runtime OpenAPI | HTTP 200 at `/v3/api-docs`; 184 paths, 199 operations | Counts include versioned route aliases; not 199 migrated legacy endpoints |
| Spring health | `http://127.0.0.1:4550/actuator/health` HTTP 200 `UP` | Process operational; `/api/health` on this port returns 404 |
| Production version | Public `/api/version` HTTP 200, `framework: Spring Boot 3.3.5`, `activeEngine: Java Spring Boot` | Version endpoint reflects Spring, **not** proof all routes use Spring |
| Production routing | Nginx `prod_spring` 4550, `prod_node` 4500, internal gateway 4400; Node-auth/chat/blog/Discord and other services still have Node paths | Hybrid deployment is verified |
| Focused internal gateway smoke | 12 selected *GET* endpoints HTTP 200 (treasury, bonds, pension, banking, central bank, stocks, wallet, marketplace, seasons, OTP status, version) | Read-only reachability; no authentication or money-write validation |
| Production probes | `/health` and `/api/stocks` HTTP 200 with Spring backend header; one short `/api/version` request timed out following an earlier HTTP 200 | Not evidence of 100% site availability or regression; requires monitoring |
| Official Test version | `test.easy-scraping.com/api/version` HTTP 200, id `cfc178ab55d95fd4f1e34a62f2d3cf17b932c12a` | Does **not** match observed main SHA; exact-main Test gate unverified |
| Runtime provenance | Spring JAR mtime 2026-11-15 19:03:49 KST; active service since 19:03:49 | Exact JAR-to-main commit mapping not certified |
| JVM / DB | Runtime JDK 21; source Gradle Java compatibility 17; PostgreSQL container version 17.11 | Legacy migration narrative saying PG16 is outdated for this host |

## Domain coverage and gaps

Spring controllers exist for treasury/mint, pension, bonds, banking, central bank, KDIC, wallet, casino, black-market, marketplace, PvP arena, seasons, stocks/league, profile, newspapers, admin users/controls/security/stocks/economy and channel OTP. This identifies **implementation presence only**. Legacy Nest controllers also remain for login/session integrations, chat, support, blog, media, Work, shop, notifications, SEO, economy/enterprise, quests, and other modules. Route-by-method contract parity remains unmeasured.

## Documentation drift and remaining release gates

The historical root `SPRING_BOOT_MIGRATION_REPORT.md` contains a full-cutover claim and a 23-endpoint smoke claim. These cannot supersede observed mixed routing, the legacy process, and the much larger legacy API catalog. Preserve the historical report; add a current verification note rather than silently rewriting it.

**BLOCKED for full cutover:** exact SHA/runtime provenance, comprehensive Nest→Spring method+path+DTO parity inventory, authenticated sessions/admin OTP and authorization-negative tests, financial ledger/idempotency/rollback E2E in an isolated Test DB, independent backup/restore, production canary metrics and previous-runtime rollback readiness. Do not infer readiness from feature switches or a single version endpoint.

**Recommended sequence:** maintain mixed mode; generate a machine-readable method/route ownership and compatibility matrix; prioritize high-risk auth/financial routes; verify exact-main isolated Test with least-privilege DB and negative security flows; measure traffic and p95/p99/error rates; then authorize zero-downtime domain-by-domain cutover with revert gate. No code, Nginx, DB or production changes were made by this audit.

Refs: [Current documentation status](../CURRENT_DOCUMENTATION_STATUS.md), [Policy](../DOCUMENTATION_POLICY.md), [Product plan](../planning/PROJECT_PLAN.md), [Historical migration report](../../SPRING_BOOT_MIGRATION_REPORT.md), [audit worklog](../worklog/2026-11-15-spring-transition-audit-v2026.11.15.2020.md).
