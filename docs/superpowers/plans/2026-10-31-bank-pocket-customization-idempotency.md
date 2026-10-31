# Bank Pocket Customization Idempotency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the fixed nil idempotency key from potentially WLD-charging pocket customization and retain an intent-bound UUID across ambiguous retries.

**Architecture:** The browser generates one UUIDv4 per pocket/theme/icon intent, posts it as hidden form data, and retains it on identical retry. The Next server action validates and forwards that exact UUID; the Nest DTO requires a non-nil UUIDv4 and the controller passes it to the existing owner-scoped repository. No SQL/ledger/schema modifications.

**Tech Stack:** Next.js server actions, React, NestJS/class-validator, Vitest, PostgreSQL existing function contract.

**Spec:** `docs/planning/PROJECT_PLAN.md` finance idempotency and release HOLD; existing `backend/src/bank/pocket.controller.ts` and `frontend/src/app/bank/actions.ts`.

## Global Constraints
- Existing bank function is NOT confirmed in fresh schema; DB/financial E2E and release remain BLOCKED until source function and exact-SHA tests verified.
- Do not regenerate keys in server actions or retry handlers; do not use the nil UUID. No direct DB changes.
- Separate worktree, tests RED then GREEN, final SHA verification, Draft/HOLD PR only.

## Review Focus
- Missing, nil, malformed or non-v4 UUID must not reach backend.
- Two different intents must not share a key; unchanged retries must retain it.
- Account/pocket switch and reopening must rotate the key.
- Mutation failure must not report success or silently retry with a new key.
- Existing frontend/Backend/DB contracts and other developers' work must remain untouched.

### Task 1: Nest boundary
- [x] Add failing controller and DTO tests for caller key and invalid UUID.
- [x] Verify RED; require UUIDv4 on DTO and pass through in controller.
- [x] Verify GREEN and focused bank tests.

### Task 2: Next action and browser intent
- [x] Add failing server-action and UI tests for stable caller key and changed intent.
- [x] Verify RED; forward validated key and generate intent key in dialog.
- [x] Verify GREEN and focused frontend tests.

### Task 3: Verification and release HOLD
- [x] Re-fetch main and plans; lint/typecheck/build, focused and full tests, DB/security/API gates as feasible.
- [ ] Review diff, commit/push Draft PR and log final SHA, blocked exact-SHA Test and Production.
