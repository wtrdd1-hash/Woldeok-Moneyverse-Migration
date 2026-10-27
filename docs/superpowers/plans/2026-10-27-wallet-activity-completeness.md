# Wallet Activity Completeness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Tell a member when a read-only wallet activity response is truncated to 50 entries, without inventing missing history or exposing other members' ledger data.

**Architecture:** The existing PostgreSQL owner-scoped read model fetches exactly one additional row (max 51); the NestJS service emits at most the requested 50 and a boolean proof of more rows. The web activity screen and generated Android app-api contract preserve the truth value. No new tables, migrations, privilege grants, monetary writes, or live configuration changes.

**Tech Stack:** PostgreSQL 17, NestJS, Vitest, Next.js, generated app-api OpenAPI contract.

**Spec:** Existing canonical `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, and `docs/worklog/2026-10-27-wallet-period-filter.md`. This is a bounded correctness improvement to the already implemented period-filter flow.

## Global Constraints
- Always scope by session actor; no caller-provided user ID.
- Keep WLD as integer strings and read-only SQL; do not change immutable migrations.
- Do not imply older rows can be retrieved through an unsupported cursor.
- Keep Android responses private/no-store and use the existing authenticated gateway.
- No main merge or deployment without exact-SHA security, DB, browser, accessibility and GitOps evidence.

## Tasks
1. [x] Write RED backend SQL lookahead and 51-row truncation tests; prove failure on unchanged implementation.
2. [x] Write RED web complete/truncated/unknown tests; prove missing helper fails.
3. [x] Change bounded PostgreSQL read to fetch limit+1 and service to return `recentTransactionsHasMore`, slicing to the requested limit; verify focused tests GREEN.
4. [x] Show truthful status in web and fix misleading “all history” link; preserve Android gateway boolean and generate mobile API schema.
5. [x] Run full typecheck/test/lint/build, security, isolated PostgreSQL and app-api contract checks; document failures without weakening guards.
6. [x] Re-fetch main, check branch/PR conflicts, create HOLD PR and record rollback and exact-SHA Test/Production release block.
