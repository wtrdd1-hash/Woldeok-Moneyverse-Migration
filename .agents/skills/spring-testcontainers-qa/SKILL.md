---
name: spring-testcontainers-qa
description: Design or execute Java JUnit 5, Spring Boot tests, MockMvc contract tests, PostgreSQL Testcontainers integration tests and migration parity QA for Spring backend work. Use for Spring test creation, failure diagnosis and Test release verification.
---
# Spring test pyramid and real-DB QA

## Test plan
- Read current Nest tests and repository QA gates, then map each moved route to the same acceptance assertions, including 401/403/404/409/429/503 and expected headers.
- Write failing tests first (RED), implement minimal safe change (GREEN), then refactor. Use JUnit 5, Spring Boot Test and MockMvc/WebTestClient as appropriate to the chosen web stack.
- Prefer Testcontainers with production-compatible PostgreSQL and actual migrations/functions/roles for database verification. A mocked `JdbcTemplate` cannot certify a PostgreSQL ACL or financial invariant.
- Include owner isolation, forged/expired session, CSRF, OTP replay, idempotency, parallel finance posting, scheduler double-leadership, websocket event compatibility and Android serialization where relevant.

## Environment evidence
- Distinguish unit PASS, container PASS, live official Test PASS and Production unchanged. Skip/blocked tests are not passes. Capture commands, exit codes, counts, duration and exact candidate SHA.
- Keep production data out of tests; use disposable databases and synthetic member fixtures. Do not run destructive tests against live DB.
- Verify real Test frontend/backend/edge identity, representative session flows, failure and rollback paths before any deployment claim.

Reference: https://docs.spring.io/spring-boot/reference/testing/testcontainers.html
