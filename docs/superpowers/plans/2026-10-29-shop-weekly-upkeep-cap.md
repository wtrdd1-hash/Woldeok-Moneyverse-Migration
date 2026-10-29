# Shop Weekly Upkeep Cap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expose an exact WLD weekly upkeep ceiling across member/guest shop, backend API and Android gateway.

**Architecture:** Reuse existing `shop_catalog` and `shop_public_catalog` SECURITY DEFINER read functions. Validate query once at backend boundary; use BigInt for price precision, and preserve session-owned catalogue scope. Web GET form carries the bound and search; Android forwards the same query and must not cache member data.

**Tech Stack:** NestJS, Next.js, Vitest, PostgreSQL 17, pnpm.

**Spec:** `docs/superpowers/specs/2026-10-29-shop-weekly-upkeep-cap.md`.

## Global Constraints
- No migration, app-role table grants, ledger writes or production database changes.
- Never touch other workers' branches or worktrees; use a fresh origin/main worktree.
- English code/docs canonical; Korean update follows.
- Full CI, isolated Test exact SHA, and release gate are required before merge.

## Tasks
- [ ] RED: backend unit tests for 0, huge exact values, malformed input, invalid DB row; run and record failure.
- [ ] GREEN: backend pure filter and controller GET wiring; verify tests.
- [ ] RED/GREEN: web form/query preservation, validation and active-filter/reset tests.
- [ ] RED/GREEN: Android gateway query forwarding and private no-store response tests.
- [ ] Verify real isolated PostgreSQL read function and least privilege; run all project gates.
- [ ] Re-fetch main, record SHA and branch/PR audits, push Draft PR only; merge/release only if all gates independently pass.
