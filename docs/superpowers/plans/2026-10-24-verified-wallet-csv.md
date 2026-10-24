# Verified Wallet CSV Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Execute with test-driven-development, isolated worktree, verification-before-completion.

**Goal:** Allow members to download a fresh, server-verified CSV of their last 50 WLD ledger entries, independent of how many rows the wallet UI rendered.

**Architecture:** NestJS reads owner-scoped PostgreSQL ledger postings using the existing bounded repository and normalizer. The Next.js private BFF requests the authenticated API result and renders safe CSV, with private no-store and attachment headers. Android app-api proxies the same owner-scoped JSON endpoint, preserving private caching headers.

**Tech Stack:** NestJS, Next.js, PostgreSQL existing read-only ledger tables, Vitest, TypeScript.

**Spec:** docs/worklog/2026-10-24-hourly-a-wallet-verified-csv-1620.md

## Global Constraints
- No migrations or production DB writes; existing DB owner-filter and limit 50 only.
- SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard remain mandatory.
- CSV never converts WLD integer strings through JS Number; formula-injection guard and no fake zero.
- Backend and BFF errors must fail closed; no shared caching or indexing of private data.
- No merge or deploy without full CI, security, isolated Test exact-SHA authenticated E2E.

## Tasks
- [ ] Add failing NestJS service/controller and app-api tests for export and privacy.
- [ ] Implement bounded normalized read and private endpoint, then re-run tests.
- [ ] Add failing BFF CSV tests for signed-out, unavailable, owner rows, 50 cap, formula and exact 38 digits.
- [ ] Move pure CSV formatter to server-safe module; implement BFF route and web download control.
- [ ] Run focused tests, lint, typecheck, build, API contract, full tests, dependency security, isolated PostgreSQL read.
- [ ] Recheck main/plans and PR conflicts; document exact evidence, rollback and release HOLD.
