# Owner Inventory Truth and Condition Disclosure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Stop misleading zero-holdings on API failures and provide opt-in, read-only item condition evidence with Android parity.

**Architecture:** Reuse authenticated/consented Nest `GET /api/v1/shop/holdings` and owner-scoped `public.shop_my_items_v2(actor)` (migration 123). A shared strict response parser separates VERIFIED_EMPTY from UNAVAILABLE on the Next page and Android gateway. A default-OFF flag reveals truthful item condition fields without new SQL, grants or money writes.

**Tech Stack:** NestJS, Next.js App Router, React, TypeScript, Vitest, PostgreSQL 17.

**Spec:** `docs/planning/PROJECT_PLAN.md` v1516/v1518 F675-185; `docs/planning/PROJECT_PLAN.ko.md` Korean counterpart. Source migration `packages/database/migrations/123-shop-v2-read-functions.sql`.

## Global Constraints
- No modifications to applied migrations, ledger, idempotency, grants, other branches or live environments.
- Do not imply null effect expiry means permanent or unpaid weeks 0 means proof of settlement.
- Keep owner session+consent guards; Android response private/no-store/noindex/no-referrer on success/failure.
- Unknown/malformed source is unavailable, never zero. No unverified lifecycle claims.
- Flag `INVENTORY_LIFECYCLE_DETAILS_ENABLED` defaults OFF; rollback by keeping OFF.

## Task 1 — Source-proof parser and error distinction
- [x] Write failing Vitest tests for valid/empty/malformed/duplicate rows, canonical WLD and optional lifecycle fields.
- [x] Run RED and capture output.
- [x] Implement `frontend/src/lib/inventory-holdings.ts` with strict owner-read parser.
- [x] Run GREEN; record evidence.

## Task 2 — Next member inventory and lifecycle disclosure
- [x] Write failing SSR tests: source 503/malformed is not empty, verified empty is empty, robots noindex, flag default OFF/on.
- [x] Run RED and capture output.
- [x] Use `api` with fail-closed parsing; keep profile read independent; add noindex metadata and inaccessible error panel.
- [x] Add read-only `<details>` condition component with explicit missing evidence and KST time labels.
- [x] Run GREEN and accessible UI assertions.

## Task 3 — Android edge parity
- [x] Write failing tests for owner cookie, malformed 200 => 503, forged public cache on success/error, referrer privacy.
- [x] Run RED and capture output.
- [x] Reuse parser in app-api gateway and override private headers for shop holdings, no token/log leaks.
- [x] Run GREEN and mobile contract check.

## Task 4 — Backend and DB boundary, release
- [x] Verify Nest SessionGuard/AuthenticatedGuard/ConsentGuard and repository function argument with regression test.
- [x] Verify isolated PostgreSQL function and owner/foreign role ACL; do not alter DEV/Production.
- [x] Run typecheck, lint, builds, full tests, security, contract, accessibility/SEO. Full suites/lint FAIL; CI and official Test BLOCKED pending PR and gates.
- [x] Re-fetch main/plans mid and before integration, record branch audit, failures, blockers and rollback.
- [x] Preserve Draft/HOLD; no main merge/Test/Production promotion without all gates PASS.
