# Verified Season Rewards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate fabricated season pass rewards and hall-of-fame records; show only member-scoped verified season standing and settled honorees.

**Architecture:** Server-side Next.js reads existing authenticated NestJS season endpoints. Current standing is returned as `{currentSeason}`, archive as `{hallOfFame}`. A read-only preview replaces fake claim buttons; the existing atomic final-season reward action is unchanged.

**Tech Stack:** Next.js App Router, React, Vitest, NestJS, PostgreSQL.

**Spec:** `docs/planning/PROJECT_PLAN.md` and `docs/planning/PROJECT_PLAN.ko.md`.

## Global Constraints
- No new database writes or permission grants; do not touch shared Production/dev database.
- No fabricated member XP, claimed rewards, rankings, burn totals, or receipts.
- Responsive layout, keyboard/screen reader semantics, member-only noindex.

## Task 1 — RED/GREEN verified pass
- [ ] Write a failing component regression proving the default 18,500 XP and fake claim completion are absent.
- [ ] Replace fake claim UI with server-provided score/tier/rank and explicitly nonredeemable roadmap.
- [ ] Run targeted tests and inspect failure/success.

## Task 2 — RED/GREEN verified archive
- [ ] Write a failing regression requiring actual honorees or honest empty/unavailable states.
- [ ] Replace static fabricated hall of fame with actual `hallOfFame` response and accessible disclosure.
- [ ] Wire both server responses through `/seasons` page and assert wrapper contract.

## Task 3 — Verification and release decision
- [ ] Re-fetch main and review A/B/QA overlap.
- [ ] Run targeted, lint, typecheck, build, frontend/backend/DB/contract/security/app-api/CI where safe.
- [ ] Record exact SHA, Test/Production status, blockers, and preserve branch when gates fail.
