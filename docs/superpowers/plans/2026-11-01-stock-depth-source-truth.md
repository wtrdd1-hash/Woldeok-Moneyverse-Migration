# Stock Depth Source Truth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. RED-GREEN-REFACTOR per task.

**Goal:** Remove fabricated live stock depth and execution evidence while preserving the verified quote and explicit backend availability contract.

**Architecture:** NestJS reports unavailable depth until ledger-backed orderbook exists; a no-store Next proxy fails closed. The stock UI renders only the supplied quote and accessible unavailability messaging, never generated quantities, trades, pressure, or clickable fake levels. Remove random trade notifications.

**Tech Stack:** NestJS, Next.js, React, Vitest.

**Spec:** docs/worklog/2026-11-01-hourly-c-v1261-stock-depth-source-truth.md

## Global Constraints
- No direct ledger/DB writes or schema changes.
- No main changes; independent worktree and branch.
- Do not claim actual depth/trades from price movements.
- Private no-store, noindex for depth responses; accessible responsive messaging.

## Review Focus
- API unavailable vs legitimate empty book; no false empty book.
- Missing stock id and malformed UUID.
- No simulated executions after price tick.
- Mobile 320px and keyboard/screen-reader status.
- Existing trade/order functionality unchanged.

## Task 1: Source contract
- [x] Add backend controller 503 regression test; run RED.
- [x] Implement explicit public unavailable depth endpoint; run GREEN.
- [x] Add Next route tests for 503 and malformed ID; run RED.
- [x] Implement no-store fail-closed Next proxy; run GREEN.

## Task 2: Frontend truth
- [x] Add regression tests for absent fabricated depth/trades and accessible status; run RED.
- [x] Replace synthetic depth with quote-only unavailability view; remove fake trade toast.
- [x] Update obsolete synthetic data tests and run GREEN.

## Task 3: Verify and preserve
- [x] Run exact HEAD gates, record pass/fail/blocked without claiming skipped tests.
- [x] Fetch main/plan at mid/end; preserve changes as Draft PR, never merge with failing gates.
