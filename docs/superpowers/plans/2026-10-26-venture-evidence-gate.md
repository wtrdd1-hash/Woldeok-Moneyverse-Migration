# Venture Finance Evidence Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox tracking.

**Goal:** Never represent unverified venture pitches, equity holdings, or dividends as live member financial records.

**Architecture:** Keep existing authenticated NestJS routes and 503 mutation guards; make read endpoints fail closed with stable machine-readable 503 and no-store, until an owner-scoped PostgreSQL read model exists. Preserve the clearly identified UI simulation but remove its misleading live-ledger badge.

**Tech Stack:** NestJS, Vitest, Next.js, TypeScript.

**Spec:** docs/worklog/2026-10-26-hourly-b-v547-venture-evidence.md

## Global Constraints
- Never touch Production-linked DB, WLD, migration or ledger.
- Never claim venture settlement or a live balance without verified PostgreSQL receipt.
- Existing session, authentication and consent guards remain.

## Task 1 — Backend evidence gate
- [ ] Add RED tests for all three venture read routes, asserting 503 and stable evidence code, no-store.
- [ ] Run RED tests and record failures.
- [ ] Replace hardcoded read responses with a shared fail-closed helper.
- [ ] Run GREEN tests and existing backend regression.

## Task 2 — Frontend truthfulness
- [ ] Add RED test that sample wallet is not labeled live ledger.
- [ ] Run RED test and record failure.
- [ ] Relabel simulation figures without changing real financial state.
- [ ] Run GREEN and frontend regression.

## Task 3 — Verification and review
- [ ] Verify build, typecheck, lint, API contracts, DB tests, audits and CI.
- [ ] Refresh main and planning; record all release blockers.
- [ ] Create Draft PR; do not merge or deploy until full gates pass.
