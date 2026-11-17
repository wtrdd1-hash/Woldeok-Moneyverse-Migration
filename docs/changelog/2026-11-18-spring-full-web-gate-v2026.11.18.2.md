# v2026.11.18.2 — Spring full-web migration safety gate and verified preview repair

**Status:** SOURCE TEST VERIFIED / OFFICIAL TEST BLOCKED / PRODUCTION HOLD · [한국어](2026-11-18-spring-full-web-gate-v2026.11.18.2.ko.md)

- Owner directive remains full Spring Boot backend + MVC/Thymeleaf web frontend, including all Next BFF; no relaxation of PostgreSQL ledger, session/MFA, CSRF or rollback requirements.
- Reconciled staged Spring preview branches #3213/#3253 with authoritative `main` e96e8f81f4, preserving main's financial/security constraints.
- Reproduced and fixed false HTTP 200 on disabled `/spring-web` and `/spring-web/status` previews caused by broad SPA fallback, returning explicit 404 and noindex/private headers.
- TDD: old branch 116 tests / 1 fail (Phase7); merged main 141 / 1 fail (disabled preview HTTP 200); corrected branch Java21 Gradle `clean test bootJar` **141 PASS / 0 FAIL / 0 SKIP**, executable JAR created. Embedded Spring HTTP tests included.
- Deterministic source inventory v2026.11.18.2 now tracks 178 Next pages, 124 Next BFF and 3 noncanonical Spring previews; **0 canonical pages and 0 BFF certified migrated**. Preserved earlier historical inventory v2026.11.17.2.
- No DB migrations, production balance writes, Test/Production deployment, systemd or Nginx changes. A 141-test Spring result cannot stand in for full Next/Android and financial E2E gates.
- [Worklog](../worklog/2026-11-18-spring-web-readiness-v2026.11.18.2.md) · [Migration inventory](../migration/SPRING_FRONTEND_ROUTE_INVENTORY_v2026.11.18.2.json).
