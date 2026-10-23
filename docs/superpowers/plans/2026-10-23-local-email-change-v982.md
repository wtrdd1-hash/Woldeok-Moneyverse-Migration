# Local Login Email Change Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Each task requires TDD RED→GREEN evidence.

**Goal:** Restore real local-login email change request and confirmation using existing SECURITY DEFINER PostgreSQL functions, and accessible audit activity labels.

**Architecture:** Preserve current backend auth/controller and frontend BFF forms. Correct parameterized SQL invocation of existing migration-215 DB functions and verify reauthentication, token single-use and session revocation on isolated PostgreSQL. No schema or permission changes.

**Tech Stack:** NestJS, Next.js, TypeScript, Vitest, PostgreSQL 17.

**Spec:** `docs/planning/PROJECT_PLAN.md` and current account security contract.

## Global Constraints
- Latest origin/main, independent worktree, no main writes; protect B/QA/A and unmerged changes.
- No direct financial writes, no auth weakening, no Production or Test promotion without all gates.

## Review Focus
- Missing five SQL placeholders; missing confirmation token placeholder; rejection without reauthentication; consumed token reuse; session invalidation; mobile screen-reader activity labels.

## Tasks
1. [ ] Add focused failing backend SQL binding tests and verify RED on original source.
2. [ ] Add real-PostgreSQL email change test and security page label assertions; verify RED.
3. [ ] Correct SQL placeholders and add precise security activity labels; verify focused GREEN.
4. [ ] Run typecheck, build, lint, all unit/integration, real PostgreSQL, security, app-api, E2E where available.
5. [ ] Fetch main, resolve meaningful changes, rerun exact-SHA gates; record EN/KO evidence; PR only if safe; no deployment without release gate.
