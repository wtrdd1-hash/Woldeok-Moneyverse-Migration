# C v1301 Owner Saving Pockets Source Integrity — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans; the checklist below records the completed TDD and verification stages.

**Goal:** Prevent a member's saving-pocket list from displaying false emptiness or crashing on unverified data, while supplying the missing owner-scoped PostgreSQL read and an equivalent private Android gateway contract.

**Architecture:** Existing Nest SessionGuard/AuthenticatedGuard/ConsentGuard bind the user identity and BankRepository calls a SECURITY DEFINER owner read. A narrow runtime parser validates the PostgreSQL bigint/date/UUID DTO; Next renders verified empty versus unavailable distinctly and Android rejects unverified success with 503. No ledger writes, new table, or direct app table privileges.

**Tech Stack:** Next.js, NestJS, PostgreSQL 17.11, Vitest, pnpm 10.

**Spec:** docs/planning/PROJECT_PLAN.md (canonical) and docs/planning/PROJECT_PLAN.ko.md (Korean parity).

## Global Constraints
- Latest main only, isolated auto/hourly-* worktree; do not touch shared DEV/Test/Production data.
- No WLD writes; PostgreSQL SECURITY DEFINER and function-only application access.
- Authenticated owner reads only; no unverified empty state; exact bigint strings; 320px/mobile, 44px keyboard-accessible retry; noindex/no-store/no-referrer.
- No main merge or deployment without exact-SHA full gates, CI, official Test E2E and restore proof.

## Review Focus
- Missing/failed upstream owner response must not become [].
- Malformed, duplicate or oversized pocket records must not reach BigInt/rendering.
- Android must not forward private upstream fields, cache headers or raw errors.
- Fresh PostgreSQL must actually contain bank_list_pockets(uuid), with app EXECUTE and no direct SELECT.
- Owner A must not see owner B's pockets through the authenticated Nest route.

## Tasks
- [x] Inspect latest main, docs, PRs, A/B/QA, current bank read and absent SQL function.
- [x] RED tests: invalid/duplicate/overflow data, Android upstream 200/401, verified empty versus unavailable.
- [x] Implement parser and Next error/empty states; protect banking HTTP edge and Android response.
- [x] Add forward-only migration 324 for owner read and function-only ACL.
- [x] Test disposable PostgreSQL 17.11 migration, actor isolation and direct table denial.
- [x] Test real Nest HTTP read with disposable PostgreSQL app role.
- [x] Run full workspace build/typecheck/lint/frontend/backend/database/contract/security and audit; report failures as blockers.
- [ ] Official Test exact-SHA auth E2E and full route ledger (blocked).
- [ ] Main merge and Production rollout (blocked until all gates pass).
