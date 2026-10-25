# Privacy Request Intake Receipts CSV Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and superpowers:test-driven-development task by task.

**Goal:** Give authenticated members a bounded, truthful CSV copy of their own recent privacy-request intake receipts without disclosing other accounts.

**Architecture:** Reuse the existing owner-scoped PostgreSQL function through the validated privacy service. Add a private read-only NestJS snapshot endpoint, a strict Next.js CSV serializer/route, a page link and Android gateway response protection. No new migration or ledger writes.

**Tech Stack:** NestJS, Next.js, TypeScript, Vitest, PostgreSQL 17, pnpm, Android app-api.

**Spec:** `docs/superpowers/specs/2026-10-26-privacy-request-intake-receipts-csv.md`.

## Global Constraints
- Remote `main` SHA `1c5b84a1c45baafcca83f375a6f99698121e9bb5`, new isolated worktree `auto/hourly-a-privacy-request-receipts-20261026-0725`.
- P0 shared live/dev DB, root disk 100%, persistent six frontend failures and security advisories; do not write shared database, change immutable migrations, or deploy.
- Existing unmerged B/C/planning/QA changes are protected. This new export is distinct from proposed full privacy-data package.

## Task 1: Backend snapshot
1. Write a failing controller test proving session actor, fixed 30-row limit and truthful scope.
2. Run focused backend test (RED).
3. Add minimal read-only endpoint with private response headers; run focused test (GREEN).

## Task 2: CSV and UI
1. Write failing CSV tests for validation, formula protection, duplicates, bad dates and row limits.
2. Run focused frontend test (RED).
3. Implement serializer, private route, and keyboard-accessible account link (GREEN).

## Task 3: Android and contracts
1. Write gateway regression test for cookie forwarding and private headers on success/failure (RED).
2. Implement gateway privacy protection, route-map entry and regenerate EN/KO contract artifacts (GREEN).

## Task 4: Verification and hold
1. Run focused tests, full tests, typecheck, lint, build, security, Android contract and isolated PostgreSQL ACL/rollback; record exact SHA.
2. Refresh main and plans mid-task and pre-integration; verify no overlapping PR.
3. If any mandatory gate fails, open Draft PR with QA/Release/Worklog evidence and HOLD. No merge, Test promotion, production changes or branch deletion.
