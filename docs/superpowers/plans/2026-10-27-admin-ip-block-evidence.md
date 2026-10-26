# Administrator IP Block Evidence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement each task with red/green tests and verification.

**Goal:** Never misrepresent failed IP-block inventory as empty, and use the actual `block_id` from the authenticated NestJS/PostgreSQL API for unblock actions.

**Architecture:** Keep the existing authenticated `requireAdminConsole` + `apiOrNull` server read, introduce a strict response boundary that accepts only the real backend `block_id` rows, and fail closed on missing/invalid inventory. Keep existing audited server actions unchanged. Display explicit retry and accessible status, mobile-friendly controls and noindex.

**Tech Stack:** Next.js server component, NestJS read contract, PostgreSQL security-definer list function, Vitest React SSR.

## Tasks
- [ ] Create failing parser/SSR regression tests for `block_id`, malformed response, API outage, empty valid list, and accessible retry.
- [ ] Run tests RED and record output.
- [ ] Implement strict inventory validation and fail-closed server page with correct block identifier.
- [ ] Run tests GREEN, full frontend suite, lint, typecheck, build, contract and security checks.
- [ ] Run real PostgreSQL/CI candidate gates, verify SHA and latest main, record blockers; merge/deploy only if all gates PASS.
