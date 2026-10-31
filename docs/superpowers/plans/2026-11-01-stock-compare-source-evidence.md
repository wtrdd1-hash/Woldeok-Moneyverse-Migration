# Stock Comparison Source Evidence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent member comparison of malformed or duplicate virtual stock market evidence without inventing prices or freshness.

**Architecture:** Keep the existing Nest GET `/api/v1/stocks` and PostgreSQL `stock_market_overview()` read-only contract. Validate the entire response in a pure server-side parser before passing trusted records to the existing comparison client. Fail closed with an accessible retry affordance. No schema, balance, or mutation changes.

**Tech Stack:** Next.js server components, TypeScript, Vitest, existing NestJS/PostgreSQL read API.

## Task 1: TDD evidence validation
- [ ] Add `frontend/src/app/stocks/compare/stock-comparison-source.test.ts` with valid, empty, malformed, duplicated and large integer cases.
- [ ] Run the focused test and observe failures (RED).
- [ ] Add `frontend/src/app/stocks/compare/stock-comparison-source.ts` implementing the minimal pure parser.
- [ ] Run focused tests (GREEN).

## Task 2: Page integration and user evidence
- [ ] Update `frontend/src/app/stocks/compare/page.tsx` to parse unknown API data, show unavailable/verified-empty separately, add accessible retry, and never claim unverified real-time freshness.
- [ ] Update comparison client copy only where needed to avoid false real-time claims.
- [ ] Add page-specific tests and verify focused regression.

## Task 3: Verification and release control
- [ ] Re-fetch main, inspect overlap, execute exact HEAD gates and record PASS/FAIL/BLOCKED individually.
- [ ] Update English canonical and Korean worklog; commit/push isolated branch and open Draft PR only if safe.
- [ ] Keep main/Test/Production unchanged unless every required release gate passes.
