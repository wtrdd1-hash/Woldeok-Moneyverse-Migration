# Marketplace Service Ledger Hold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent unledgered marketplace WLD mutations through service-level entry points, independent of controller protections.

**Architecture:** Throw NestJS 503 before database, proxy-bid memory or websocket activity in three affected MarketplaceService methods. Preserve reads, cancellation and other unrelated flows; do not alter already-applied migration 232 or competing 314 migrations.

**Tech Stack:** NestJS, TypeScript, Vitest, PostgreSQL (read-only evidence only).

**Spec:** P0 issue #2191 and AGENTS.md ledger boundary.

## Global Constraints
- Never write WLD balances or create synthetic ledger receipts.
- No migration or schema changes; all applied migrations immutable.
- Protect A #2192, C #2181 and other automation work.
- RELEASE HOLD until exact-SHA authenticated Test and security gates pass.

## Review Focus
- Null pool still returns explicit 503.
- No database call on any unsafe operation.
- No proxy-bid state mutation or broadcast on rejected bid.
- Listing and purchase idempotency inputs cannot bypass hold.
- Unrelated safe read and cancellation methods remain callable.

### Task 1: Service-level negative financial boundary
**Files:** `backend/src/marketplace/marketplace.service.ts`, `backend/src/marketplace/marketplace-service-ledger-hold.test.ts`.
- [ ] Write failing tests for all three operations with a spy pool and gateway.
- [ ] Observe RED against baseline.
- [ ] Add minimal 503 holds at service entry points.
- [ ] Observe GREEN; check unaffected methods.
- [ ] Run repository verification and preserve all blockers.
