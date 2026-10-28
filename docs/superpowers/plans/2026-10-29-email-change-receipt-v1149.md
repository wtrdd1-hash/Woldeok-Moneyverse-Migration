# Email Change Completion Receipt v1149 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent a successful login-email-change banner unless the backend returns a verified completion and session-revocation receipt.

**Architecture:** Keep the existing NestJS/PostgreSQL completion contract as the authority. Add a narrow Next.js response validator and fail-closed status rendering; never trust a TypeScript generic as runtime validation. No DB schema or ledger mutation.

**Tech Stack:** Next.js server actions, NestJS, TypeScript, Vitest, PostgreSQL.

- [ ] Write Vitest negative/positive tests for completeLoginEmailChange, including missing/contradictory receipt and invalid token.
- [ ] Confirm RED against latest main.
- [ ] Implement minimal runtime receipt validator and unverified UI state.
- [ ] Confirm GREEN with focused tests and existing auth tests.
- [ ] Check backend controller/store contract, typecheck/lint/build, whole-suite tests and CI.
- [ ] Refresh main and plan, record results, publish Draft/HOLD PR. Never merge without all release gates.
