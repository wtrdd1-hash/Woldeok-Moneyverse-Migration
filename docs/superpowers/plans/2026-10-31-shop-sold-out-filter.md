# Verified Shop Sold-Out Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans; apply RED-GREEN-REFACTOR per task.

**Goal:** Let members and Android clients find items whose authoritative shop inventory count is exactly zero, without fabricating availability.

**Architecture:** Reuse the owner-scoped PostgreSQL `shop_catalog_list_v2(uuid)` SECURITY DEFINER function; apply a validated read-only stock predicate in NestJS to the complete returned catalogue. Expose a server-rendered member shop filter and validate Android gateway 200 payloads before forwarding. No migration or write-path change.

**Tech Stack:** PostgreSQL 17, NestJS, Next.js, TypeScript, Vitest.

**Spec:** `docs/worklog/2026-10-31-a1725-shop-sold-out-filter.md`; existing `docs/planning/PROJECT_PLAN.md` (canonical) and `.ko.md` (translation).

## Global Constraints
- Never change applied SQL migrations, broaden `moneyverse_app` table privileges, mutate balances or convert WLD strings to Number.
- Reject malformed/duplicate stock query before database reads; null quantity is unlimited, not sold-out.
- For Android, reject inconsistent or malformed HTTP 200 results; enforce private/no-store/noindex/referrer on member responses.
- No deployment/merge without all exact SHA gates and authenticated official Test E2E.

## Review Focus
- `quantity=null` must not be sold out.
- `quantity=0` must not be available.
- Invalid or duplicate stock filters must return 400 before SQL.
- Backend HTTP 200 with a positive quantity for sold-out query must become Android 503.
- Upstream public cache must never propagate to member Android response.

## Tasks
- [x] Write backend failing tests for `stock=sold_out`, `stock=available`, duplicate and actor scope; execute RED.
- [x] Implement strict dedicated stock filter in backend, preserving existing generic filter contract; execute GREEN.
- [x] Write frontend failing tests for sold-out search URL, stock select and server fetch; execute RED.
- [x] Implement accessible stock selector, query forwarding and verified empty/error distinctions; execute GREEN.
- [x] Write Android failing gateway tests for duplicate stock, inconsistent response and privacy; execute RED.
- [x] Implement Android fail-closed verification and private headers; execute GREEN.
- [ ] Run full quality gates, real PostgreSQL ACL and SQL read tests, CI; document exact SHA and blockers.
