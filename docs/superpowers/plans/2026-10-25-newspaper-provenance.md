# Newspaper Market Provenance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the public newspaper's fabricated community vote/market-momentum data with a truthful, accessible view of PostgreSQL-backed active market events.

**Architecture:** Existing Next server page reads Nest `GET /api/v1/stocks/market-events` backed by `stock_market_events_active()`; pass its availability separately from an empty result. A read-only event direction summary replaces localStorage-only votes; do not add a fake write endpoint or mutate ledger/DB.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, NestJS, PostgreSQL read function.

**Spec:** `docs/planning/PROJECT_PLAN.md` and this source-backed start record.

## Global Constraints
- Main untouched; independent `auto/hourly-*` branch/worktree, preserve A/B/QA/Gemini and all unmerged changes.
- Existing authenticated API, SQL SECURITY DEFINER and virtual WLD invariants; no new SQL/migration or fake voting receipts.
- Public SEO index preserved; mobile 320px, keyboard/screen-reader and translations preserved.
- All gates must pass before main merge or Production; official exact-SHA Test remains BLOCKED otherwise.

## Review Focus
- Real 1 up / 1 down active events must not produce 316 fictional voters.
- Empty real event list must not claim ledger or market balance.
- Unavailable event API must differ from verified empty list.
- Unverified ticker history must not be depicted as a real price series.
- Event direction distribution must not be confused with member opinion polls.

## Tasks
- [ ] Add failing tests to `frontend/src/app/newspaper/newspaper-view.test.tsx` for source-backed tally, empty and unavailable states, and no synthetic ticker chart.
- [ ] Run focused Vitest RED and capture failure.
- [ ] Update `newspaper-view.tsx` and `page.tsx` to use verified events, no localStorage poll, accurate labels and accessible mobile layout.
- [ ] Run focused Vitest GREEN; inspect diff, typecheck, lint, build and full suites.
- [ ] Re-fetch main/plan, record final exact SHA gates and CI, open Draft PR only; no merge or Production without full PASS.
