# Verified Marketplace Listings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and superpowers:test-driven-development. Steps use checkbox notation.

**Goal:** Replace fabricated fixed-price marketplace listings and browser-only purchase/list/cancel successes with a verified read-only PostgreSQL-backed listing and member listing status view.

**Architecture:** Existing authenticated NestJS marketplace GET endpoints query PostgreSQL. Next.js server page loads their JSON using the authenticated BFF; a strict pure parser rejects malformed payloads; a new accessible client board displays only validated records. Unverified purchase/list/cancel remain unavailable, not simulated. Existing crafting, auction, appraisal, direct-trade tabs remain separate, with no new success claims.

**Tech Stack:** Next.js 16, React 19, NestJS, PostgreSQL, Vitest.

**Spec:** docs/planning/PROJECT_PLAN.md; packages/database/migrations/232-marketplace-auctions-trades-appraisals-club-canvas-collections.sql; backend/src/marketplace/marketplace.service.ts

## Global Constraints
- Work on independent branch based on latest origin/main; never change live/Production-connected database.
- Do not invent listing IDs, WLD, transaction receipts or settlement.
- User-specific pages are noindex and no-store; keyboard and 320px mobile remain usable.
- Require exact-SHA CI and official isolated Test verification before merging or releasing.

## Tasks
- [x] Add pure parser tests for authentic active/owned listings, invalid response, decimal WLD and empty results; run RED.
- [x] Implement strict parser against NestJS PostgreSQL row shape; run GREEN.
- [x] Add regression tests that member page uses authenticated listing APIs and no fabricated list, balance or indexable metadata; run RED.
- [x] Replace marketplace page and fabricated fixed-price UI with server-backed read-only listings, error/empty states, keyboard-accessible refresh, and preserve independent tabs; run GREEN.
- [ ] Verify focused tests, lint, typecheck, build, backend contract and required CI on exact SHA; record any failures honestly.
- [ ] Re-fetch main, publish EN/KO start/mid/end worklog and Draft PR; never merge or deploy unless every gate passes.
