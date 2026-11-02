# Verified Weekly Calendar Source Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and test-driven-development; independently review before any release.

**Goal:** A malformed or stale weekly-goal API response must never become a verified empty calendar or an invented reset date.

**Architecture:** Reuse authenticated Nest GET `/api/v1/engagement/early-game` and migration 101's owner-scoped SECURITY DEFINER function. Validate a bounded envelope, unique goal codes, exact KST Monday and current-week agreement before rendering a weekly reset. Keep other calendar feeds untouched.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, NestJS, PostgreSQL 17.

## Task 1 — RED contract
- [ ] Write `frontend/src/app/calendar/weekly-reset-evidence.test.ts` with valid, empty, malformed, conflicting and stale cases.
- [ ] Run the test and record failure before implementation.

## Task 2 — GREEN behavior
- [ ] Add `frontend/src/app/calendar/weekly-reset-evidence.ts` parser with explicit null for unavailable and verified-empty object for zero goals.
- [ ] Use parser in `calendar/page.tsx`; error must not show 'no goals', and include accessible retry.
- [ ] Run focused tests, lint and typecheck; review errors.

## Task 3 — Verification and handoff
- [ ] Re-fetch main and compare relevant files/plan before final PR decision.
- [ ] Run exact HEAD build, lint, typecheck, unit, integration, real PostgreSQL, security, app-api, E2E, CI where available; record all blockers.
- [ ] Preserve independent branch, English/Korean logs and safe GitHub PR. Do not merge/deploy on a failed gate.
