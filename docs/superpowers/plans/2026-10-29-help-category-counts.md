# Verified Help Category Counts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let visitors choose help categories based on the number of currently approved, published, unexpired articles, without exposing drafts or private data.

**Architecture:** A new read-only SECURITY DEFINER SQL function returns counts by locale/category. NestJS categories API preserves its existing categories array and adds a bounded counts map. Next.js server renders those counts without treating an outage as zero. Android's existing public help/categories app-api path forwards the same response with no-store; admin paths remain inaccessible.

**Tech Stack:** PostgreSQL, NestJS, Next.js, Vitest, pnpm.

- [x] Write failing SQL boundary tests for a new immutable migration and authorization.
- [x] Write failing backend controller/repository tests for published-only category counts.
- [x] Write failing frontend and Android app-api contract tests for counts/no-store.
- [x] Implement new migration and API repository/controller.
- [x] Implement server-rendered category labels, safe fallback on outage.
- [x] Run targeted tests; review security, privacy, accessibility and migration parity.
- [x] Re-fetch main and both integrated plans; run full gates and real PostgreSQL.
- [ ] Record exact SHA, CI, Test/Production/rollback evidence; create Draft PR, never auto-merge without full gates.
