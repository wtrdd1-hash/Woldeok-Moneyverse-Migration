# Member Profile Source Integrity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent unverified member profile and visibility settings responses from rendering or enabling replacement writes.

**Architecture:** Pure validators sit next to existing profile types and are applied after the existing authenticated Nest reads in the server page. A mismatch or malformed response fails closed, without new API routes, DB permissions, or financial writes.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, NestJS existing profile endpoints, PostgreSQL SECURITY DEFINER functions.

**Spec:** `docs/worklog/2026-11-02-hourly-c-profile-source-v1278.md` and existing profile contracts.

## Global Constraints
- No main edits, no DB migration, no fabricated data, no production or shared DB mutations.
- Preserve the three owner-scoped authenticated API routes, member-only page, robots noindex and responsive layout.
- Do not expose replacement-write controls until profile, stored visibility map and awarded titles are all verified and mutually consistent.

## Review Focus
- Non-object or missing responses must not render.
- A malformed or unknown visibility map must never default to inherit.
- Invalid bigint work count, date or job level must not crash profile rendering.
- Duplicated/invalid awarded title codes must not enter the write form.
- Conflicting profile/settings visibility must block the write form.

### Task 1: Pure runtime proof
- [ ] Add tests for valid and malformed profile/settings/title responses.
- [ ] Run focused Vitest and capture RED failures.
- [ ] Implement narrow runtime validators; run GREEN.

### Task 2: Owner page integration
- [ ] Add a page regression for fail-closed form and profile card.
- [ ] Run RED, wire validators into page, then run GREEN.
- [ ] Verify accessibility/noindex and unchanged backend contract.

### Task 3: Release gate and preservation
- [ ] Re-fetch main and resolve semantic changes if any.
- [ ] Run exact-SHA build/lint/typecheck/unit/integration/DB/security/app-api/E2E/CI gates where possible.
- [ ] Update English/Korean logs, push branch and draft PR; block merge/deploy on any failed gate.
