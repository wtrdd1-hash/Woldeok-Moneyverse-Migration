# First-trade Onboarding Truth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Execute test-first, review and verify each stage.

**Goal:** Prevent fabricated stock trades, holdings and WLD grants from onboarding.

**Architecture:** The client onboarding is guidance only; real transactions remain in the existing authenticated `/stocks` exchange and server-side trade flow. No new API, DB grant, ledger write or synthetic receipt.

**Tech Stack:** React/Next.js, Vitest/Testing Library, TypeScript.

- [ ] Add failing regression for onboarding never calling nonexistent orders endpoint or writing holdings, even when fetch fails.
- [ ] Replace fake execution and completed state with accessible link to `/stocks` and truthful guidance; no fake WLD grant.
- [ ] Verify responsive touch targets, keyboard focus and no member page indexing change.
- [ ] Run focused test, lint, typecheck, build, API contract, full tests, audit, real-PG CI, and exact-SHA Test when available.
- [ ] Re-fetch main and plan, record blockers and do not merge/deploy unless all gates PASS.
