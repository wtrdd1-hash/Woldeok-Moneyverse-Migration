# Verified Help Result Count Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox syntax.

**Goal:** Allow visitors to select 10, 20 or 50 approved help results in one search without exposing unapproved records.

**Architecture:** Preserve existing `help_public_search(locale,category,query,limit)` SECURITY DEFINER contract. Validate the browser form on the Next server action and the independent NestJS endpoint. Android app-api continues to proxy the same POST endpoint without widening its allowlist.

**Tech Stack:** Next.js server actions, React, NestJS, PostgreSQL, Vitest.

**Spec:** `docs/planning/INTEGRATED_PLANNING_MASTER.md` and `docs/planning/PROJECT_PLAN.md`.

## Global Constraints
- Feature flag remains OFF until approved independent release gates.
- Never change an applied migration, DB role grants, ledger, or production data.
- Public search stays no-store, bounded to 50, approved-only and unexpired.

## Review Focus
- Forged string, negative and fractional limit values fail closed.
- No source approval bypass or new public API route.
- Search result count must not be mislabeled as total matches.
- Keyboard and screen-reader label remain associated with select.
- Android clients preserve existing 1..50 POST contract.

## Task 1: Test the cross-layer contract
- [x] Add failing Next server-action tests for 10/20/50 and invalid input.
- [x] Add controller and app-api allowlist tests and DB contract cap assertion.
- [x] Run tests and observe the expected RED behavior.

## Task 2: Implement the UI and server action
- [x] Add an accessible result-count selector and validated limit forwarding.
- [x] Run targeted GREEN tests, then full gates and document actual evidence.

## Task 3: Integrate safely
- [x] Recheck main/plan and concurrent PRs, preserve all branches.
- [ ] Open Draft PR with exact SHA and release HOLD rationale.
