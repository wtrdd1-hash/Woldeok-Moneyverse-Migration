# Real-estate source-truth hold implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Block fabricated real-estate ownership, bids, and WLD payout claims.
**Architecture:** Nest and Next reject unverified real-estate reads/writes at the API boundary; client shows unavailable state without synthetic balances.
**Tech Stack:** NestJS, Next.js, Vitest, PostgreSQL (read-only verification).
**Spec:** `docs/superpowers/specs/2026-11-02-real-estate-financial-source-truth.md`.

## Global constraints
No production writes; immutable migrations; no ledger mutation; session/consent preserved; fail closed with HTTP 503; independent worktree and release HOLD.

## Review focus
Unauthenticated mutation remains 401; authenticated mutation cannot return a receipt; fake owner holdings cannot be read; Next response is uncacheable; UI must not display stale or synthetic dividends after upstream 503.

### Task 1 — Nest API
- [ ] Add failing tests for real-estate GET and POST success paths.
- [ ] Run tests and record RED.
- [ ] Replace fabricated read/financial responses with explicit 503 errors.
- [ ] Run tests and record GREEN.

### Task 2 — Next API
- [ ] Add failing tests for fake auction and rent claims.
- [ ] Run RED.
- [ ] Replace mock handlers with fail-closed private responses.
- [ ] Run GREEN.

### Task 3 — UI and gates
- [ ] Test unavailable browser state.
- [ ] Remove synthetic shares, yields and fallback payouts.
- [ ] Run focused/full tests, build, lint/typecheck, real DB and CI; record blockers without bypassing release gates.
