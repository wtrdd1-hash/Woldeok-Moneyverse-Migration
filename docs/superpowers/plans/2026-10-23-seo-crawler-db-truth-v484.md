# SEO Crawler Telemetry DB Authority Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent production crawler telemetry from reporting success or fabricated/stale in-memory metrics when PostgreSQL is unavailable.

**Architecture:** Preserve SeoService's existing memory ring for local development and unit tests. Inject optional runtime AppConfig to determine the production boundary; reject production read/write when no pool or a query fails with Nest 503. Never expose database error detail in HTTP responses.

**Tech Stack:** NestJS, TypeScript, Vitest, PostgreSQL Pool.

**Spec:** `docs/worklog/2026-10-23-hourly-b-v484.md` and `docs/planning/PROJECT_PLAN.md`.

## Global Constraints
- No finance, schema, migration, user data or other agent worktree modifications.
- Production stays HOLD pending full exact-SHA Test, CI and GitOps release gates.

## Review Focus
- Production missing pool and failed reads; production failed writes and truthful receipt; local memory-only behavior; sensitive SQL errors never returned; no behavior change to authenticated administrator response schema.

## Task 1: Reproduce misleading success
- [x] Add `backend/src/seo/seo-db-truth-v484.test.ts` with production no-pool, failed read and failed write assertions plus local-memory control.
- [x] Run focused Vitest and record failing assertions.

## Task 2: Minimal production fix
- [x] Update `backend/src/seo/seo.service.ts` to use optional injected config and return 503 on missing/failing production persistence.
- [x] Run focused Vitest and existing SEO tests.

## Task 3: Verify and review
- [ ] Run lint, typecheck, build, unit/integration and required CI.
- [ ] Verify origin/main and planning documents mid-work, record exact candidate SHA, Draft PR only if code is committed and pushed.
- [ ] Hold merge and Production until isolated official Test exact-SHA and GitOps gates pass.
