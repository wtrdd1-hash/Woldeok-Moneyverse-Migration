# Public Board Chronological Order Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow visitors and Android clients to sort the most recent 50 public board posts by publication time, without implying full-archive sorting.
**Architecture:** Reuse the existing owner-free SECURITY DEFINER 50-post read function; parameterize SQL ordering of that bounded result, echo order for Android verification; Next.js server page selects order and renders accessible form. No database migration.
**Tech Stack:** NestJS, PostgreSQL 17, Next.js, Vitest.
**Spec:** /srv/moneyverse-data/tasks/mv-a-20261101-1525-board-order/START.md

## Global constraints
- No direct table access, grants, migration, balance writes, or changes to authentication.
- Preserve default public endpoint response for clients without order parameter.
- No-store/noindex on query-specific results including failures.
- Keep independent worktree and Draft PR on hold until all required gates.

## Task 1 — HTTP and SQL contract
- [ ] Add failing HTTP tests for oldest/newest, duplicates and invalid values.
- [ ] Add failing SQL unit tests proving only latest 50 source posts are sorted, with parameter binding.
- [ ] Implement Nest validation, SQL sorting and verified response echo.
- [ ] Run target backend tests.

## Task 2 — Web and Android
- [ ] Add failing order parser and Android fail-closed tests.
- [ ] Implement Next.js form, robots and order parser.
- [ ] Implement Android order validation and proof of ascending/descending results.
- [ ] Run target frontend tests, API contract, typecheck, lint and build.

## Task 3 — Verification and release hold
- [ ] Re-fetch origin/main and living plan; inspect conflicts and CI.
- [ ] Run full suites, real PostgreSQL read-only query and security/a11y/SEO checks.
- [ ] Record English/Korean QA, worklog and release HOLD, exact SHA.
- [ ] Push Draft PR; merge and deploy only after exact SHA full gates and official Test.
