# Verified Transfer Preflight Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and test-driven-development; no production code before RED evidence.

**Goal:** Let a signed-in member verify a target UUID and available cash before initiating a WLD transfer, without presenting a read as a committed receipt.

**Architecture:** The NestJS wallet service validates the caller, recipient and canonical integer-string amount; existing PostgreSQL owner-scoped balances and active-recipient lookup supply read-only facts. A Next.js same-origin no-store route proxies the authenticated preview, the wallet form presents a nonbinding result, and the Android app-api forwards the same contract. The actual ledger transfer remains the only settlement authority.

**Tech Stack:** NestJS, Next.js, TypeScript, PostgreSQL, Vitest, pnpm.

**Spec:** Existing `AGENTS.md`, `docs/planning/PROJECT_PLAN.md`, wallet ledger and transfer invariants.

## Tasks
- [ ] Add failing wallet service tests for ownership, self-transfer, missing recipient, precision, insufficient cash, and no writes; run RED.
- [ ] Add failing HTTP route test and Next private proxy test for status/no-store; run RED.
- [ ] Implement service/controller and private Next route; run GREEN.
- [ ] Add frontend preview matching/invalidating tests (RED), implement accessible preview form (GREEN).
- [ ] Add app-api forwarding/contract tests; verify no-store and auth status preserved.
- [ ] Run lint, typecheck, unit/integration, isolated real PostgreSQL read, build, security, accessibility, SEO, app-api and E2E; record exact SHA and blockers.
- [ ] Refresh main and plan at midpoint and before integration; keep Draft PR until all release gates pass.

## Non-negotiable invariants
- Never use Number for WLD, never mutate ledger on preview, never reveal inactive/nonexistent recipient identity, never expose other member balances, no shared DB writes.
- Preview is time-of-check-only, not a guarantee, receipt, idempotency claim or reservation; sending still uses existing atomic DB transfer.
- On backend/API failure, show error rather than a success-shaped preview; no private browser cache or crawler indexing.
