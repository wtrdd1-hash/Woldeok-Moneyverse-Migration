# Stock Halt Atomicity Containment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent non-atomic stock halt settlement and repeated treasury deductions through all NestJS and admin browser paths.

**Architecture:** The existing two independent SQL calls cannot be made ledger-atomic by a TypeScript catch. Fail closed before any SQL mutation at the repository boundary and disable the admin mutation flow while keeping read-only status/receipt queries available. A separate additive PostgreSQL migration with an immutable stock-halt funding receipt is required before re-enablement.

**Tech Stack:** NestJS, TypeScript, Vitest, Next.js, PostgreSQL.

**Spec:** Existing migrations 221 and 224, AGENTS.md financial invariants; new observed defect documented in worklog.

## Global Constraints
- Do not edit applied migrations or grant app table DML.
- Do not mutate any live or shared database; isolated test data only.
- Preserve existing API routes, session/role/CSRF/reauth guards and status reads.
- Production and main merge remain HOLD until all required gates pass.

## Review Focus
- Repeated halt event must not debit treasury again.
- Retry with a new event must not bypass the hold.
- Repository must not query SQL before refusing, even if DB is unavailable.
- Admin UI must not display successful settlement or enable an unsafe write.
- Existing read-only halt status and receipt queries must still function.

### Task 1: Backend containment
- [x] Add failing tests for first halt and retry, verifying 503 and zero SQL queries.
- [x] Run RED tests and capture failures.
- [x] Implement minimal fail-closed repository behavior.
- [x] Run GREEN focused and integration tests.

### Task 2: Admin UX
- [x] Add regression assertion for unavailable admin action.
- [x] Disable mutation entry points and show explicit financial safety hold.
- [x] Verify no misleading success response.

### Task 3: Verification and handoff
- [x] Run lint, typecheck, tests, build, security, API contract, real PG read-only checks.
- [x] Re-fetch latest main and project plans; record divergence.
- [ ] Commit/push Draft+hold PR with evidence and no merge/deploy.
