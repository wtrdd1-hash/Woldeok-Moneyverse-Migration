# Verified Stock Trade CSV Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let authenticated members download only their latest verified virtual stock trades without precision loss, CSV formula execution, or shared caching.

**Architecture:** Reuse owner-scoped PostgreSQL SECURITY DEFINER stock_my_trades through NestJS stock history, add bounded query support, and use a private Next.js GET export route that authenticates before fetching. Android uses the same JSON endpoint with a private response.

**Tech Stack:** NestJS, Next.js, PostgreSQL, Vitest, Node tests.

**Spec:** docs/planning/PROJECT_PLAN.md and docs/planning/INTEGRATED_PLANNING_MASTER.md (English canonical), Korean translations.

## Global Constraints
- No schema or ledger mutation; never use Number for WLD amounts.
- Keep server-only API token on the server, member cookies HttpOnly, no-store/noindex private response.
- Formula-like CSV cells must not execute; only canonical integer strings remain unprefixed.
- Preserve all unrelated branches and PRs; production HOLD without all required gates.

## Review Focus
- Unauthenticated requests must be rejected before API fetch.
- Invalid limits must be 400, never silently request unlimited rows.
- Quotes, CRLF, formula prefixes and Unicode control bytes must not become executable spreadsheet formulas.
- Huge integer-string amounts must be byte-exact; no floating-point conversions.
- App gateway must never cache another user's trade rows.

## Tasks
- [ ] RED: add backend controller limit tests and CSV export serializer tests; execute failures.
- [ ] GREEN: implement bounded history query and secure CSV route; execute focused tests.
- [ ] RED/GREEN: add Android gateway privacy regression and test.
- [ ] Verify full workspace, real PG role and exact SHA; report blockers, no unverified merge.
