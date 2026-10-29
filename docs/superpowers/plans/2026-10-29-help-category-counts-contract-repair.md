# Verified Help Category Counts Integration Repair Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Repair the existing approved help category-count feature so that the public web and Android API receive genuine locale-scoped counts from the existing PostgreSQL SECURITY DEFINER function.

**Architecture:** Reuse immutable SQL migration 295 (`help_public_category_counts`) and existing repository, Next.js UI and Android allowlist. Fix the NestJS categories route, which still returned only the static list, and fence Android gateway caching. Do not introduce or renumber migrations while #1885 is independently repairing main's duplicate lineage.

**Tech Stack:** PostgreSQL 17.11, NestJS, Next.js, Vitest, pnpm.

- [x] Audit main, AGENTS, living plan, prior PR #1868 and baseline failures; reserve a fresh isolated worktree.
- [x] Write RED DB-to-controller, Android gateway tests and preserve original failure logs.
- [x] Implement locale validation, exact string counts, fail-closed incomplete data and Android no-store.
- [x] GREEN controller/repository/HTTP, frontend, app-api and accessibility tests.
- [x] Test real SQL via 303-migration disposable PostgreSQL clone from the separate #1885 lineage candidate; verify current main's category SQL SHA equals the candidate's renamed file.
- [x] Run full lint/typecheck/test/build/backend/frontend/database/security gates; preserve all failures and do not claim overall success.
- [ ] Official exact candidate-SHA Test authenticated E2E, complete CI, immutable image and GitOps release gates: BLOCKED until integrated main is green and deployment authority verified.
