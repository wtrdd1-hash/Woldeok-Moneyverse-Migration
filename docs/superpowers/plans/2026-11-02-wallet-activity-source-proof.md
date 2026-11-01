# Wallet Activity Source Proof Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans; follow RED-GREEN-REFACTOR and review before claiming completion.

**Goal:** Never render unverifiable owner wallet activity as confirmed ledger records, including when no calendar range is selected.

**Architecture:** Keep the existing authenticated NestJS owner-bound read and PostgreSQL functions. Add a pure runtime validator for the HTTP page shape and filters; gate server-rendered UI on it. Preserve independent page-summary verification, exact string WLD arithmetic and current cursor semantics. No new write or DB schema.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, NestJS, PostgreSQL.

**Spec:** `docs/worklog/2026-11-02-c-v1282-wallet-activity-source-proof.md`.

## Tasks
1. [x] Write failing tests in `frontend/src/app/wallet/activity/source-proof.test.tsx` and `frontend/src/lib/wallet-activity-proof.test.ts`: malformed HTTP 200, duplicate rows, invalid signed WLD, mismatched direction, bad cursor, valid zero-net owner transfer and bounded page.
2. [x] Run focused tests and capture RED output.
3. [x] Implement `frontend/src/lib/wallet-activity-proof.ts` using strict structural, temporal and integer-string checks; use it in `frontend/src/app/wallet/activity/page.tsx` for every query, then re-run GREEN tests.
4. [ ] Run affected frontend, backend HTTP contract, lint, typecheck, builds, unit/integration, app-api, security and disposable PostgreSQL gates. Re-run after any change.
5. [ ] Fetch main/planning mid and pre-merge, record exact SHA and CI. Publish Draft PR and HOLD on any missing gate. Preserve other workers and release state.
