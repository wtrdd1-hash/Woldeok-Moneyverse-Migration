# Stock League WLD Precision Guard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent stock league APIs from returning silently rounded WLD balances and subscription budgets when PostgreSQL NUMERIC values exceed JavaScript's exact integer range.

**Architecture:** Reuse one fail-closed numeric conversion in the repository's read DTO mapping; keep SQL, auth, ledger, migrations and client API contracts unchanged. Existing valid safe integers remain numbers; invalid/out-of-range WLD evidence throws 503.

**Tech Stack:** NestJS, TypeScript, Vitest, PostgreSQL NUMERIC.

- [x] Add Vitest RED cases for season entry fee, leaderboard current asset, whale initial asset and owner subscription allocated budget; assert 503 and no fabricated rounded values.
- [x] Run RED and capture failures.
- [x] Add shared safe WLD conversion in stock-league.repository.ts and replace relevant Number() conversions; reuse in owner participation.
- [x] Run GREEN targeted tests, entire test/typecheck/lint/build/audit and isolated PostgreSQL if possible.
- [ ] Re-fetch latest main and planning; record changed API contract, verification and PR in bilingual worklog; Draft/hold unless every gate passes.
