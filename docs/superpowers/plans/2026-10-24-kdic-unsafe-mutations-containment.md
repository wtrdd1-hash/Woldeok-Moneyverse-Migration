# KDIC Unsafe Mutations Containment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent unauthorized or economically unverified KDIC fund mutations while retaining truthful read-only fund and depositor coverage views.

**Architecture:** Require an open admin console for KDIC operator routes and CSRF/recent reauthentication for mutation routes. Fail closed at the service and repository boundaries for premium assessment, liquidity support and depositor payout until PostgreSQL-owned, ledger-backed, idempotent transactions are implemented. Remove frontend mutation requests and disable those actions visibly; preserve page refresh through the authenticated server-rendered route.

**Tech Stack:** NestJS guards, TypeScript, Vitest, Next.js App Router.

**Spec:** `AGENTS.md` §§4-5 and `docs/planning/PROJECT_PLAN.md` P0 economy/privilege/release gates. No DB migration, no ledger mutation, no production data writes.

## Tasks
- [x] Write RED tests for admin console guards, per-operation CSRF/reauth, service and repository fail-closed behavior, and frontend disabled controls.
- [x] Run RED tests and record expected failures.
- [x] Add admin console and mutation guards; remove unsafe service/repository write execution; retain public/read-only paths.
- [x] Disable KDIC financial actions in UI, remove browser mutation fetch and fake success toasts, use server-rendered page reload for refresh.
- [ ] Run focused GREEN tests, lint, typecheck, build, API contract and full test suite; record skipped/failed gates explicitly.
- [ ] Re-fetch main and plan, review diff and QA/PR overlap; commit to independent branch, push Draft PR only; do not merge or deploy until all release gates pass.
