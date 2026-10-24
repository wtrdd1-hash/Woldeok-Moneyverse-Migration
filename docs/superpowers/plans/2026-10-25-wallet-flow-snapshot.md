# Owner-only Recent Wallet Flow Snapshot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task, with RED-GREEN-REFACTOR.

**Goal:** Provide an owner-only recent-50 WLD cash-flow summary without pretending that the sample is a full account statement.

**Architecture:** Reuse `recentTransactionsForUser(actor,50)` owner-scoped PostgreSQL ledger projection. Compute income/outgoing/net as canonical integer strings with BigInt, excluding internal cash↔bank transfers from external flow. Expose GET `/api/v1/wallet/flow-summary` behind existing session/auth/consent guards, `private, no-store`; member page `/wallet/flows` and existing Android `/app-api/v1/wallet/flow-summary` gateway. No DB write/migration or new table grant.

**Tech Stack:** NestJS, Next.js, TypeScript, PostgreSQL, Vitest.

**Spec:** This plan and `docs/worklog/2026-10-25-hourly-a-wallet-flow-0225.md` (bounded delegated feature selection).

## Tasks
1. [ ] Write backend failing tests for owner ID, signed large WLD, internal pocket move, invalid projection, DB unavailable; run RED.
2. [ ] Implement service aggregation and guarded GET route; run GREEN.
3. [ ] Write frontend/gateway tests for noindex, verified recent-window copy, error/empty state and Android path; run RED.
4. [ ] Implement member page, navigation, and Android contract coverage; run GREEN.
5. [ ] Verify focused tests, full lint/typecheck/build/test, real isolated PG read-only, security/a11y/SEO/E2E and exact-SHA CI; update logs and release HOLD evidence. Do not merge on failure.
