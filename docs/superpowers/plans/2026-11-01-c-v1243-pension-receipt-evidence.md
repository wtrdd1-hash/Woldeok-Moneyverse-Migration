# Member Pension Receipt Source Evidence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show authenticated members verified pension contribution/payout receipts even when the separate pension account or wallet read fails, without rendering fabricated zero amounts or empty histories.

**Architecture:** Use the existing NestJS owner-scoped pension receipt APIs and PostgreSQL SECURITY DEFINER functions from migration 309. Independently fetch each resource with allSettled; parse the unknown DTOs at the Next server boundary, pass evidence flags to the existing responsive client and suppress any unverified balance, account status or history count. No schema, ledger or transaction changes.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Vitest, NestJS, PostgreSQL 17.

**Spec:** This plan is the conservative implementation spec for the existing /pension member read UX; authoritative living plans docs/planning/PROJECT_PLAN.md and PROJECT_PLAN.ko.md remain unchanged.

## Global Constraints
- English source and documentation; Korean UI copy and Korean supplemental log.
- Owner identity is enforced by the Nest session guard and public.pension_owner_contributions / pension_owner_payout_logs functions; never grant table SELECT.
- BigInt-safe canonical WLD strings; no inferred zero, no stale-success claim, no financial mutation.
- Mobile >=320px, accessible alert/retry and keyboard focus; private noindex/no-store at real HTTP boundary.
- Preserve the unconditional pension financial settlement hold; release requires all exact-SHA gates.

## Review Focus
1. Account read 503 while both receipt reads succeed: both receipt histories remain visible and correctly labelled.
2. One receipt API fails: no invented zero count, no empty-state message for that category; the other remains visible.
3. Malformed amount, date, duplicate UUID or cross-owner receipt: entire affected list becomes unavailable.
4. Wallet failure: no 0 WLD available balance; public overview failure remains explicitly unknown.
5. Signed-out/unknown session: no authenticated receipt data or false login-success claims.

## Tasks
### Task 1: Source contract and independent fetching
- [ ] Add failing unit tests for per-resource failure isolation, valid empty results, malformed payloads and owner-scoped data.
- [ ] Run RED test; implement server-side validation and independent fetch; run GREEN test.
- [ ] Review existing NestJS owner receipt functions and ACL without changing DB contracts.

### Task 2: Accessible member evidence UI
- [ ] Add failing component tests for unknown account, wallet and receipt histories.
- [ ] Run RED; update page to pass evidence flags and client to distinguish unavailable from verified-empty.
- [ ] Run GREEN, verify no financial mutation is enabled, inspect 320px and keyboard/ARIA semantics.

### Task 3: Verification and release gate
- [ ] Run exact HEAD lint/typecheck/build/unit/integration/real PostgreSQL/security/app-api/E2E and repository CI.
- [ ] Re-fetch main and planning docs at midpoint and before any merge.
- [ ] Update EN/KO worklog and update logs, push branch and create Draft PR if any required gate remains incomplete.
- [ ] Merge only if all required gates PASS; otherwise preserve branch and block Test/Production.
