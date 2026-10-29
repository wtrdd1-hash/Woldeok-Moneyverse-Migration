# Weekly Newspaper Evidence Integrity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Follow RED-GREEN-REFACTOR and independent review.

**Goal:** Prevent fabricated weekly virtual-economy statistics and member leaderboards from being reported as live financial evidence.

**Architecture:** NestJS weekly-brief API rejects requests with typed 503 until the full report can be verified; Next.js newspaper page does not fill unavailable API data with seeded demo statistics. Retain existing public pulse and educational paths.

**Tech Stack:** NestJS 11, Next.js, TypeScript, Vitest.

**Spec:** `docs/worklog/2026-10-29-newspaper-weekly-truth-v621.md`.

## Global Constraints
- No shared/Production DB writes, no changes to financial ledger, no applied migration edits.
- Do not claim real-time market data without authenticated, source-backed evidence for every metric and leaderboard.
- Keep readable unavailability UI, no fallback fabricated values.

## Task 1 — RED tests
- [x] Backend regression: no DB, DB errors, or partial real balances cannot produce a fabricated successful weekly report.
- [x] Frontend regression: absent data renders unavailable state, never seeded M0, inflation, leaders.
- [x] Run focused tests, record RED failures.

## Task 2 — GREEN implementation
- [x] Fail-closed backend weekly-brief route with explicit error code.
- [x] Remove production seeded weekly brief fallback and add UI unavailable state.
- [x] Preserve verified fixture-based component rendering in tests; fix page API wrapper contract.
- [x] Run focused tests and review spec/implementation.

## Task 3 — Gates and publication
- [x] Run backend full, typecheck/lint/build, frontend focused/full if safe, security and API contracts.
- [x] Re-fetch main and plans, document QA and Test/Production hold, publish Draft PR.

**Release exceptions:** full frontend/Next.js build, full real-PG, official exact-SHA Test, authenticated E2E and security audit remain blocked; no merge or deploy. Prior closed C #1405 requires reconciliation before any merge.
