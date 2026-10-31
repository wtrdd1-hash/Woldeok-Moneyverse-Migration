# Status Response Truth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and test-driven-development.

**Goal:** Prevent malformed or inconsistent public status API responses from being presented as current service health.

**Architecture:** Keep NestJS's `status-v1` freshness policy authoritative. Parse the untrusted Next boundary response into a bounded typed list, returning unavailable on any malformed row rather than dropping an outage. Preserve accessible read-only page and SEO policy.

**Tech Stack:** Next.js 16, TypeScript, Vitest, existing NestJS `/api/v1/status`.

- [x] Add RED tests in `frontend/src/lib/status-response.test.ts` for malformed envelopes, duplicate keys, inconsistent freshness, valid empty and populated responses.
- [x] Add `frontend/src/lib/status-response.ts` parser and integrate in `frontend/src/app/status/page.tsx` without changing backend or database contracts.
- [x] Run focused Vitest; inspect existing static status regression tests and update only if semantics require.
- [ ] Run exact-HEAD lint/typecheck/build/unit/integration/security/app-api/isolated DB/E2E where possible; record any blockers and do not promote if any gate fails.
