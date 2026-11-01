# Newspaper Market Source Integrity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent the public newspaper from inventing market health, quotes, and community poll receipts when backend evidence is missing.

**Architecture:** Existing PostgreSQL SECURITY DEFINER market reads remain the authority through NestJS `/api/v1/stocks/market-events` and `/api/v1/stocks`. Validate unknown Next server responses before passing them to the client; preserve verified empty lists separately from unavailable reads. Remove browser-only poll tally and synthetic chart, since no durable poll or tick-series contract exists.

**Tech Stack:** Next.js App Router, React, Vitest, NestJS existing read APIs, PostgreSQL existing stock functions.

**Spec:** `AGENTS.md`, `docs/planning/PROJECT_PLAN.md`, `docs/features/stocks.md`; existing `frontend/src/app/newspaper`.

## Global Constraints
- English canonical code and documentation; Korean worklog translation.
- Do not modify SQL, money movement, production or shared test data.
- Do not grant direct stock table privileges; use existing backend SECURITY DEFINER reads.
- No synthetic financial or polling metrics; errors are not zero results.
- Preserve mobile layout, accessible retry/status, and public SEO semantics.
- All changes isolated on a fresh origin/main-based worktree and draft PR.

## Review Focus
- Invalid WLD strings must not reach BigInt or groupDigits.
- API 503 and malformed 200 cannot masquerade as an empty market.
- Verified empty events must not claim market stability or successful trading.
- Client-local votes must never appear as community totals.
- A two-point quote must not be rendered as a real tick-history chart.

### Task 1: Source evidence boundary
- [x] Add failing parser tests for valid/invalid stock/event API payloads and empty/unavailable distinction.
- [x] Observe RED.
- [x] Implement bounded strict validators for API-backed newspaper props.
- [x] Observe GREEN.

### Task 2: Truthful public UI
- [x] Add failing component/page tests for unavailable, empty, synthetic poll and chart.
- [x] Observe RED.
- [x] Replace fabricated market/poll states with accessible source-status and retry.
- [x] Observe GREEN.

### Task 3: Verification and release discipline
- [x] Run exact HEAD focused tests, lint, typecheck, build, full suites, DB/API/CI/E2E where possible.
- [x] Fetch main during work and before any merge; record gate outcomes and blockers.
- [ ] Publish a draft PR only; merge/promote only with all required gates PASS.
