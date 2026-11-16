# Spring Dopamine Mapping and WLD Truth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or subagent-driven-development. Steps are checkable.

**Goal:** Eliminate duplicate Dopamine status mapping and prevent unjournaled Spring WLD spin success.
**Architecture:** Keep authenticated DopamineController as sole canonical /engagement/dopamine/status handler. Keep separate legacy engagement /features route, return fail-closed 503 for authenticated random-money spin until canonical journal integration proven. Preserve Nest ledger-backed attendance.
**Tech Stack:** Spring Boot 3.3.5, Java 17+, JUnit5 MockMvc, PostgreSQL canonical ledger.
**Spec:** docs/planning/PROJECT_PLAN.md and docs/planning/INTEGRATED_PLANNING_MASTER.md; authority drift remains.

## Global Constraints
- No direct balance write or fabricated WLD receipt.
- No live Test/Production restart, database mutations, or global Spring promotion without G0-G6 acceptance.
- English canonical; Korean equivalent worklog and internal/GitHub updates; reread origin/main at midpoint.

## Review Focus
- Unauthenticated forged X-User-Id cannot read dopamine status: 401.
- Multiple handlers cannot match /api/engagement/dopamine/status.
- Logged-in users never receive fake WLD success for no-ledger spin: 503.
- Preserve /api/engagement/features alias and Nest attendance/spin contract.
- Full Spring tests not only focused assertions.

### Task 1: RED route/security regression
- [x] Add MockMvc unauthorized route test and direct authenticated spin fail-closed unit test.
- [x] Run tests, record failure under baseline.

### Task 2: GREEN minimum fix
- [x] Remove duplicate mapping from legacy EngagementController.
- [x] Replace fake Dopamine success with 503 without a ledger write; do not break anonymous 401.
- [x] Update obsolete test expectation for Dopamine route.
- [x] Run focused tests.

### Task 3: Validate and hand off
- [x] Full Spring test and bootJar, diff check, origin/main revalidation.
- [x] EN/KO worklogs, internal/GitHub updates, version stamps and isolated PR.
- [x] Hold Production until official exact-SHA Test and authenticated finance E2E, security acceptance, rollback checks.

## Completion evidence
RED 4/5 then RED 6/6; GREEN clean test bootJar 114/114, real HTTP negative; scope and release risk documented. Actual production and Test deployment explicitly blocked.
