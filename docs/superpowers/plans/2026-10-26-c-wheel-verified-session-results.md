# Wheel Verified Session Results Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Tasks follow RED-GREEN-REFACTOR.

**Goal:** Remove fabricated recent wheel spins and display only genuine server-verified current-session receipts.

**Architecture:** Existing Next server action calls Nest casino theme play. Require UUID play/transaction receipts and valid wheel outcome before exposing success; the client uses those confirmed receipts only, never a hardcoded history or unrelated coin/dice history. No schema or API endpoint changes.

**Tech Stack:** Next.js, React, Vitest, NestJS existing contract, PostgreSQL existing `casino_play_theme` boundary.

**Spec:** Bounded P1 remediation from observed main code and docs/worklog/2026-10-26-hourly-c-v1057.md.

## Global Constraints
- Never touch main, other agents' worktrees, financial ledger or shared live DB.
- Member page stays force-dynamic/noindex; keep mobile, keyboard, screen-reader support.
- Hold PR if required CI, audit or exact-SHA Test fails.

## Tasks
- [x] Write failing tests for fabricated wheel history, malformed IDs/outcomes, replay duplicate, accessible no-results.
- [x] Run RED, capture evidence.
- [x] Implement receipt validation in existing action and current-session wheel display.
- [ ] Run GREEN, lint, typecheck, full frontend tests, build/security/API/DB gates where safely available.
- [ ] Re-fetch main and plan, review diff, publish Draft PR and record final gates without merging on failure.
