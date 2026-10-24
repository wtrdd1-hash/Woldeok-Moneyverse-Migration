# VIP Golden Chest Receipt Truth — A1425 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and verification-before-completion; keep changes isolated.

**Goal:** Never tell members or Android clients that 2,000 WLD / a VIP die was awarded without a ledger-backed, owner-scoped committed receipt.

**Architecture:** Until verified Plus entitlement and atomic DB-backed grant exist, GET returns explicit `available:false` without claiming eligibility and POST rejects with 503. The private quests UI renders a clear unavailable state instead of a claim CTA; Android's existing app-api route forwards the authenticated 503 and no-store status without inventing success. The DB is not modified.

**Tech Stack:** NestJS, Next.js, TypeScript, Vitest, PostgreSQL read-only validation.

## Steps
- [x] Add failing backend tests for GET false entitlement and POST false receipt; add frontend UI tests for disabled/unavailable and request failure; add Android gateway no-store regression.
- [x] Implement backend fail-closed 503 and status, frontend status-gated view, no fake success, private headers.
- [x] Run targeted tests, lint, typecheck, build, full suites, audit, isolated PostgreSQL read-only checks and CI; record actual PASS/FAIL (overall HOLD).
- [x] Push separate Draft PR #1133 only; hold merge, Test and Production until all release gates pass.
