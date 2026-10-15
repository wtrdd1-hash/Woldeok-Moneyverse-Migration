# Treasury Reconciliation Evidence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [x]`) for tracking.

**Goal:** Replace fabricated Treasury 'RECONCILED/0' indicators with demonstrable fiscal journal evidence and an explicit unverified state, without moving money.

**Architecture:** The Nest repository computes one consistent PostgreSQL statement joining vault balances to independently derived journal net movement and continuity. Overview reuses the same read method; the admin frontend accepts distinct discrepancy / unverified outcomes.

**Tech Stack:** Node 20 / NestJS / TypeScript / PostgreSQL 17 / Vitest / Next.js.

**Spec:** [English](../specs/2026-10-15-treasury-finance-evidence-v678.md) · [한국어](../specs/2026-10-15-treasury-finance-evidence-v678.ko.md).

## Global Constraints
- Keep the operational money and DB untouched. No migrations or DB broad grants in v678.
- English primary docs and Korean mirror; decimal integer strings over Number.
- `UNVERIFIED` is not `RECONCILED`. Do not claim a cross-Economy Core bridge exists.
- Follow exact-SHA isolation, fail closed, and no deploy before Test evidence.

## Review Focus
- Different vault errors net to zero: use per-vault absolute deltas.
- Previous ledger `balance_after` and next `balance_before` differ: detect.
- Positive amount but `balance_after==balance_before`: detect missing cash movement.
- Missing ledger rows for nonzero vault: flag.
- Large amounts beyond 2^53: no JS Number precision loss.

## Task 1: Backend repository authoritative read
**Files:** `backend/src/admin/treasury/treasury.repository.ts`, `backend/src/admin/treasury/treasury.repository.test.ts`.
- [x] Write red tests with typed fake Queryable: matching journal cannot return RECONCILED; mismatched vault, broken chain, and opposite vault errors; query is SELECT-only.
- [x] Run the targeted tests and capture expected failure.
- [x] Implement one read-only query returning per-vault aggregate journal movement/continuity and missing-cash movement checks; type `UNVERIFIED`, integrity issues count.
- [x] Update overview to reuse reconciliation and never assert spendable funds until verified.
- [x] Targeted tests green and backend typecheck.

## Task 2: UI and cross-contract
**Files:** `frontend/src/app/admin/types.ts`, `frontend/src/app/admin/treasury/treasury-view.tsx`, `frontend/src/app/admin/treasury/treasury-view.test.tsx`.
- [x] Write red UI cases for unverified and observed discrepancy without green normal label.
- [x] Add distinct Korean warning badges/labels and non-green difference when unverified.
- [x] Frontend focused Vitest, typecheck if supported.

## Task 3: Release evidence
**Files:** `docs/worklog/2026-10-15-treasury-reconciliation-v678.{md,ko.md}`, `docs/updates/v2026.10.15.678-{internal,github}.{md,ko.md}`.
- [x] Record start/intermediate/main recheck plus exact test results, limitations, no money movement.
- [x] Verify staged diff, run backend build and change-impact tests and docs classifier.
- [ ] Push named branch and open draft PR; do not merge or Production promote without same exact-SHA Test DB/API, auth/session and rollback gates.

**Verification boundary:** source/isolated unit tests and Webpack build passed. Actual Test PostgreSQL, security negatives and Production zero-downtime gates were not executed and remain STOP conditions.
