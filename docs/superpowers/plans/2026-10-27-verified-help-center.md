# Verified Help Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and test-driven-development task-by-task.

**Goal:** Deliver public evidence-approved help articles and an explicit support handoff, without publishing unverified content or leaking private queries.

**Architecture:** Forward-only PostgreSQL 282 schema and least-privilege SECURITY DEFINER reads, independent operator/approver publication; NestJS bounded API; Next.js public and admin views; allowlisted Android read parity. Default OFF until all release gates pass.

**Tech Stack:** PostgreSQL, NestJS, Next.js, TypeScript, Vitest.

**Spec:** Planning v1352 PR #1514, English canonical docs/planning/INTEGRATED_PLANNING_MASTER.md in docs/planning-v1352-verified-help-center, Korean companion.

## Global constraints
- Applied migrations are immutable. Number 280 is already claimed by multiple unmerged PRs; migration 282 must remain BLOCKED until an approved 280 and 281 are integrated and parity passes. No live DB changes.
- No app-role direct DML, no PUBLIC function grants, no production promotion, no source-less articles.
- Never count docs-only or mocked tests as end-to-end PASS. Preserve all other worker branches.

## Tasks
- [x] TDD: SQL published-only, expiry, least-privilege (isolated PG 17 PASS). Migration 280/281 gap remains BLOCKED.
- [x] TDD: public search/article repository, bounded parameters and 404. 410 retraction distinction remains pending.
- [x] TDD: public NestJS and guarded operator/independent approver routes with DB role/session checks.
- [x] TDD: Next.js help/search/detail, admin review and explicit support handoff; no private query URLs.
- [x] TDD: Android app-api public allowlist, no admin help mutation.
- [x] Isolated PostgreSQL 17: 100 first-time publish + 100 first-time retract + 100 replay + 100 forged actor attempts, 10,001 synthetic rows, negative ACL/expiry, one receipt per intent.
- [ ] Full migration parity (280/281 absent), independent source-verification/outbox, 410 retraction, HMAC cursor, 10,001 complete traversal, all security/a11y/SEO/E2E gates.
- [ ] Exact-SHA official Test login/finance E2E, independent restore, approved GitOps before any merge or Production.
