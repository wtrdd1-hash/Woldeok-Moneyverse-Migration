# Member Business Source Evidence Implementation Plan

> For agentic workers: REQUIRED SUB-SKILL: use superpowers:executing-plans or subagent-driven-development; perform RED-GREEN-REFACTOR and independent review.

## Goal
Preserve verified owner-scoped business data while distinguishing backend failure from a legitimately empty portfolio. Never enable a purchase from unverified ownership/equity/unlock state. Keep the existing Nest and PostgreSQL function boundary.

## Tasks
1. Add `frontend/src/app/businesses/business-evidence.test.ts` for malformed amounts, duplicate IDs, missing responses, valid empty/owned records, equity and inventory failures. Run focused Vitest and record RED.
2. Implement `frontend/src/app/businesses/business-evidence.ts` strict parsers for owner and catalog data, with exact integer strings and dates. Run GREEN and review for false rejection of valid Nest DTOs.
3. Integrate verified states into `frontend/src/app/businesses/page.tsx`, add accessible retry/error states, protect purchase and activation UI on missing prerequisites, and mark daily figures as projections. Run focused tests and Typecheck.
4. Recheck origin/main and planning documents, run exact-SHA build/lint/test/contract/security/isolated PostgreSQL and E2E gates. Push a Draft PR and retain independent backup; merge/release only if all gates PASS.

## Constraints
Do not modify main, production, shared DB, another worker's worktree or active scheduled tasks. English canonical log with Korean parity. No migration or direct table GRANT.
