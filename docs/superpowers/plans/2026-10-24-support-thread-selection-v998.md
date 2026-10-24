# Member Support Thread Selection Integrity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the member support inbox safely recover from stale/unowned thread links and transient API outages, without displaying a reply form for an unverified thread.

**Architecture:** Keep the NestJS support API and migration 196 as the authorization source of truth. The server component lists the authenticated member's threads first, selects only an exact ID from that list, and requests messages only for a confirmed selection. API failures produce retryable UI rather than false empty or a 500. No new API or database schema.

**Tech Stack:** Next.js 16 App Router server components, NestJS authenticated support API, PostgreSQL SECURITY DEFINER functions, Vitest and React SSR.

**Spec:** Existing `frontend/src/app/support/page.tsx`, `backend/src/support/support.controller.ts`, migration 196, AGENTS.md.

## Global Constraints
- Never query another member's messages or send a reply to a thread not confirmed in the member's list.
- Keep `requireMember` and backend guards/CSRF; do not expose IDs in logs.
- Responsive down to 320px; keyboard labels and screen-reader status; private noindex page.
- No live database writes, no main mutation, no production deployment before release gates.

## Review Focus
1. Non-UUID URL must never reach API.
2. Valid UUID absent from current member list must not render a reply form.
3. List API unavailable must show retry and not imply no inquiries.
4. Message API unavailable must show retry and not imply no messages.
5. Owned selection must still display messages and a working server action form.

### Task 1: Guard support thread selection and failure UI
**Files:**
- Create `frontend/src/app/support/page.test.tsx`.
- Modify `frontend/src/app/support/page.tsx`.
- Update English/Korean `docs/worklog/2026-10-24-hourly-c-v998*.md`.

**Steps:**
- [ ] Write SSR tests with mocked member session and backend API for owned, unknown, malformed and unavailable threads.
- [ ] Run tests and observe RED for unsupported states.
- [ ] Implement selection fencing, failure states and accessible UI.
- [ ] Run tests GREEN; review and improve responsive layout and semantics.
- [ ] Re-fetch main, run exact-SHA gates and record blocked gates without claiming PASS.
- [ ] Push branch, create Draft PR, record final CI and release status.
