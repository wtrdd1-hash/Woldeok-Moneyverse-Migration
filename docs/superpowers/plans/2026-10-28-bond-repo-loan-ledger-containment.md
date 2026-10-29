# Bond Repo-Loan Ledger Containment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development and superpowers:verification-before-completion.

**Goal:** Stop member repo-loan borrow/repay from mutating USER_CASH outside the authoritative double-entry ledger.

**Architecture:** Retain GET holdings and loan-history routes. Fail closed on both financial POSTs at HTTP, service and repository layers, without touching live SQL. A later forward-only migration must implement atomic ledger settlement and idempotency receipts; this PR is not a completed loan feature.

**Tech Stack:** NestJS, TypeScript, Vitest, PostgreSQL (no schema changes).

**Spec:** GitHub issue #1151 and AGENTS.md economy invariants.

## Global Constraints
- No applied migration edits, DB writes, Production/Test deployment, shared branch cleanup or balance changes.
- Independent latest-main branch/worktree; protect A/C/QA and prior recovery branches.
- Fail closed with HTTP 503; retain consent and CSRF guards, existing read-only contracts and owner checks.

## Review Focus
- Replayed borrow/repay calls must never reach service or DB.
- Malformed and missing body values must not bypass hold.
- Internal service and repository callers must not bypass hold.
- Member GET loan history must still work.
- This containment does not fix broad app-role DML, SQL authority, or frontend/Android unavailable UX.

### Task 1 — Test and implement HTTP/service containment
- [x] Add failing HTTP and service tests for borrow and repay, including guard metadata and GET preservation.
- [x] Run focused tests; record RED failure.
- [x] Implement HTTP 503 and service-level fail-closed behavior.
- [x] Run focused tests; record GREEN.

### Task 2 — Repository defense in depth and verification
- [x] Add failing repository tests asserting no Pool connection for borrow/repay.
- [x] Run tests; record RED.
- [x] Remove direct-balance mutation implementations and fail closed before SQL.
- [x] Run focused and broader gates, record exact SHA, limitations, review and PR.

**Gate disposition:** Source-level containment implemented and focused tests pass; release BLOCKED by full frontend/DB/Test/E2E verification and Moderate `qs` advisory. Do not claim end-to-end functionality.
