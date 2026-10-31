# Authenticated Route Headers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans with test-driven-development and verification-before-completion.

**Goal:** Stop authenticated HTML routes from advertising search indexing or public caching.

**Architecture:** Next config's global security headers remain for public routes. A later, narrowly allowlisted set of route-specific headers overrides robots, cache and referrer headers for protected pages and locale-prefixed aliases. No backend, SQL or authentication contract changes.

**Tech Stack:** Next.js config, TypeScript, Vitest, independent HTTP smoke.

**Spec:** docs/worklog/2026-11-01-development-c-v1239-private-route-headers.md

## Global Constraints
- Never change main, existing A/B/QA/Gemini worktrees or Production.
- Public landing pages retain indexability; private routes get noindex/nofollow and no-store.
- Test real HTTP headers, not just React metadata.

## Review Focus
- Login redirect still private.
- Protected account/wallet/admin root and nested routes.
- Locale-prefixed routes including vi.
- Public root/blog/stocks/shop retain existing indexing policy.
- Test environment global noindex is never relaxed.

### Task 1: Protected Next response headers
**Files:** frontend/next.config.ts, frontend/src/security-headers.test.ts.
- [ ] Write a failing route-level header regression test (RED).
- [ ] Run focused test and capture failure.
- [ ] Add minimal ordered private-route header rules (GREEN).
- [ ] Re-run focused test and actual HTTP response verification.

### Task 2: Verification and evidence
**Files:** English/Korean worklogs, GitHub Draft PR.
- [ ] Full lint, typecheck, build, tests, contract, security, isolated PostgreSQL and E2E gates.
- [ ] Re-fetch main, check changes and CI, preserve artifacts, record RELEASE HOLD if any gate fails.
