# Burn-draw ledger containment implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent unjournaled WLD burns and fabricated title receipts while the burn draw lacks canonical, idempotent Economy Core settlement.

**Architecture:** Fail closed at Nest POST and Next BFF POST; retain verified GET history. Replace the legacy SECURITY DEFINER function in a new, forward-only SQL migration and revoke application EXECUTE. Present the unavailable state instead of a live burn CTA.

**Tech Stack:** NestJS, Next.js, PostgreSQL 17, Vitest, Supertest.

**Spec:** `AGENTS.md` economy-post-transaction invariant and `docs/planning/PROJECT_PLAN.md` exact-money policy.

## Global Constraints
- No balance mutation, no legacy migration edits, no new grants, no Production/Test deployment until exact-SHA gates pass.
- Preserve user-facing Korean copy outside the disabled unsafe action; do not imply historical burns are verified by the new change.

## Review Focus
- Direct SQL EXECUTE by `moneyverse_app` must fail.
- POST without authentication must not reach SQL.
- POST with authentication must return explicit 503, never a success receipt.
- Public GET history must not become fabricated zero on upstream failure.
- The UI must not invite an unverified WLD debit.

## Task 1 — RED tests
- [x] Add backend HTTP test for POST 503/no SQL; Next BFF contract test; SQL migration contract test.
- [x] Execute RED and capture failures.

## Task 2 — Safe implementation
- [x] Replace POST handler with fail-closed 503; Next BFF POST with explicit 503.
- [x] Disable unverified burn CTA in UI.
- [x] Create migration 324 to replace legacy function body with 55000 and revoke EXECUTE.
- [x] Run GREEN and review diffs.

## Task 3 — Verification and release hold
- [x] Run isolated PG17 migration and app-role function privilege test.
- [x] Run lint/typecheck/build/targeted+full tests; record failed full backend, audit and incomplete CI/Test exact-SHA as release blockers.
- [x] Record failures, publish Draft PR #2403/HOLD and issue #2404; no merge or promotion.
