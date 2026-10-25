# Marketplace P2P Service Fail-Closed Implementation Plan

> For agentic workers: use superpowers:executing-plans with test-driven-development and verification-before-completion. Work only in B v538's isolated worktree.

## Scope and source
Main 1c5b84a1c45baafcca83f375a6f99698121e9bb5; issue #1314; Development C Draft #1313 already holds browser routes. Nest MarketplaceService still SELECTs directly from a protected P2P table and directly INSERTs/UPDATEs proposals, acceptance, fake completion, and cancellation without escrow, inventory transfer, or ledger receipts. This is containment, NOT a completed P2P trading feature.

## Plan
- [x] RED: Add real service regression tests for GET and four mutations, with a query-spy that must never be invoked. Verify all fail on current main.
- [x] GREEN: Replace unsafe service methods with stable HTTP 503 fail-closed errors. Do not touch other marketplace operations, grants, applied migrations, or financial state.
- [x] Controller: Verify authenticated route delegates and preserves 503; do not remove session, consent, or CSRF guards.
- [x] Run focused tests, backend suite, typecheck, lint, build, API contract, security audit and isolated PostgreSQL. Frontend suite, default build and audit FAILED; official exact-SHA Test and authenticated E2E BLOCKED.
- [x] Re-fetch main and planning documents mid-task. Push isolated branch and create Draft PR only; block merge and Production until every mandatory gate passes.
