# Owner-scoped NPS Receipt Read Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and superpowers:test-driven-development task by task.

**Goal:** Restore member-only NPS contribution/payout receipt reads without exposing underlying pension tables to moneyverse_app.

**Architecture:** Forward-only SQL migration 309 adds two SECURITY DEFINER read functions scoped to a caller-supplied authenticated actor UUID. The Nest repository uses only these functions for historical receipts; guards retain ownership of session identity. Financial write holds and existing ledger state remain untouched.

**Tech Stack:** NestJS, PostgreSQL 17, Vitest, node:test.

**Spec:** Existing API routes /pension/my-contributions and /pension/my-payouts; P1 #1982.

## Global Constraints
- Migration 309 stacks after 307 and 308; never rewrite applied migrations.
- Strict 1–50 integer read limit; no direct table SELECT/DML grant; revoke function PUBLIC EXECUTE.
- No user-facing false empty state on API errors; frontend C owns that rendering change.
- No Test/Production or shared DB changes until release gates PASS.

## Task 1 — Repository RED/GREEN
- [ ] Write tests rejecting direct pension table reads and verifying function calls, owner and limits.
- [ ] Run RED and capture evidence.
- [ ] Implement scoped function calls with input bounds.
- [ ] Run GREEN and focused regressions.

## Task 2 — SQL/real PostgreSQL
- [ ] Write migration 309 with two owner-scoped, stable, SECURITY DEFINER functions.
- [ ] Test app-role direct SELECT refusal, owner-only result and EXECUTE grants in isolated PostgreSQL.

## Task 3 — Validation and HOLD
- [ ] Re-fetch latest main/plans and run lint/typecheck/build/contract/database/security/full tests.
- [ ] Record exact SHA, PASS/FAIL/SKIP, no merge/deploy and GitHub Draft PR HOLD.
