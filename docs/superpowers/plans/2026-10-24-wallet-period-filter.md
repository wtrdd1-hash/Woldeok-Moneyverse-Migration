# Wallet Activity Period Filter — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Follow TDD RED→GREEN and verify exact SHA.

**Goal:** Allow an authenticated member to narrow their own wallet activity to a verified rolling 7-, 30-, or 90-day period without confusing the existing 50-entry cap with complete history.

**Architecture:** Extend the existing owner-scoped `GET /api/v1/wallet` read path with optional `period=7d|30d|90d`, computing the cutoff with an injectable server clock, parameterizing the cutoff in the PostgreSQL query before LIMIT. Keep current balances, no-period behavior, CSRF/session guards, and amount precision unchanged. Expose an accessible link-based selector on `/wallet/activity`; Android app-api passes the query and cookies through without public caching. No new migration or ledger write.

**Tech Stack:** NestJS, TypeScript, PostgreSQL read-only, Next.js App Router, Vitest.

**Spec:** This plan; user-authorized P1 wallet history usability improvement, separate from pending category/direction/pagination PRs.

## Global Constraints
- Work only on a fresh `auto/hourly-*` branch/worktree based on latest main; protect all other PR heads and migrations.
- Reject unsupported periods with HTTP 400; never accept actor IDs from query parameters.
- Filter before LIMIT, with exact timestamps and parameterized SQL; do not use JS Number for WLD.
- Preserve existing default response and current 50-entry ceiling; show that ceiling truthfully.
- No production/Test writes, no role changes, no migration edits, no merge without full CI and isolated Test evidence.

## Task 1 — Backend contract and SQL (TDD)
- [ ] Add failing service/controller/repository tests for cutoff, bad input, owner isolation, SQL parameter order and 50 limit.
- [ ] Run tests and record RED.
- [ ] Implement minimal service/controller/repository changes; run GREEN.
- [ ] Recheck source main SHA and plan before frontend work.

## Task 2 — Frontend and Android compatibility (TDD)
- [ ] Add failing selector and app-api forwarding/cache tests.
- [ ] Run RED, implement accessible selector, then run GREEN.
- [ ] Verify no untrusted period reaches the backend from the server page.

## Task 3 — Verify and handoff
- [ ] Run focused, full test/typecheck/build/lint/security/API contract, DB read-only SQL and exact-SHA remote CI.
- [ ] Record all failures, skipped gates, file changes, branch counts, SHA and rollback; do not merge or deploy on failure.
- [ ] Commit, push and create Draft PR; preserve other branches and PRs.
