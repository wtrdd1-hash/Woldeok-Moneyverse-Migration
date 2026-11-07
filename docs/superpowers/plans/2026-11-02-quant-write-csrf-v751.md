# Quant POST CSRF Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and test-driven-development to implement task-by-task.

**Goal:** Ensure three member Quant POST routes verify session-bound CSRF before entering their existing fail-closed handlers.

**Architecture:** Reuse the existing Nest `CsrfGuard` at method level; preserve class-level session/authentication/consent. No DB, frontend, WLD or finance changes.

**Tech Stack:** NestJS, TypeScript, Vitest, Supertest, PostgreSQL 17.11 (isolated verification).

**Spec:** Existing Quant evidence boundary and `AGENTS.md`; bounded security correction with no new feature activation.

## Tasks and checks

- [x] Read current main, English/Korean plan, QA, overlapping PRs and real guard implementation.
- [x] Create independent worktree and task logs; preserve main's uncommitted file.
- [x] Add real HTTP tests for 403 missing/mismatched CSRF, valid-token 503, expired-consent 428, anonymous 401, GET without CSRF.
- [x] Observe RED 6 failures; apply method-level guard; observe GREEN 18 focused passes.
- [x] Update pre-existing Quant evidence HTTP fixture to send a valid same-session token.
- [x] Run lint, typecheck, builds, full backend/frontend, contract, database, security, and isolated PostgreSQL tests.
- [x] Preserve Draft/HOLD due to known backend failures, audit findings and exact-SHA Test mismatch.
- [ ] Merge/deploy only after all release gates pass and explicit approved PR procedure.
