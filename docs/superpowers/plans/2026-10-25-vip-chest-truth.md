# VIP Chest Truthful Receipt Safety Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

## Goal
Prevent a non-Plus member from seeing or claiming an invented VIP 2,000 WLD + dice payout; fail closed until owner-bound entitlement and ledger-backed receipt exist.

## Task 1 — Backend contract
- [ ] Add controller tests for GET unavailable/unknown entitlement and POST 503 with no receipt, including injected repository case.
- [ ] Run RED targeted tests.
- [ ] Change controller GET to explicit unavailable status; POST to ServiceUnavailableException. No DB writes, no new grants.
- [ ] Run GREEN targeted tests.

## Task 2 — Member-facing frontend
- [ ] Add component tests for unavailable/failed status, no claim button or fabricated receipt, keyboard/screen-reader semantics.
- [ ] Run RED targeted tests.
- [ ] Consume authenticated backend status on server-rendered `/quests`; show disabled card with honest explanation and no browser claim call.
- [ ] Run GREEN tests and typecheck.

## Task 3 — Verification and release hold
- [ ] Re-fetch remote main/EN+KO plan; check for overlap.
- [ ] Run exact HEAD lint/typecheck/tests/security/build/contract and isolated real-PG CI; record actual failures/skips.
- [ ] Confirm official Test candidate SHA before authenticated E2E; do not promote if mismatched.
- [ ] Push worklog and Draft PR with hold conditions; no main merge or Production release on failure.
