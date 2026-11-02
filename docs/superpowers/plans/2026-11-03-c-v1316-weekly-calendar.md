# Verified Weekly Calendar Source Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and test-driven-development; independently review before any release.

**Goal:** A malformed or stale weekly-goal API response must never become a verified empty calendar or an invented reset date.

**Architecture:** Reuse authenticated Nest GET `/api/v1/engagement/early-game` and migration 101's owner-scoped SECURITY DEFINER function. Validate a bounded envelope, unique goal codes, exact KST Monday and current-week agreement before rendering a weekly reset. Keep other calendar feeds untouched.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, NestJS, PostgreSQL 17.

## Task 1 — RED contract
- [x] Write `frontend/src/app/calendar/weekly-reset-evidence.test.ts` with valid, empty, malformed, conflicting and stale cases.
- [x] Run the test and record failure before implementation.

## Task 2 — GREEN behavior
- [x] Add `frontend/src/app/calendar/weekly-reset-evidence.ts` parser with explicit null for unavailable and verified-empty object for zero goals.
- [x] Use parser in `calendar/page.tsx`; error must not show 'no goals', and include accessible retry.
- [x] Run focused tests, lint and typecheck; review errors.

## Task 3 — Verification and handoff
- [x] Re-fetch main and compare relevant files/plan before final PR decision.
- [x] Run exact code HEAD gates; record backend, audit, QA and E2E blockers. Re-run after final documentation commit.
- [x] Preserve independent branch, English/Korean logs and safe GitHub Draft PR. No merge/deploy.

## Supplemental RED/GREEN — real HTTP privacy
- [x] RED: route-specific headers absent under global public indexing policy.
- [x] GREEN: six exact canonical/localized member calendar paths protected by noindex/private/no-referrer in Next config.
- [x] Built code SHA and inspected six HTTP headers; 500 responses from missing isolated backend, so authenticated E2E remains BLOCKED.
