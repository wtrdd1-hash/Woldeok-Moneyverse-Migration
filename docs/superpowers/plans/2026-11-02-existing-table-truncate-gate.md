# Existing-table TRUNCATE Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Detect effective unsafe TRUNCATE privileges on all existing public application tables before release.

**Architecture:** An independent read-only PostgreSQL catalog snapshot with strict evidence shape and exact database identity, separate from default ACL and financial DML gates.

**Tech Stack:** Node.js ESM, node:test, pg, PostgreSQL 17.

**Spec:** docs/RELEASING.md; QA v1475 Production ACL evidence; issue #993.

## Global Constraints
- Never mutate a shared DB or applied migration; preserve accepted existing DML exception without extending it to TRUNCATE.
- Release HOLD until all exact-SHA Test, restore, security and CI gates pass.

## Review Focus
- Unexpected schema rows, duplicate catalog evidence, missing required tables, malformed boolean flags, and partial inventory must block.
- Missing role and wrong database must block.
- Existing-table privileges and future default ACL are independent.

## Task 1 — Independent release verifier
- [x] Create `scripts/release/verify-app-table-truncate.test.mjs` and observe RED.
- [x] Implement `scripts/release/verify-app-table-truncate.mjs` with READ ONLY transaction and rollback.
- [x] Observe GREEN.
- [x] Exercise against disposable PostgreSQL and read-only actual serving DB.

## Task 2 — Release integration and verification
- [x] Add test to root test runner and document required operator gate.
- [x] Run lint, typecheck and root unit suites; full build and CI pending.
- [ ] Preserve PR as Draft/HOLD if any release prerequisite is unverified.
