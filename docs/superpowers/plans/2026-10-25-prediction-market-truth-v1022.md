# Prediction Market Truth v1022 Implementation Plan

> For agentic workers: Use TDD and verification-before-completion; release remains gated.

**Goal:** Stop displaying synthetic prediction-market liquidity and claiming fictitious WLD trades; offer safe verified-stock navigation instead.

**Architecture:** Prediction-market backend/DB settlement is absent, so do not simulate it or create an unverified write path. Render an explicitly read-only Next.js server page using the existing authenticated-to-backend stock catalogue read (`apiOrNull`); validate symbols and canonical integer prices before displaying. Distinguish empty from unavailable and keep private/unavailable route unindexed.

**Tech Stack:** Next.js App Router, NestJS existing `/api/v1/stocks`, PostgreSQL existing stock reads, Vitest, React Testing Library.

- [x] Write failing regression tests for fake trade removal, validated live stock rows, unavailable/empty, keyboard links and metadata.
- [x] Run RED and record failure.
- [x] Implement server-rendered safe page; avoid adding prediction write routes or database grants.
- [x] Run GREEN, lint, typecheck, build and security checks (failed release gates recorded).
- [x] Refresh main, verify changed plan, open Draft PR #1211; never merge/deploy with failed gates.
