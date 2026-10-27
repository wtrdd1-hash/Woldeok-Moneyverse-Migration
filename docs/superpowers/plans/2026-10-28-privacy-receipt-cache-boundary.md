# Private Privacy Request Receipt Cache Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans with RED/GREEN checks and verification-before-completion.

**Goal:** Prevent one member's privacy-request details and receipts from being cached or re-served to another account on web or Android, including gateway errors.

**Architecture:** Keep existing session/consent/CSRF guards and owner-scoped SECURITY DEFINER database functions unchanged. Mark Nest privacy responses private/no-store; force Android app-api privacy responses and failures to no-store independent of upstream headers; preserve the member page's noindex and dynamic rendering and make the cache boundary explicit. Test DB owner and replay invariants in isolated PostgreSQL, never shared development or production.

**Tech Stack:** NestJS, Next.js, Vitest, PostgreSQL 17.

## Tasks
- [ ] Add RED HTTP/controller response-header tests and Android gateway tests for success, 401/403, 426, 502 and upstream cache overrides.
- [ ] Add RED page regression for private dynamic and no-store fetch; implement minimal web/backend/gateway changes.
- [ ] Verify PostgreSQL owner-only request list and idempotent receipt with synthetic users in disposable PostgreSQL, with no migration edits.
- [ ] Run focused and full tests, lint, typecheck, build, contract, security audit, E2E/SEO/a11y where available; record PASS/FAIL/SKIP with exact SHA.
- [ ] Refresh main/plans at midpoint and before PR; only merge if full release gates pass. Keep production HOLD otherwise.

**Rollback:** Revert application-only change; existing privacy request records and ledger remain unchanged.
