# SOE Dividend Remittance Atomicity, Concurrency and UI Retry — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close open P0 #1080 without reusing the closed PR #1091 branch, preserving real operator retry keys, atomic DB receipts and browser flow integrity.

**Architecture:** An additive, unapplied migration exposes one privileged atomic PostgreSQL function with actor-bound replay, vault locking, period uniqueness, and append-only ledger. NestJS forwards an explicit idempotency UUID; the Next server action validates the receipt and refreshes persisted logs; the client retains one UUID across ambiguous failures and generates a new UUID only after confirmed success. Retire unauthenticated browser mutation proxies. This branch is independent of B499 release gate, A dependency/SEO, C support and QA.

**Tech Stack:** PostgreSQL 17, NestJS, Next.js, TypeScript, Vitest.

**Spec:** GitHub Issue #1080 and earlier unmerged Draft PRs #1091/#1079, reviewed as references only.

## Global Constraints
- No production-connected DB writes (host 5433 is Production-connected), no applied migration edits, no main direct writes.
- New migration 280 only while origin/main ends at 279; recheck before PR/merge.
- All release gates including real isolated PG, full CI, official Test exact SHA, GitOps and smoke must PASS before merging/deploying; otherwise HOLD.
- Do not touch other automation schedules or worktrees.

## Tasks
1. [x] Add failing backend unit tests for single DB function, stable replay, actor binding and receipt validation; record RED.
2. [x] Implement additive migration and backend function call; record GREEN.
3. [x] Add failing frontend tests for secure server action, explicit retry key and persisted history; record RED then implement; verify GREEN.
4. [ ] Exercise isolated PostgreSQL with concurrent distinct/same keys and rollback, never host 5433.
5. [ ] Run lint, typecheck, build, full tests, security, API contracts and CI; record exact SHA, blockers and evidence.
6. [ ] Refresh main and planning; Draft PR only until every required gate passes; Production HOLD.
