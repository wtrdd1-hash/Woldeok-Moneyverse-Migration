# Owner-scoped Historical Wallet Receipt Recovery — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and test-driven-development. Each checkbox is an independently verifiable step.

**Goal:** Let authenticated members retrieve any own committed wallet transaction by UUID, not just the recent 50.
**Architecture:** Read-only owner-filtered aggregate over existing ledger/account tables; reuse the existing canonical wallet transaction normalizer. Add a guarded NestJS route, private Next.js receipt page, and compatible Android app-api proxy. No migration or financial write.
**Tech Stack:** NestJS, Next.js, Vitest, PostgreSQL.
**Spec:** User's P0/P1 end-to-end feature requirement and docs/planning/PROJECT_PLAN.md wallet receipt backlog.

## Constraints
- Only authenticated owner can read; missing and foreign transaction indistinguishable 404.
- No WLD Number conversion, no counterparty details, no caching of private receipt.
- Do not modify applied migrations or shared production-connected PostgreSQL.
- Do not collide with Developer B/C or existing A Drafts.
- No merge/release without all CI, security, exact-SHA Test and finance gates.

## Tasks
- [ ] Add failing repository/service/controller tests for historical owner receipt, UUID, 404, 38-digit amounts and neutral pocket movement.
- [ ] Implement a read-only owner-filtered repository query, service normalization, and guarded GET route.
- [ ] Add failing frontend page/Android app-api regression checks; implement noindex/no-store private receipt page and navigation.
- [ ] Verify targeted tests, lint/typecheck/build, API contract, full suites, security, real isolated PostgreSQL and E2E where safe.
- [ ] Recheck latest main/plan and all PRs; publish QA/release/worklog and Draft PR, HOLD if gates fail.

## Review focus
- Foreign and nonexistent IDs must return indistinguishable 404.
- Internal bank transfer net=0 must show both pockets accurately.
- 38-digit integer-string WLD must never be rounded.
- Stale private receipt must not be cacheable or crawlable.
- Production-connected DB must never receive test writes.
