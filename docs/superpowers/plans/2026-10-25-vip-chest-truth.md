# VIP Chest Truthful Receipt Safety Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

## Goal
Prevent a non-Plus member from seeing or claiming an invented VIP 2,000 WLD + dice payout; fail closed until owner-bound entitlement and ledger-backed receipt exist.

## Task 1 — Backend contract
- [x] Add controller tests for GET unavailable/unknown entitlement and POST 503 with no receipt, including injected repository case.
- [x] Run RED targeted tests.
- [x] Change controller GET to explicit unavailable status; POST to ServiceUnavailableException. No DB writes, no new grants.
- [x] Run GREEN targeted tests.

## Task 2 — Member-facing frontend
- [x] Add component tests for unavailable/failed status, no claim button or fabricated receipt, keyboard/screen-reader semantics.
- [x] Run RED targeted tests.
- [x] Consume authenticated backend status on server-rendered `/quests`; show disabled card with honest explanation and no browser claim call.
- [x] Run GREEN tests and typecheck.

## Task 3 — Verification and release hold
- [x] Re-fetch remote main/EN+KO plan; check for overlap.
- [x] Run exact HEAD lint/typecheck/tests/security/build/contract and isolated real-PG CI; record actual failures/skips (release HOLD).
- [x] Confirm official Test candidate SHA before authenticated E2E; mismatch => BLOCKED.
- [x] Push worklog and Draft PR with hold conditions; no main merge or Production release on failure.
