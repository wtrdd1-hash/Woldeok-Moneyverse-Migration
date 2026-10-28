# SWF Manual Liquidation Financial Safety Hold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Apply TDD and verification-before-completion.

**Goal:** Prevent direct SWF manual liquidation from modifying synthetic portfolio valuations and Treasury vault balances without canonical, balanced, replay-safe ledger settlement.

**Architecture:** Keep existing authenticated admin route and read-only SWF endpoints. Remove the internal manual liquidation SQL and emit a typed HTTP 503 at the service boundary regardless of runtime flags. Do not touch migrations or live data.

**Tech Stack:** NestJS, TypeScript, Vitest, PostgreSQL (no live writes).

**Spec:** `docs/worklog/2026-10-28-backend-v617-swf-liquidation-ledger-hold.md`; source issue #1275 and closed prior PR #1265.

## Global Constraints
- Preserve ledger authority, immutable migrations, role ACL, user privacy, and current main.
- No new app DML grants, no simulated successful liquidation, no automatic Production deployment.
- Coordinate web/admin disabled-state and existing closed #1245 with A/C.

## Review Focus
- Enabled SWF runtime flag must not bypass the hold.
- Disabled SWF runtime flag must not bypass the hold.
- Direct service calls must not connect to DB or send Discord success messages.
- Admin HTTP POST must return 503 with stable code `SWF_LEDGER_SETTLEMENT_UNAVAILABLE`.
- Removed method must not retain direct vault/portfolio UPDATE SQL.

## Task 1 — Test first
- [x] Add `backend/src/admin/treasury/auto-swf-liquidation-hold.test.ts` with service/SQL tests.
- [x] Run RED (4 failures on unmodified main).
- [x] Remove legacy SQL, return typed 503 from service.
- [x] Run GREEN and add HTTP 503 integration regression (5 PASS).

## Task 2 — Verification and release safety
- [x] Run backend suite, DB package tests, API contracts, typecheck, lint, build, security policy tests.
- [x] Confirm dependency audit failure is separately owned by QA Draft #1687.
- [ ] Isolated real PostgreSQL/ACL and official Test exact-SHA auth/admin/finance E2E (BLOCKED).
- [ ] Frontend/Android unavailable-state parity and full Next.js build (BLOCKED).
- [ ] Approved merge and GitOps release (BLOCKED; do not proceed).
