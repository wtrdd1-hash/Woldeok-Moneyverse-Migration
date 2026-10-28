# Verified Council Debate Evidence Containment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Never present simulated council votes as a verified administrator policy decision.

**Architecture:** Existing authenticated NestJS GET returns 503 until a durable evidence-backed proposal and evaluation exist. Existing responsive Next.js card shows a non-decision state when the API has no data; do not add any unverified synthetic fallback. No new DB migration, authorization grant, or financial write.

**Tech Stack:** NestJS, Next.js App Router, React, Vitest, PostgreSQL read-only boundaries.

**Spec:** `docs/worklog/2026-10-29-c-council-truth-v1141.md`

## Global Constraints
- Main and A/B/Gemini/QA worktrees untouched; no live DB write or backup command.
- Preserve authenticated admin guards, `force-dynamic`, `noindex`, mobile and keyboard/screenreader accessibility.
- English code/test/PR; Korean supplemental worklog. Do not claim verified council execution.

## Task 1: Backend fail-closed
- [ ] Write controller test asserting 503 with code, no repository call, no fake `prop_live_*` data.
- [ ] Run RED focused test.
- [ ] Remove synthetic proposal construction and return explicit 503; document Swagger response.
- [ ] Run GREEN focused test and inspect guards.

## Task 2: Frontend fail-closed
- [ ] Write component test asserting no votes/recommendation when `initialData` is absent.
- [ ] Run RED focused test.
- [ ] Remove fallback data and render accessible unavailable state.
- [ ] Run GREEN focused test and ensure responsive/noindex context remains.

## Task 3: Release evidence
- [ ] Fetch/recheck main, run focused/full test, lint/typecheck/build, API contract, security, real isolated PG and CI.
- [ ] Record failures without claiming PASS; PR Draft/HOLD only.
- [ ] No merge/Test/Production unless all exact-SHA gates pass.
