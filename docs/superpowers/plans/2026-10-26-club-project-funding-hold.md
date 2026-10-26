# Club Project Funding P0 Containment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fail closed for club project WLD contributions until canonical balanced-ledger settlement and immutable replay receipts are independently certified.

**Architecture:** Keep the existing GET project discovery intact. Reject POST at ClubService with a stable 503 problem code and at PostgresClubRepository before any query, so the legacy migration-222 balance mutation cannot be reached from the backend. This is an API-layer containment only; it does not revoke database EXECUTE or implement funding. Draft #1422 holds SQL; issue #1423 owns ledger-first implementation.

**Tech Stack:** NestJS, TypeScript, Vitest, PostgreSQL (unchanged).

**Spec:** GitHub issue #1423; migration `packages/database/migrations/222-clubs-cooperative-economy.sql`.

## Global Constraints
- No Production/Test writes, role/feature-switch changes, migration rewrites, or merges without exact-SHA gates.
- Keep current club GET routes and unrelated club mutations unchanged.
- Coordinate overlapping A #1418 and C #1397; do not edit their branches.

## Review Focus
- Same-key retry must not call SQL.
- Concurrent requests must not call SQL.
- Response must be HTTP 503 with a stable machine-readable reason.
- Read-only club project listing must remain available.
- Direct repository invocation must fail closed.

### Task 1: API and repository containment
**Files:** `backend/src/club/club.service.ts`, `backend/src/club/club.repository.ts`, `backend/src/club/club.controller.ts`, `backend/src/club/club-project-funding-hold.test.ts`, `backend/src/club/club.service.test.ts`.
- [x] Write failing tests for 503/no repository call and concurrent no-query.
- [x] Run RED: 2 failed as expected on unchanged main.
- [x] Add service and repository fail-closed paths; update Swagger description.
- [x] Run GREEN: 6/6 focused tests pass.
- [x] Re-run broader build/test/security gates and record independent blockers.

### Task 2: Release hold and integration
- [x] Do not add competing migration 280 or modify applied migration 222.
- [ ] Official Test exact-SHA and authenticated member/core-finance E2E: blocked pending release gates.
- [ ] SQL-level revocation/ledger-first project settlement: issue #1423; requires reviewed migration stack and PostgreSQL certification.
- [ ] Frontend disabled-state UX: coordinate with C/A rather than claim completion.
