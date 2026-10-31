# Stock League Source Truth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Each task follows test-driven development.

**Goal:** Never show fabricated league ROI, subscriptions, or copy-trade success; display only verified backend read evidence.

**Architecture:** Reuse existing GET /api/v1/stocks/league/current through the Next BFF. Validate the season and whale DTOs at runtime before rendering. Backend copy-trading POST remains 503 until ledger settlement; remove unsafe frontend write entry points rather than pretending to support them.

**Tech Stack:** Next.js, React, Vitest, NestJS, PostgreSQL.

**Spec:** docs/worklog/2026-11-01-c-v1245-stock-league-truth.md

## Tasks
- [ ] Write strict parser tests; verify RED; implement parser; verify GREEN.
- [ ] Write UI/source tests for no fabricated data, no success fallback, error/empty/read-only; verify RED; implement accessible mobile UI; verify GREEN.
- [ ] Write HTTP BFF private-header tests; verify RED; implement no-store/noindex/no-referrer and page metadata; verify GREEN.
- [ ] Recheck main, run full release gates on exact SHA, record blockers; draft PR only unless all pass.
