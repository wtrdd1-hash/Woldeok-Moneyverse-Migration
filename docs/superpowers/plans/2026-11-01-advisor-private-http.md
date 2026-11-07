# Advisor Owner Private HTTP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps are test-driven and verified.

**Goal:** Ensure owner-specific financial advisor responses, including pre-controller authentication/CSRF refusals, never inherit public cache or crawler policy.

**Architecture:** Apply controller-scoped Express middleware in `AdvisorModule` before Nest guards. Preserve existing authorization, CSRF, database read, response payload, and API routes.

**Tech Stack:** NestJS, TypeScript, Vitest, Supertest.

**Spec:** `docs/worklog/2026-11-01-backend-b-v729-advisor-private-http.md`.

## Tasks
1. [ ] Add `backend/src/advisor/deoki-advisor.private-response.http.test.ts` with Nest HTTP fixture and failing 401/403/200/201/503/HEAD/public tests. Run RED.
2. [ ] Update `backend/src/advisor/advisor.module.ts` to apply owner-only `Cache-Control: private, no-store`, `X-Robots-Tag: noindex`, `Referrer-Policy: no-referrer` before guards. Run GREEN.
3. [ ] Run advisor regression, lint/typecheck/build, CI and isolated real PostgreSQL security checks; capture exact SHA and blockers.
4. [ ] Fetch main/plans again, create Draft/HOLD PR with API contract and evidence, never merge/promote without all release gates.
