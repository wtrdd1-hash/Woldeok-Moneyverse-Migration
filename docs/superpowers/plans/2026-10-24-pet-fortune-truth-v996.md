# Deoki Pet Fortune Truth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent fabricated WLD pet fortune rewards and show only authenticated server-supplied informational fortune results.

**Architecture:** Keep the existing authenticated NestJS pet-fortune route, but explicitly return zero ledger payout and no persisted affinity, since it has no database write. Update the Next.js client and Deoki UI to render the returned quote only after a successful response; fail closed on error and do not broadcast wallet-updated events. Parent arcade notice must not claim funds.

**Tech Stack:** NestJS, Next.js, React, Vitest, existing app-api BFF.

**Spec:** `docs/worklog/2026-10-24-hourly-c-v996.md` (source evidence and acceptance).

## Global Constraints
- Existing financial ledger must never be altered or represented as credited without a transaction receipt.
- No migrations, role changes, Production/Test promotion or unrelated A/B/QA work.
- Member-only route stays authenticated, consent-checked, CSRF-protected, noindex.

## Review Focus
- API network failure: no success, retry remains possible.
- Server response lacking a valid quote: no fabricated fallback or payout.
- Duplicate click: no concurrent fortune submissions or duplicate success.
- Keyboard: Enter and Space can activate the local pet action.
- Mobile: 320px content and status announcements remain accessible.

## Task 1 — backend contract
- [x] Write failing backend test: pet/fortune both have `rewardAmount=0`, `rewardCredited=false`, `affinityGained=0`, `simulationOnly=true`, `servedAt` and no `claimedAt`.
- [x] Run RED focused test; update controller; run GREEN.

## Task 2 — browser API and UI
- [x] Write failing client tests for no wallet event and frontend tests for success/failure/keyboard.
- [x] Run RED; implement no-payout informational UI, error/retry and parent copy.
- [x] Run GREEN and accessibility checks.

## Task 3 — verification/release HOLD
- [x] Fetch origin/main and planning again; review diff for overlap.
- [x] Run exact product HEAD build/lint/typecheck/unit/integration/real-PG/security/app-api/E2E/CI as available; report SKIP/BLOCKED honestly. Release gates remain FAIL/BLOCKED; see worklog.
- [x] Push English/Korean logs and Draft PR #1089; keep main/Test/Production unchanged because gates failed.
