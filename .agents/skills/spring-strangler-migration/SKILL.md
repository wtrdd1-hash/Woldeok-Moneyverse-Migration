---
name: spring-strangler-migration
description: Plan or implement staged NestJS/TypeScript to Java Spring Boot backend migration, including module boundaries, traffic ownership, strangler routing, cutover gates, and rollback. Use for Spring architecture, backend conversion, or migration planning; not for unrelated UI work.
---
# Staged Spring backend migration

## Before changing anything
1. Read `AGENTS.md`, `GEMINI.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `docs/RELEASING.md` and the latest accepted Spring-specific design. Drafts are not implementation authorization.
2. Fetch current `origin/main` at start and midpoint; inspect active worktrees and Gemini-owned branches. Isolate your branch and record before/in-progress/finished worklog states.
3. Inventory the existing Nest controllers, services, auth guards, SQL functions, schedulers, Socket.IO events and Next BFF callers before moving a domain.

## Design and execution
- Prefer a modular Spring Boot deployment and the strangler pattern over a big-bang rewrite or premature microservices. Do not convert Next.js UI or PostgreSQL ledger merely to reduce languages.
- Assign exactly one owner to each route and state-changing job. Maintain a route owner table: method/path, Nest owner, Spring replacement, client, database function, feature switch, test evidence, rollback.
- Preserve the Next server-only API boundary and exact-match public webhook exceptions. Do not expose a new public `/api/**` backend prefix by accident.
- Phase through inventory -> non-mutating read parity -> Test -> permission negatives -> guarded cutover -> retirement. Shadow requests must be side-effect free.
- Require approval before scaffolding major runtime components or switching traffic when the applicable plan remains DRAFT.

## Completion evidence
Give exact source SHA, affected route count, parity coverage, active owner evidence, test results, unresolved risks, and rollback procedure; never report deployment from source changes alone.
