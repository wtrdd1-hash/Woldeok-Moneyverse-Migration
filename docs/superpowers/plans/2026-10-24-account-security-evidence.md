# Account Security Evidence Instead of Invented Scores — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. TDD RED → GREEN and independent review are mandatory.

**Goal:** Remove false account security certification and arbitrary 50–100% scores while showing accurate, server-sourced sign-in method status.

**Architecture:** Keep the existing member-only SSR account route and authenticated `/api/v1/account/identities` contract. Extract a pure state model to distinguish unavailable, zero, and present login methods; display evidence rather than a security guarantee. No new API, DB mutation, or auth contract.

**Tech Stack:** Next.js 16 App Router, TypeScript, React, Vitest.

**Spec:** Current `frontend/src/app/account/page.tsx`, `AGENTS.md`, `docs/planning/PROJECT_PLAN.md`.

## Global Constraints
- Never touch Production-linked DB 5433; isolated tests only.
- Keep member auth and `robots: noindex,nofollow`.
- Preserve account/profile/navigation/actions; no invented security percentage or unproven "verified" badge.
- Respect 320px and keyboard/screen-reader navigation.
- No overlap with A/B/QA/Gemini/C v998/v999.

## Review Focus
- Identity API failure must not show "0 connected" or any protection grade.
- Zero identities must be distinct from an unavailable API.
- Duplicate provider records must not inflate provider count.
- Having two social providers must not imply guaranteed account recovery.
- Non-identity profile and existing member-only actions must remain intact.

### Task 1 — Regression tests
- [ ] Add unit tests for unavailable, empty, duplicates, valid providers and invalid response.
- [ ] Replace obsolete assertion that requires a fabricated security percentage.
- [ ] Observe RED before implementation.

### Task 2 — Product implementation
- [ ] Implement minimal pure login-method evidence state.
- [ ] Replace false verification badges, score/progress and recovery guarantee with honest server-backed status.
- [ ] Preserve responsive account card, links, member auth, SEO.
- [ ] Run GREEN and targeted lint.

### Task 3 — Validation and release hold
- [ ] Verify current main and planning again; rebase if advanced.
- [ ] Run exact-SHA typecheck/build/lint/unit/contract/backend/security and isolated PostgreSQL if safe.
- [ ] Run browser/a11y regression where feasible; distinguish mocked from official Test.
- [ ] Publish EN/KO worklog and Draft PR; merge/promote only after ALL gates PASS.
