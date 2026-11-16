# Shared Spring Agent Skills — Codex/GPT and Gemini CLI

**Version:** v2026.11.13.2218 · **Status:** authoring and local installation; no Spring runtime changes. [한국어](SPRING_AGENT_SKILLS.ko.md)

## Purpose and authority

Reusable Agent Skills support the planned NestJS -> Java 21 / Spring Boot migration. They **do not approve** the Spring architectural draft, deployment, a database migration, or a financial operation. Read `AGENTS.md`, `GEMINI.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, the Spring candidate design and runtime release docs before implementation. Current main and live evidence override stale historical assumptions. Do not modify another agent's worktree.

## Shared discovery and activation

Both Codex and Gemini CLI support repository `.agents/skills/<name>/SKILL.md` and user-scoped `~/.agents/skills/<name>/SKILL.md`. Gemini also supports `.gemini/skills`, but a second Gemini-specific copy is unnecessary. Repository skills take precedence over user-scoped copies. The eight scoped skills here are source-controlled; the mini-PC Debian user's global mirror is installed separately for immediate availability before merging this branch.

**Important:** the mini-PC did not have a `gemini` executable in the inspected PATH; Gemini activation in an interactive session is **not verified**. After installing/configuring Gemini CLI, use `/skills reload` and `/skills list` and confirm the trusted workspace, or invoke the installed skill explicitly. Codex may require a session restart if the skill selector does not update.

## Skill catalog

| Skill | Trigger and specialty |
| --- | --- |
| `spring-strangler-migration` | modular Spring architecture, NestJS migration, traffic ownership and safe cutover |
| `spring-api-contract-parity` | Spring MVC DTO and REST parity, Next BFF and Android client compatibility |
| `spring-security-admin-auth` | Spring Security, session/CSRF, admin Discord/Telegram OTP, signed webhooks |
| `spring-postgres-finance-ledger` | restricted JDBC function access, double-entry ledger, treasury and financial correctness |
| `spring-testcontainers-qa` | JUnit 5, Testcontainers PostgreSQL, security/finance and end-to-end QA |
| `spring-gradle-dependency-quality` | Gradle Kotlin DSL, Java 21 toolchains, dependencies and supply-chain gates |
| `spring-scheduler-integrations` | jobs, outbox, Discord/Telegram/Socket.IO and single active owner |
| `spring-runtime-observability` | JVM/Actuator/Micrometer, health probes, SLO and zero-downtime operations |

## Safe-use workflow

1. Choose the appropriate skill for the task, read its entire `SKILL.md` and applicable Superpowers methodology skills.
2. Work on a dedicated branch/worktree, record before/in-progress/finished in `docs/worklog`, and compare `origin/main` before and during work.
3. Run the skill-specific acceptance gates on an isolated Test candidate. Report tested SHA, failures, skipped gates and exact Production status.
4. For a new approved Spring service, separately validate actual Java/Spring version, memory budget, API/DB contract, Android and auth compatibility. Docs-only skill changes need no runtime deployment.

## Verification and rollback

Validate exact names/frontmatter, unique identifiers, UTF-8 and file hash parity between repository and user mirror. If future skills are superseded, remove only these eight names from the user mirror after preserving repository history. No services, PostgreSQL data, financial transactions, credentials or deployment configuration should be changed by this installation.

Official references: [Gemini skills](https://geminicli.com/docs/cli/skills/), [Codex skill locations](https://learn.chatgpt.com/docs/build-skills), [Spring CSRF](https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html), [Spring Testcontainers](https://docs.spring.io/spring-boot/reference/testing/testcontainers.html).
