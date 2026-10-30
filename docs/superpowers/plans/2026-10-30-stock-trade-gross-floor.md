# Stock Trade Gross Minimum Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow an authenticated member to filter their recent owner-only stock trade receipts by an exact WLD minimum without rounding or cross-account data leakage.

**Architecture:** Reuse existing 047 SECURITY DEFINER stock_my_trades for owner and bounded latest 50/100/200. Apply validated canonical gross floor with BigInt in Nest after the bounded DB read; render the same filtered result in Next; reject unverified Android responses at app gateway. Filter is scoped to the recent window and is not an all-time search.

**Tech Stack:** NestJS, Next.js, TypeScript, Vitest, PostgreSQL 17.

**Spec:** docs/planning/PROJECT_PLAN.md (English authority) and PROJECT_PLAN.ko.md (second language); this task is a small read-only member transparency extension, not an inventory or ledger change.

## Global Constraints
- Never change applied migrations or grant direct table privileges.
- Preserve authenticated+consented actor and exact integer-string WLD amounts.
- Fail closed for malformed query, duplicated parameter, and stale Android backend; private no-store/noindex.
- No Production promotion without complete exact-SHA gates and official Test E2E.

## Tasks
1. [x] Add failing tests for exact gross filtering, invalid and duplicate inputs, and owner-scoped DB invocation; run RED.
2. [x] Implement Nest parser and bounded BigInt filter, run GREEN.
3. [x] Add failing frontend input/API-path tests and implement accessible minGross field and clear action.
4. [x] Add failing Android gateway tests, validate minGross response and privacy headers; run GREEN.
5. [ ] Run target and complete gates, verify read-only PG ACL/owner function; document HOLD/rollback and PR.
