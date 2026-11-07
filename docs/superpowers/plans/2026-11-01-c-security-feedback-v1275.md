# Account Security Feedback Integrity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent URL query parameters from fabricating successful account-security operations.

**Architecture:** Preserve authenticated NestJS mutation receipts and session readback. On the Next.js member security page, treat navigation query params only as hints to recheck server evidence, never as evidence of completed credential changes or revoked counts.

**Tech Stack:** Next.js server component, Vitest, React server markup, NestJS authenticated session API.

**Spec:** docs/worklog/2026-11-01-c-security-feedback-v1275.md

## Global Constraints
- Independent main-based worktree; no direct main edits, migrations, ledger writes or production changes.
- Mobile 320px, keyboard/screen reader, private noindex; existing server actions and session/CSRF protections remain.

## Task 1 — Regression and implementation
- [x] Add failing forged-URL tests for revocation count, session success, password change, reauthentication, email request.
- [x] Run focused test and observe failure.
- [x] Change page notices to truthful prompts and display authenticated session readback only when verified.
- [x] Re-run focused and adjacent security tests.

## Task 2 — Verification and release hold
- [x] Run candidate lint/typecheck/build/unit/contract/app-api/isolated PostgreSQL/security; record failed and blocked E2E/release gates.
- [x] Fetch main at midpoint and before PR; preserve unrelated branches.
- [x] Push draft PR and record evidence/blockers; no merge/deploy unless every release gate passes.
