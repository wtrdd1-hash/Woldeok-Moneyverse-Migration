# Verified Business Supply Chain Implementation Plan

> For agentic workers: use test-driven-development, systematic-debugging, and verification-before-completion for each step.

**Goal:** Stop fabricated business inventory and WLD procurement receipts; expose only owner-verified business identity until ledger-backed procurement exists.

**Architecture:** Keep business ownership authorization in existing PostgreSQL read function; remove speculative supply-chain figures. Reject unsupported financial writes with HTTP 503 at the controller boundary and fail closed in the repository as defense in depth. Replace the client-side fake receipt widget with a responsive owner-verified read-only status component.

**Tech Stack:** NestJS, Next.js App Router, PostgreSQL SECURITY DEFINER read functions, Vitest.

**Spec:** docs/planning/PROJECT_PLAN.md and AGENTS.md.

## Tasks
- [x] Add RED backend tests for no invented inventory/price and no outbox writes, ownership guard and 503 responses.
- [x] Add RED frontend source/interaction regression tests forbidding fake receipt/metrics and requiring a verified business link.
- [x] Implement minimum fail-closed backend and truthful frontend.
- [x] Run GREEN focused (full gates attempted; blocked) tests, lint, typecheck, build, contract, isolated real-PG, security, E2E and CI on exact SHA.
- [x] Recheck main (HOLD)/plan and record HOLD or integrate only after every required gate passes.
