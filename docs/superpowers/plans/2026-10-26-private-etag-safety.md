# Private Conditional HTTP Responses Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement the plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent private/no-store API responses from being converted to bodyless HTTP 304 by the generic ETag middleware.

**Architecture:** Keep weak validators for public GET/HEAD responses. At response-send time inspect cache policy, Set-Cookie and incoming credentials; if any indicates a personalized/non-storable response, bypass ETag generation and conditional matching entirely. Preserve route/DTO/DB semantics.

**Tech Stack:** TypeScript, Express, Vitest.

**Spec:** `docs/worklog/2026-10-26-hourly-b-v555-private-etag.md`.

## Global Constraints
- Do not alter finance, auth or DB authority. No migration.
- Preserve public 304 handling and weak ETag hashing.
- Do not merge or deploy unless all CI, security, isolated DB and official Test exact-SHA gates pass.

## Review Focus
- `Cache-Control: no-store` with `If-None-Match: *` must return 200 with body.
- Authenticated Cookie/Authorization requests must not be answered 304.
- `Set-Cookie` responses must not produce validators.
- Public GET remains 304 on matching validator; public HEAD remains supported.
- Case-insensitive cache directives and header arrays must not bypass protection.

## Task 1: Regression
- [x] Create `backend/src/http/etag-private-cache.test.ts` with isolated middleware request/response harness.
- [x] Run focused Vitest and capture RED failures.

## Task 2: Minimal implementation
- [x] Modify `backend/src/http/etag.middleware.ts` to bypass validator logic for private/no-store signals.
- [x] Re-run focused Vitest and record GREEN.

## Task 3: Verification and handoff
- [x] Run backend and repository gates, capture exact outcomes (mandatory failures recorded).
- [x] Refresh main/planning and record overlap status.
- [x] Commit, push and open Draft PR only. Keep Production HOLD on unverified gates.
